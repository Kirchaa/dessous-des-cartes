#!/usr/bin/env python3
"""
Repack vidéos en 18 packs équilibrés (max 50) et recalcule rank_in_pack.

Entrée :  JSON avec une liste d'objets vidéo (ex: data/videos_packs_rows.json)
          Chaque objet doit avoir, au minimum: video_id (str)
Sortie :  JSON aplati, même objets mais avec pack_number ∈ [1..18] et rank_in_pack recalculé
Usage   :  python repack_videos.py --input data/videos_packs_rows.json --output data/videos.json
Options :  --packs 18 (par défaut), --seed 0 (0 = pas de shuffle)
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Any

def xorshift32(seed: int):
    """Générateur pseudo-aléatoire déterministe (pour shuffle sans dépendances)."""
    x = seed & 0xFFFFFFFF
    while True:
        x ^= (x << 13) & 0xFFFFFFFF
        x ^= (x >> 17) & 0xFFFFFFFF
        x ^= (x << 5) & 0xFFFFFFFF
        yield x / 0x100000000

def shuffle_deterministic(items: List[Any], seed: int) -> List[Any]:
    """Fisher–Yates déterministe."""
    if seed == 0:
        return list(items)  # pas de shuffle
    out = list(items)
    rnd = xorshift32(seed)
    for i in range(len(out) - 1, 0, -1):
        # tirage dans [0..i]
        r = next(rnd)
        j = int(r * (i + 1))
        out[i], out[j] = out[j], out[i]
    return out

def compute_target_sizes(total: int, packs: int) -> List[int]:
    """
    Exemple: total=887, packs=18 => [50, 50, 50, 50, 50, 49, 49, ..., 49] (5×50 + 13×49)
    """
    base = total // packs
    rem = total - base * packs
    return [base + (1 if i < rem else 0) for i in range(packs)]

def repack(videos: List[Dict[str, Any]], packs: int, seed: int) -> List[Dict[str, Any]]:
    # Nettoyage: on garde seulement les vidéos avec un video_id non vide
    clean = [v for v in videos if isinstance(v.get("video_id"), str) and v["video_id"].strip()]
    if not clean:
        raise ValueError("Aucune entrée valide: vérifie la clé 'video_id' dans le JSON.")

    ordered = shuffle_deterministic(clean, seed)
    target = compute_target_sizes(len(ordered), packs)

    counts = [0] * packs
    result: List[Dict[str, Any]] = []
    pack_idx = 0  # 0..packs-1

    # Round-robin en respectant les quotas
    for v in ordered:
        hops = 0
        while counts[pack_idx] >= target[pack_idx] and hops < packs:
            pack_idx = (pack_idx + 1) % packs
            hops += 1
        if hops >= packs and counts[pack_idx] >= target[pack_idx]:
            raise RuntimeError("Tous les packs sont pleins, impossible de placer la vidéo suivante.")

        new_pack = pack_idx + 1
        new_rank = counts[pack_idx] + 1

        nv = dict(v)
        nv["pack_number"] = new_pack
        nv["rank_in_pack"] = new_rank
        result.append(nv)

        counts[pack_idx] += 1
        pack_idx = (pack_idx + 1) % packs  # répartir homogènement

    # Validation + normalisation des rangs (1..taille pack)
    by_pack: Dict[int, List[Dict[str, Any]]] = {}
    for r in result:
        by_pack.setdefault(int(r["pack_number"]), []).append(r)

    final_out: List[Dict[str, Any]] = []
    for p in range(1, packs + 1):
        arr = by_pack.get(p, [])
        arr.sort(key=lambda x: int(x.get("rank_in_pack", 10**9)))
        for i, item in enumerate(arr, start=1):
            item["rank_in_pack"] = i
        if len(arr) > target[p - 1]:
            raise RuntimeError(f"Pack {p} dépasse le quota: {len(arr)} > {target[p-1]}")
        final_out.extend(arr)

    # Petite trace console
    print(f"Répartition finale (packs={packs}): {counts}  (somme={sum(counts)})")
    print(f"Cibles: {target} (somme={sum(target)})")

    return final_out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", "-i", type=Path, required=True, help="Chemin du JSON d'entrée")
    ap.add_argument("--output", "-o", type=Path, required=True, help="Chemin du JSON de sortie")
    ap.add_argument("--packs", "-p", type=int, default=18, help="Nombre de packs (défaut: 18)")
    ap.add_argument("--seed", "-s", type=int, default=0, help="Seed pour mélange (0 = pas de shuffle)")
    args = ap.parse_args()

    data = json.loads(args.input.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Le fichier d'entrée doit contenir un tableau JSON (liste d'objets).")

    out = repack(data, packs=args.packs, seed=args.seed)
    args.output.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ Écrit {len(out)} vidéos dans {args.output}")

if __name__ == "__main__":
    main()
