import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? '✖' : '☰'}
      </button>

      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo-centered">
          <img src="/logogarb1.png" alt="GarB-Track Logo" className="logo-img-large" />
          <h2 className="sidebar-title1">GarB-Track</h2>
        </div>
        <ul>
          <li><Link to="/admin" onClick={toggleSidebar}>Dashboard</Link></li>
          <li><Link to="/admin/announcements" onClick={toggleSidebar}>Announcements</Link></li>
          <li><Link to="/admin/assign-route" onClick={toggleSidebar}>Assign Route</Link></li>
          <li><Link to="/admin/collection-logs" onClick={toggleSidebar}>Collection Logs</Link></li>
          <li><Link to="/admin/schedules" onClick={toggleSidebar}>Schedules</Link></li>
          <li><Link to="/admin/reports" onClick={toggleSidebar}>Reports</Link></li>
          <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
        </ul>
      </aside>

      {window.innerWidth <= 768 && (
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
          onClick={toggleSidebar}
        ></div>
      )}

      <main className="main-content">
        <Outlet /> {/* 🔹 Renders whichever admin subpage is active */}
      </main>
    </div>
  );
}

export default AdminDashboard;
