import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Mock the supabase client
jest.mock('./config/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      }),
      getSession: () => ({
        data: { session: null }
      })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: null,
            error: null
          })
        })
      })
    })
  }
}));

// Wrap component with AuthProvider
const renderWithAuth = (component: React.ReactNode) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('App', () => {
  it('renders without crashing', () => {
    renderWithAuth(<App />);
    expect(screen.getByText('Loading study guides...')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('includes the toast container', () => {
    renderWithAuth(<App />);
    expect(document.querySelector('.Toastify')).toBeInTheDocument();
  });

  it('renders the study guide route by default', () => {
    renderWithAuth(<App />);
    expect(screen.getByText('Loading study guides...')).toBeInTheDocument();
  });
});
