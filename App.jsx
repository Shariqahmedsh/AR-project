import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import IntroductionPage from './pages/IntroductionPage';
import Dashboard from './pages/Dashboard';
import ARScenarios from './pages/ARScenarios';
import Quiz from './pages/Quiz';
import Game from './pages/Game';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <>
      <Helmet>
        <title>AR Cybersecurity Awareness Platform</title>
        <meta name="description" content="Augmented Reality as a Catalyst for Cybersecurity Awareness: Empowering Digital Citizens in a Connected World" />
      </Helmet>
      <Router>
        <div className="min-h-screen cyber-grid">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/introduction" 
              element={
                <ProtectedRoute>
                  <IntroductionPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ar-scenarios" 
              element={
                <ProtectedRoute>
                  <ARScenarios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz/:scenario?" 
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <Game />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;