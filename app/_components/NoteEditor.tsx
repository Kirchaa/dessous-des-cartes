'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';

interface NoteEditorProps {
  videoId: string;
  initialContent: string;
  onSave: (content: string) => void;
}

const DEFAULT_TEMPLATE = `# Résumé
[Résumé de la vidéo en quelques phrases]

# Idées clés
- Point important 1
- Point important 2
- Point important 3

# Acteurs / Lieux
-
-

# Chronologie
-
-

# Concepts liés au programme
-
-

# Sources complémentaires
-
- `;

export default function NoteEditor({ videoId, initialContent, onSave }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent || DEFAULT_TEMPLATE);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(initialContent || DEFAULT_TEMPLATE);
  }, [initialContent]);

  useEffect(() => {
    setHasChanges(content !== (initialContent || DEFAULT_TEMPLATE));
  }, [content, initialContent]);

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (hasChanges) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, hasChanges]);

  const handleSave = () => {
    setIsSaving(true);
    onSave(content);

    setTimeout(() => {
      setIsSaving(false);
      setJustSaved(true);
      setHasChanges(false);
      setTimeout(() => setJustSaved(false), 2000);
    }, 300);
  };

  const charCount = content.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notes de fiche</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {charCount} caractères
          </span>
          {justSaved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Enregistré
            </span>
          )}
          {hasChanges && !justSaved && (
            <span className="text-sm text-yellow-600">
              Non enregistré
            </span>
          )}
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[400px] font-mono text-sm"
        placeholder="Commencez à prendre des notes..."
      />

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer maintenant'}
        </Button>
      </div>
    </div>
  );
}
