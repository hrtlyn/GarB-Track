import React, { useEffect, useState } from 'react';
import './GuestDashboard.css';
import GuestAnnouncementSection from '../components/GuestAnnouncementSection';
import GuestScheduleSection from '../components/GuestScheduleSection';
import ReportForm from '../components/ReportForm';

function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'; // prevent scroll when sidebar is open
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [sidebarOpen]);

  return (
    <div className="guest-container">
      {/* Toggle Button */}
      <button id="sidebarToggle" className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? '✖' : '☰'}
      </button>

      {/* Dark Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`guest-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
        id="guestSidebar"
      >
        <div className="guest-logo-centered">
          <img src="/logogarb1.png" alt="GarB-Track Logo" className="logo-img-large" />
          <h2 className="sidebar-title">GarB-Track</h2>
        </div>
        <ul className="sidebar-menu" onClick={closeSidebar}>
          <li><a href="#top">Dashboard</a></li>
          <li><a href="#schedule">Collection Schedules</a></li>
          <li><a href="#announcements">Announcements</a></li>
          <li><a href="#report">Report</a></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="guest-main-content">
        <div id="top" style={{ height: '1px' }}></div>

        <header className="guest-header">
          <h1>Welcome to GarB-Track</h1>
          <p>Monitor collection schedules, stay informed, and report garbage concerns in Barangay Mangin.</p>
        </header>

        <section id="announcements" className="guest-section">
          <h2 className="section-title">Announcement Board</h2>
          <GuestAnnouncementSection />
        </section>

        <section id="schedule" className="guest-section">
          <h2 className="section-title">Collection Schedules</h2>
          <GuestScheduleSection />
        </section>

        <section id="report" className="guest-section">
          <h2 className="section-title">Report a Garbage Concern</h2>
          <ReportForm />
        </section>
      </main>
    </div>
  );
}

export default HomePage;
