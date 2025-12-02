import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCode, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Patch } from '@/types/api';

interface ApplyPatchModalProps {
  patch: Patch | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (patch: Patch) => Promise<void>;
}

export default function ApplyPatchModal({
  patch,
  isOpen,
  onClose,
  onApply,
}: ApplyPatchModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!patch) return;

    setIsApplying(true);
    setError(null);

    try {
      await onApply(patch);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply patch');
    } finally {
      setIsApplying(false);
    }
  };

  if (!patch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileCode className="w-5 h-5 text-primary" />
            Apply Patch
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review the changes before applying them to your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Path */}
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
            <span className="text-sm text-muted-foreground">File:</span>
            <code className="text-sm text-primary font-mono">{patch.filePath}</code>
          </div>

          {/* Description */}
          {patch.description && (
            <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-sm text-foreground">{patch.description}</p>
            </div>
          )}

          {/* Patch Preview */}
          <div className="rounded-lg overflow-hidden border border-border">
            <div className="px-3 py-2 bg-secondary text-xs text-muted-foreground border-b border-border">
              Diff Preview
            </div>
            <pre className="p-4 bg-background/50 overflow-x-auto font-mono text-xs max-h-80 scrollbar-thin">
              <code className="text-foreground">{patch.content}</code>
            </pre>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              This will modify the file in your project. A backup will be created automatically.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <X className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isApplying} className="gap-2">
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Apply Patch
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
