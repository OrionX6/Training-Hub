import React from 'react';
import styled from 'styled-components';

export type CardVariant = 'default' | 'success' | 'error' | 'warning' | 'elevated' | 'outlined';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  elevation?: 'low' | 'medium' | 'high';
  variant?: CardVariant;
}

interface VariantStyle {
  backgroundColor: string;
  borderColor: string;
  boxShadow?: string;
}

const getVariantStyles = (variant: CardVariant = 'default'): VariantStyle => {
  const styles: Record<CardVariant, VariantStyle> = {
    default: {
      backgroundColor: 'white',
      borderColor: '#e0e0e0',
    },
    success: {
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      borderColor: '#28a745',
    },
    error: {
      backgroundColor: 'rgba(220, 53, 69, 0.1)',
      borderColor: '#dc3545',
    },
    warning: {
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      borderColor: '#ffc107',
    },
    elevated: {
      backgroundColor: 'white',
      borderColor: 'transparent',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: '#e0e0e0',
    },
  };

  return styles[variant];
};

const getElevationShadow = (elevation: 'low' | 'medium' | 'high') => {
  switch (elevation) {
    case 'low':
      return '0 2px 4px rgba(0, 0, 0, 0.05)';
    case 'medium':
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
    case 'high':
      return '0 8px 16px rgba(0, 0, 0, 0.15)';
    default:
      return '0 2px 4px rgba(0, 0, 0, 0.05)';
  }
};

const getHoverShadow = (elevation: 'low' | 'medium' | 'high') => {
  switch (elevation) {
    case 'low':
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
    case 'medium':
      return '0 8px 16px rgba(0, 0, 0, 0.15)';
    case 'high':
      return '0 12px 24px rgba(0, 0, 0, 0.2)';
    default:
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
  }
};

const StyledCard = styled.div<{
  $elevation: 'low' | 'medium' | 'high';
  $variant: CardVariant;
}>`
  background-color: ${props => getVariantStyles(props.$variant).backgroundColor};
  border: 1px solid ${props => getVariantStyles(props.$variant).borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: ${props => {
    const variantStyle = getVariantStyles(props.$variant);
    return variantStyle.boxShadow || getElevationShadow(props.$elevation);
  }};
  transition:
    box-shadow 0.2s ease-in-out,
    transform 0.2s ease-in-out;

  ${props =>
    props.onClick &&
    `
    cursor: pointer;
    
    &:hover {
      box-shadow: ${getHoverShadow(props.$elevation)};
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  `}
`;

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className,
  elevation = 'low',
  variant = 'default',
  ...props
}) => {
  return (
    <StyledCard
      onClick={onClick}
      className={className}
      $elevation={elevation}
      $variant={variant}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
