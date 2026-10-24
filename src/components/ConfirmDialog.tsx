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

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <AlertDialogContent className="no-print">
        <AlertDialogHeader className="flex flex-row items-start gap-3.5 text-left space-y-0">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
              isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 text-amber-600'
            )}
          >
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1 space-y-1.5">
            <AlertDialogTitle className="text-base font-semibold leading-snug">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 pt-3 border-t border-border gap-2">
          <AlertDialogCancel onClick={onCancel} className="mt-0">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              buttonVariants({ variant: isDestructive ? 'destructive' : 'default' })
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
