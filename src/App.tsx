import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Container from './components/shared/Container';
import ProtectedRoute from './components/shared/ProtectedRoute';
import PasswordChangeGuard from './components/auth/PasswordChangeGuard';
import Navigation from './components/shared/Navigation';
import Login from './components/auth/Login';
import Admin from './components/admin/Admin';
import StudyGuidesList from './components/study-guide/StudyGuidesList';
import StudyGuide from './components/study-guide/StudyGuide';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <Container>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Study guide routes - accessible to everyone */}
            <Route path="/study-guides" element={<StudyGuidesList />} />
            <Route path="/study-guides/:id" element={<StudyGuide />} />

            {/* Admin routes - direct access */}
            <Route path="/admin/*" element={<Admin />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/study-guides" replace />} />
            <Route path="*" element={<Navigate to="/study-guides" replace />} />
          </Routes>
        </Container>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
};

export default App;
