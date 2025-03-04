import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the AuthContext provider
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock the Navigation component
jest.mock('./components/shared/Navigation', () => ({
  __esModule: true,
  default: () => <nav data-testid="navigation">Navigation</nav>,
}));

// Mock StudyGuide component
jest.mock('./components/study-guide/StudyGuide', () => ({
  __esModule: true,
  default: () => <div data-testid="study-guide">Study Guide</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('includes the toast container', () => {
    render(<App />);
    expect(document.querySelector('.Toastify')).toBeInTheDocument();
  });

  it('renders the study guide route by default', () => {
    render(<App />);
    expect(screen.getByTestId('study-guide')).toBeInTheDocument();
  });

  // Add more tests as needed for different routes and components
});
