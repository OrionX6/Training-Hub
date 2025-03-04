import React from 'react';
import styled from 'styled-components';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const TextareaContainer = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: var(--text-color);
  margin-bottom: 0.25rem;
`;

const StyledTextarea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
  background-color: white;
  border: 1px solid ${props => (props.$hasError ? 'var(--error-color)' : '#e0e0e0')};
  border-radius: 4px;
  transition: all 0.2s;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => (props.$hasError ? 'var(--error-color)' : 'var(--primary-color)')};
    box-shadow: 0 0 0 3px
      ${props => (props.$hasError ? 'rgba(220, 53, 69, 0.25)' : 'rgba(28, 68, 127, 0.25)')};
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #6c757d;
  }
`;

const HelperText = styled.div<{ $isError?: boolean }>`
  font-size: 0.75rem;
  color: ${props => (props.$isError ? 'var(--error-color)' : '#6c757d')};
  margin-top: 0.25rem;
`;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    return (
      <TextareaContainer $fullWidth={fullWidth} className={className}>
        {label && <Label>{label}</Label>}
        <StyledTextarea ref={ref} $hasError={!!error} aria-invalid={!!error} {...props} />
        {(error || helperText) && <HelperText $isError={!!error}>{error || helperText}</HelperText>}
      </TextareaContainer>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
