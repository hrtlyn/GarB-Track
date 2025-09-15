import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute'; 
import TestQR from './pages/TestQR';
import ZoneQR from './pages/ZoneQR';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Add this line to test QR */}
        <Route path="/test-qr" element={<TestQR />} />
        <Route path="/zone-qr" element={<ZoneQR />} />
        {/* Protected routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/collector"
          element={
            <PrivateRoute role="collector">
              <CollectorDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
