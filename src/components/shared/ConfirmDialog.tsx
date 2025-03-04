import React, { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Button from './Button';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogCard = styled.div`
  width: 100%;
  max-width: 400px;
  text-align: center;
  background: var(--background-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  &:focus {
    outline: none;
  }
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const Message = styled.p`
  margin-bottom: 1.5rem;
  color: var(--text-color);
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

export interface ConfirmDialogProps {
  isOpen?: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose?: () => void;
  onCancel?: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen = true,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  }, [onCancel, onClose]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          if (!focusableElements?.length) return;

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCancel();
        }
      };

      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscape);

      const previouslyFocused = document.activeElement;

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscape);
        if (previouslyFocused instanceof HTMLElement) {
          previouslyFocused.focus();
        }
      };
    }
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  return (
    <Overlay role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-message" onClick={handleCancel}>
      <DialogCard ref={dialogRef} onClick={(e: React.MouseEvent) => e.stopPropagation()} tabIndex={-1}>
        <Title id="dialog-title">{title}</Title>
        <Message id="dialog-message">{message}</Message>
        <Actions>
          <Button variant="secondary" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button ref={confirmButtonRef} variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </Actions>
      </DialogCard>
    </Overlay>
  );
};

export default ConfirmDialog;
