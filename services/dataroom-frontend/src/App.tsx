import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import  Login  from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';

const App: React.FC = () => {
  const { accessToken } = useAuthContext();
  const isAuthenticated = !!accessToken; // Assuming accessToken is present when authenticated

  console.log(accessToken)

  return (
    <Router>
    <Routes>
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
      />
      {/* Redirect to login for any other routes */}
      <Route path="/*" element={<Navigate to="/login" />} />
    </Routes>
  </Router>
  );
};

export default App;
