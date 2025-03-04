import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

import Navigation from './components/shared/Navigation';
import Container from './components/shared/Container';
import StudyGuide from './components/study-guide/StudyGuide';
import StudyGuidesList from './components/study-guide/StudyGuidesList';
import QuizAccess from './components/quiz/QuizAccess';
import Admin from './components/admin/Admin';
import Login from './components/auth/Login';
import ChangePassword from './components/auth/ChangePassword';
import PasswordChangeGuard from './components/auth/PasswordChangeGuard';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { UserRole } from './types';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: var(--background-color);
`;

const MainContent = styled.main`
  padding: 2rem 0;
`;

const adminRoles: UserRole[] = ['admin', 'super_admin'];

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <ToastContainer position="top-right" autoClose={3000} />
        <Navigation />
        <MainContent>
          <Container>
            <Routes>
              <Route path="/" element={<Navigate to="/study-guides" replace />} />

              <Route path="/study-guides" element={<StudyGuidesList />} />
              <Route path="/study-guides/:id" element={<StudyGuide />} />

              <Route
                path="/quiz"
                element={
                  <PasswordChangeGuard>
                    <QuizAccess />
                  </PasswordChangeGuard>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={adminRoles}>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              <Route path="/login" element={<Login />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="*" element={<Navigate to="/study-guides" replace />} />
            </Routes>
          </Container>
        </MainContent>
      </AppContainer>
    </Router>
  );
};

export default App;
