import React, { useEffect, useState } from 'react';
import './GuestDashboard.css';
import GuestAnnouncementSection from '../components/GuestAnnouncementSection';
import GuestScheduleSection from '../components/GuestScheduleSection';
import ReportForm from '../components/ReportForm';

function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter and search state
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : 'auto';
  }, [sidebarOpen]);

  return (
    <div className="guest-container">
      {/* Toggle Button */}
      <button id="sidebarToggle" className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? '✖' : '☰'}
      </button>

      {/* Dark Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <aside className={`guest-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} id="guestSidebar">
        <div className="guest-logo-centered">
          <img src="/logogarb1.png" alt="GarB-Track Logo" className="logo-img-large" />
          <h2 className="sidebar-title">GarB-Track</h2>
        </div>
        <ul className="sidebar-menu" onClick={closeSidebar}>
          <li><a href="#top">Dashboard</a></li>
          <li><a href="#announcements">Announcements</a></li>
          <li><a href="#schedule">Collection Schedules</a></li>
          <li><a href="#report">Report</a></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="guest-main-content">
        <div id="top" style={{ height: '1px' }}></div>

        <header className="guest-header">
          <h1>Welcome to GarB-Track 👋</h1>
          <p>Monitor collection schedules, stay informed, and report garbage concerns in Barangay Mangin.</p>
        </header>

        {/* 🔹 Filter & Search Line */}
          <div
              className="filter-search-container"
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem',
                maxWidth: '100%',
              }}
            >
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ flex: 1 }} // 50%
              />
              <input
                type="text"
                placeholder="Search announcements or schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }} // 50%
              />
            </div>

        <section id="announcements" className="guest-section">
          <h2 className="section-title">Announcement Board</h2>
          <GuestAnnouncementSection filterDate={filterDate} searchTerm={searchTerm} />
        </section>

        <section id="schedule" className="guest-section">
          <h2 className="section-title">Collection Schedules</h2>
          <GuestScheduleSection filterDate={filterDate} searchTerm={searchTerm} />
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
