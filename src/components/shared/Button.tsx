import React from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

interface ButtonProps extends ButtonBaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
}

interface AnchorButtonProps extends ButtonBaseProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as: 'a';
}

type CombinedButtonProps = ButtonProps | AnchorButtonProps;

const getVariantStyles = (variant: ButtonVariant = 'primary') => {
  const styles = {
    primary: css`
      background-color: var(--primary-color);
      color: white;
      border: none;

      &:hover:not(:disabled) {
        background-color: #163764;
      }

      &:disabled {
        background-color: #ccc;
      }
    `,
    secondary: css`
      background-color: transparent;
      color: var(--text-color);
      border: 1px solid #e0e0e0;

      &:hover:not(:disabled) {
        background-color: rgba(0, 0, 0, 0.05);
      }

      &:disabled {
        color: #ccc;
        border-color: #e0e0e0;
      }
    `,
    danger: css`
      background-color: var(--error-color);
      color: white;
      border: none;

      &:hover:not(:disabled) {
        background-color: #c82333;
      }

      &:disabled {
        background-color: #ffa6a6;
      }
    `,
    text: css`
      background-color: transparent;
      color: var(--text-color);
      border: none;
      padding: 0;

      &:hover:not(:disabled) {
        text-decoration: underline;
      }

      &:disabled {
        color: #ccc;
      }
    `,
  };

  return styles[variant];
};

const getSizeStyles = (size: ButtonSize = 'medium') => {
  const styles = {
    small: css`
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    `,
    medium: css`
      padding: 0.5rem 1rem;
      font-size: 1rem;
    `,
    large: css`
      padding: 0.75rem 1.5rem;
      font-size: 1.125rem;
    `,
  };

  return styles[size];
};

interface StyledComponentProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $loading: boolean;
}

const StyledComponent = styled.button<StyledComponentProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  cursor: ${props => (props.$loading || props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease-in-out;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  opacity: ${props => (props.$loading || props.disabled ? 0.7 : 1)};
  pointer-events: ${props => (props.$loading || props.disabled ? 'none' : 'auto')};
  text-decoration: none;

  ${props => getVariantStyles(props.$variant)}
  ${props => getSizeStyles(props.$size)}
  
  svg {
    margin-right: ${props => (props.children ? '0.5rem' : '0')};
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, CombinedButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      icon,
      as = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <StyledComponent
        as={as}
        ref={ref as any}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        $loading={loading}
        {...props}
      >
        {loading ? <LoadingSpinner /> : icon}
        {children}
      </StyledComponent>
    );
  },
);

Button.displayName = 'Button';

export default Button;
