import React, { forwardRef } from 'react';
import styled from 'styled-components';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{
    value: string;
    label: string;
  }>;
}

const SelectWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  color: var(--text-color);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StyledSelect = styled.select<{ $hasError: boolean; $fullWidth: boolean }>`
  appearance: none;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
  background-color: white;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23333' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  border: 1px solid ${props => (props.$hasError ? 'var(--error-color)' : '#e0e0e0')};
  border-radius: 4px;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

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

  & option {
    color: var(--text-color);
  }
`;

const ErrorText = styled.div`
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, fullWidth = false, options, ...props }, ref) => {
    const id = props.id || props.name;

    return (
      <SelectWrapper $fullWidth={fullWidth}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <StyledSelect ref={ref} id={id} $hasError={!!error} $fullWidth={fullWidth} {...props}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        {error && <ErrorText>{error}</ErrorText>}
      </SelectWrapper>
    );
  }
);

Select.displayName = 'Select';

export default Select;
