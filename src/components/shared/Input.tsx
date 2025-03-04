import React from 'react';
import styled, { css } from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const InputContainer = styled.div<{ $fullWidth?: boolean }>`
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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{ $hasError?: boolean; $hasIcon?: boolean }>`
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
  background-color: white;
  border: 1px solid ${props => (props.$hasError ? 'var(--error-color)' : '#e0e0e0')};
  border-radius: 4px;
  transition: all 0.2s;
  ${props =>
    props.$hasIcon &&
    css`
      padding-left: 2.5rem;
    `}

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

const IconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HelperText = styled.div<{ $isError?: boolean }>`
  font-size: 0.75rem;
  color: ${props => (props.$isError ? 'var(--error-color)' : '#6c757d')};
  margin-top: 0.25rem;
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, icon, className, ...props }, ref) => {
    return (
      <InputContainer $fullWidth={fullWidth} className={className}>
        {label && <Label>{label}</Label>}
        <InputWrapper>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <StyledInput
            ref={ref}
            $hasError={!!error}
            $hasIcon={!!icon}
            aria-invalid={!!error}
            {...props}
          />
        </InputWrapper>
        {(error || helperText) && <HelperText $isError={!!error}>{error || helperText}</HelperText>}
      </InputContainer>
    );
  },
);

Input.displayName = 'Input';

export default Input;
