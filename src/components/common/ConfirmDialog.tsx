import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-900 mb-2">{title}</h4>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
