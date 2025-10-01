import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import ZoneQR from './pages/ZoneQR';

// Admin sub-pages
import Announcements from './components/admin/AnnouncementSection';
import AssignRoute from './components/admin/AssignRoute';
import CollectionLogs from './components/admin/CollectionLogs';
import Schedules from './components/ScheduleSection';
import Reports from './components/admin/ReportSection';
import DashboardHome from "./components/admin/DashboardHome"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/zone-qr" element={<ZoneQR />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="assign-route" element={<AssignRoute />} />
          <Route path="collection-logs" element={<CollectionLogs />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Protected Collector Routes */}
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
