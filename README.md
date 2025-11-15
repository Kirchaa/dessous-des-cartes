# Le Dessous des Cartes - Fichage de Vidéos

Plateforme web client-side pour ficher et organiser les vidéos YouTube de la chaîne "Le Dessous des Cartes". Aucune base de données externe ni backend requis.

## Caractéristiques

- **100% client-side** : Toutes les données sont stockées localement dans le navigateur (localStorage)
- **Catalogue complet** : Parcourez, recherchez et filtrez toutes les vidéos
- **Édition de fiches** : Prenez des notes structurées avec autosave automatique
- **Gestion par packs** : Organisez les vidéos par élève/pack
- **Bibliothèque** : Consultez toutes vos fiches terminées
- **Suivi de progression** : Statistiques et barres de progression

## Stack technique

- **Framework** : Next.js 13 (App Router)
- **UI** : React + TypeScript
- **Styles** : Tailwind CSS + shadcn/ui
- **Données** : JSON statique importé
- **Stockage** : localStorage (navigateur)
- **YouTube** : Intégration via iframe (pas d'API key nécessaire)

## Installation

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
/app
  ├── page.tsx                    # Page d'accueil avec progression globale
  ├── /videos
  │   ├── page.tsx               # Catalogue avec recherche/filtres
  │   └── /[video_id]
  │       └── page.tsx           # Détail vidéo + lecteur + éditeur de fiche
  ├── /packs
  │   └── page.tsx               # Sélection élève + progression pack
  ├── /library
  │   └── page.tsx               # Bibliothèque de fiches terminées
  ├── /_components
  │   ├── Navigation.tsx         # Menu de navigation
  │   ├── VideoCard.tsx          # Carte vidéo avec miniature
  │   ├── VideoFilters.tsx       # Filtres de recherche
  │   ├── NoteEditor.tsx         # Éditeur de notes Markdown
  │   ├── PackSelector.tsx       # Sélecteur d'élève
  │   └── ProgressBar.tsx        # Barre de progression
  └── /_lib
      ├── types.ts               # Types TypeScript
      ├── storage.ts             # Fonctions localStorage
      ├── filters.ts             # Fonctions de filtrage/tri
      └── format.ts              # Formatage dates/durées

/data
  ├── videos.json                # Liste des vidéos (887 entrées)
  ├── students.json              # Liste des élèves (18)
```

## Configuration des données

### Remplacer les vidéos mock

Le fichier `data/videos.json` contient actuellement ~30 vidéos de démonstration. Pour utiliser votre propre liste :

1. Remplacez le contenu de `data/videos.json` par votre export CSV converti en JSON
2. Chaque entrée doit respecter ce format :

```json
{
  "pack_number": 3,
  "rank_in_pack": 12,
  "video_id": "abcdEFGH123",
  "title": "Les détroits stratégiques",
  "url": "https://www.youtube.com/watch?v=abcdEFGH123",
  "published_at": "2023-10-12",
  "duration_iso": "PT12M34S",
  "duration_s": 754
}
```

### Modifier les élèves

Le fichier `data/students.json` contient 18 élèves par défaut. Modifiez ce fichier pour :
- Ajouter/supprimer des élèves
- Changer les noms
- Assigner différents pack_number

```json
[
  {"id": "s01", "name": "Élève 1", "pack_number": 1},
  {"id": "s02", "name": "Élève 2", "pack_number": 2}
]
```

## Fonctionnalités détaillées

### Page d'accueil `/`
- Vue d'ensemble de la progression globale
- Statistiques : vidéos à faire, en cours, terminées
- Accès rapide aux sections principales

### Catalogue `/videos`
- Liste paginée de toutes les vidéos (50 par page)
- Recherche par titre
- Filtres :
  - Par pack (1-18)
  - Par durée (< 10min, 10-15min, > 15min)
  - Par date de publication
- Tri par date, durée ou titre (croissant/décroissant)
- Badges de statut (À faire, En cours, Terminé)

### Détail vidéo `/videos/[video_id]`
- Lecteur YouTube embarqué
- Métadonnées : pack, rang, durée, date
- Éditeur de notes structuré avec template :
  - Résumé
  - Idées clés
  - Acteurs / Lieux
  - Chronologie
  - Concepts liés au programme
  - Sources complémentaires
- Autosave automatique après 2 secondes
- Gestion du statut (todo/in_progress/done)
- Bouton "Marquer comme terminé"

### Packs `/packs`
- Sélecteur d'élève (dropdown)
- Progression du pack sélectionné
- Liste des vidéos du pack avec statuts
- Statistiques du pack

### Bibliothèque `/library`
- Liste de toutes les fiches terminées
- Aperçu des notes (premières lignes)
- Recherche et filtres
- Tri par date de modification

## Clés localStorage utilisées

Le système utilise les préfixes suivants dans localStorage :

- `notes:{video_id}` : Contenu de la fiche
- `notes_updated_at:{video_id}` : Date de dernière modification
- `status:{video_id}` : Statut (todo/in_progress/done)

### Nettoyer les données

Pour réinitialiser toutes les données :

```javascript
// Dans la console du navigateur
Object.keys(localStorage)
  .filter(key => key.startsWith('notes:') || key.startsWith('status:'))
  .forEach(key => localStorage.removeItem(key));
```

## Build pour production

```bash
npm run build
npm run start
```

Le projet est configuré pour l'export statique (`output: 'export'` dans `next.config.js`).

## Limitations

- **Stockage local** : Les données sont liées au navigateur. Elles ne sont pas synchronisées entre appareils.
- **Capacité** : localStorage limite à ~5-10MB par domaine (largement suffisant pour des notes texte)
- **Pas de collaboration** : Outil mono-utilisateur
- **YouTube** : Nécessite une connexion Internet pour charger les vidéos

## Évolutions possibles

Pour aller plus loin :
1. Export/Import des fiches (JSON, Markdown)
2. Système de tags personnalisés
3. Recherche plein texte dans les notes
4. Statistiques avancées (temps passé, graphiques)
5. Mode hors-ligne avec Service Worker
6. Backend optionnel pour synchronisation multi-appareils

## Contribution

Le code est structuré de manière modulaire :
- Composants réutilisables dans `/_components`
- Logique métier dans `/_lib`
- Pages Next.js dans `/app`

Pour ajouter des fonctionnalités, suivez ces conventions.

## Licence

Projet éducatif.

📦project
 ┣ 📂.bolt
 ┣ 📂.next
 ┣ 📂app
 ┃ ┣ 📂auth
 ┃ ┃ ┣ 📂callback
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┗ 📂login
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂library
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂login
 ┃ ┣ 📂logout
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂packs
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂videos
 ┃ ┃ ┣ 📂[video_id]
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂_components
 ┃ ┃ ┣ 📜Navigation.tsx
 ┃ ┃ ┣ 📜NoteEditor.tsx
 ┃ ┃ ┣ 📜PacksClient.tsx
 ┃ ┃ ┣ 📜PackSelector.tsx
 ┃ ┃ ┣ 📜ProgressBar.tsx
 ┃ ┃ ┣ 📜VideoCard.tsx
 ┃ ┃ ┣ 📜VideoDetailClient.tsx
 ┃ ┃ ┣ 📜VideoFilters.tsx
 ┃ ┃ ┗ 📜VideosClient.tsx
 ┃ ┣ 📂_lib
 ┃ ┃ ┣ 📂supabase
 ┃ ┃ ┃ ┣ 📜client.ts
 ┃ ┃ ┃ ┣ 📜middleware.ts
 ┃ ┃ ┃ ┗ 📜server.ts
 ┃ ┃ ┣ 📜filters.ts
 ┃ ┃ ┣ 📜format.ts
 ┃ ┃ ┣ 📜notes.ts
 ┃ ┃ ┣ 📜storage.ts
 ┃ ┃ ┗ 📜types.ts
 ┃ ┣ 📜globals.css
 ┃ ┣ 📜layout.tsx
 ┃ ┗ 📜page.tsx
 ┣ 📂components
 ┃ ┗ 📂ui
 ┣ 📂data
 ┃ ┣ 📜students.json
 ┃ ┣ 📜Untitled-1.py
 ┃ ┣ 📜videos.json
 ┃ ┗ 📜videos2.json
 ┣ 📂hooks
 ┃ ┗ 📜use-toast.ts
 ┣ 📂lib
 ┃ ┗ 📜utils.ts
 ┣ 📂node_modules
 ┣ 📜.env
 ┣ 📜.eslintrc.json
 ┣ 📜.gitignore
 ┣ 📜components.json
 ┣ 📜middleware.ts
 ┣ 📜next-env.d.ts
 ┣ 📜next.config.js
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜postcss.config.js
 ┣ 📜README.md
 ┣ 📜tailwind.config.ts
 ┗ 📜tsconfig.json# dessous-des-cartes
