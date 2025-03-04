import React from 'react';
import styled from 'styled-components';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  verticalPadding?: boolean;
}

const getMaxWidth = (size: ContainerProps['size'] = 'medium') => {
  const sizes = {
    small: '600px',
    medium: '800px',
    large: '1200px',
  };
  return sizes[size];
};

const StyledContainer = styled.div<{
  $size: ContainerProps['size'];
  $verticalPadding: boolean;
}>`
  width: 100%;
  max-width: ${props => getMaxWidth(props.$size)};
  margin: 0 auto;
  padding: ${props => (props.$verticalPadding ? '2rem' : '0')} 1rem;

  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  @media (min-width: 1024px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`;

const Container: React.FC<ContainerProps> = ({
  children,
  size = 'medium',
  verticalPadding = true,
  ...props
}) => {
  return (
    <StyledContainer $size={size} $verticalPadding={verticalPadding} {...props}>
      {children}
    </StyledContainer>
  );
};

export default Container;
