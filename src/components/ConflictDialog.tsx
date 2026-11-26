import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { IconAlertTriangle as AlertTriangle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface ConflictDialogProps {
  isOpen: boolean;
  resumeTitle: string;
  onReload: () => void;
  onKeepMine: () => void;
}

/**
 * Shown when a resume was updated elsewhere (for example by an AI agent
 * through Cevee MCP) while the browser still holds an older version.
 */
export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  isOpen,
  resumeTitle,
  onReload,
  onKeepMine,
}) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // The explicit actions below decide the outcome. Ignoring Radix's
          // close event prevents "Keep mine" from also triggering a reload.
          return;
        }
      }}
    >
      <AlertDialogContent className="no-print">
        <AlertDialogHeader className="flex flex-row items-start gap-3.5 text-left space-y-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-50 text-amber-600">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1 space-y-1.5">
            <AlertDialogTitle className="text-base font-semibold leading-snug">
              This resume changed elsewhere
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              &quot;{resumeTitle}&quot; was updated by another session or by an AI agent through
              Cevee MCP. Reload the latest version, or keep your current edits and overwrite it.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 pt-3 border-t border-border gap-2">
          <AlertDialogCancel onClick={onReload} className="mt-0">
            Reload latest
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onKeepMine}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            Keep mine
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
