import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import ScheduleSection from '../components/ScheduleSection';
import AnnouncementSection from '../components/admin/AnnouncementSection';
import ReportSection from '../components/admin/ReportSection';

function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [routes, setRoutes] = useState([]);
  const [collectionLogs, setCollectionLogs] = useState([]);

  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [upcomingRoutesCount, setUpcomingRoutesCount] = useState(0);

  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalStatus, setModalStatus] = useState('loading');

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const openModal = (message, status = 'success') => {
    setModalMessage(message);
    setModalStatus('loading');
    setShowModal(true);

    setTimeout(() => {
      setModalStatus(status);
      setTimeout(() => setShowModal(false), 1500);
    }, 800);
  };

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/routes/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
      } else {
        console.error('Failed to fetch route history');
      }
    } catch (err) {
      console.error('Error fetching route history:', err);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingReportsCount(data.pending_reports);
        setUpcomingRoutesCount(data.upcoming_routes);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const fetchCollectionLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/collection-logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCollectionLogs(data);
      } else {
        console.error('Failed to fetch collection logs');
      }
    } catch (err) {
      console.error('Error fetching collection logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchDashboardData();
    fetchCollectionLogs();
  }, []);

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    const routeData = {
      assign_all: true,
      route_name: routeName,
      schedule_date: scheduleDate,
      instructions: instructions,
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(routeData),
      });

      if (res.ok) {
        setRouteName('');
        setScheduleDate('');
        setInstructions('');
        openModal('Route successfully assigned to collectors!', 'success');
        fetchRoutes();
        fetchDashboardData();
      } else {
        const errData = await res.json();
        openModal('Failed to assign route: ' + (errData.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error(err);
      openModal('Error assigning route.', 'error');
    }
  };

  const handleDeleteRoute = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/routes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (res.ok) {
        openModal('Route deleted successfully!', 'success');
        fetchRoutes();
        fetchDashboardData();
      } else {
        const errData = await res.json();
        openModal('Failed to delete route: ' + (errData.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error(err);
      openModal('Error deleting route.', 'error');
    }
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
          <li><a href="#top" onClick={toggleSidebar}>Dashboard</a></li>
          <li><a href="#announcement" onClick={toggleSidebar}>Announcements</a></li>
          <li><a href="#assignroute" onClick={toggleSidebar}>Assign Route</a></li>
          <li><a href="#routehistory" onClick={toggleSidebar}>Route History</a></li>
          <li><a href="#collectionlogs" onClick={toggleSidebar}>Collection Logs</a></li>
          <li><a href="#schedule" onClick={toggleSidebar}>Schedules</a></li>
          <li><a href="#report" onClick={toggleSidebar}>Reports</a></li>
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
        <div id="top" style={{ height: '1px' }}></div>

        <header className="admin-header">
          <h1>Welcome, Barangay Captain</h1>
          <p>Manage schedules, monitor collection, assign routes, instructions, and update announcements.</p>
        </header>

        <section className="admin-cards">
          <div className="card">
            <h3>Pending Reports</h3>
            <p>{pendingReportsCount} new resident concern{pendingReportsCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="card">
            <h3>Upcoming Schedules</h3>
            <p>{upcomingRoutesCount} Assigned Route{upcomingRoutesCount !== 1 ? 's' : ''} Scheduled</p>
          </div>
        </section>

        <section id="announcement">
          <AnnouncementSection />
        </section>

        <section id="assignroute" className="assign-route-container">
          <h2>Assign Route to Collectors</h2>
          <form onSubmit={handleRouteSubmit}>
            <label>Route Name</label>
            <input type="text" value={routeName} onChange={(e) => setRouteName(e.target.value)} required />
            <label>Schedule Date</label>
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} required />
            <label>Instructions</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows="4" required></textarea>
            <button type="submit">Assign Route</button>
          </form>
        </section>

        <section id="routehistory" className="route-history-container">
          <h2>Assigned Route History</h2>
          {loadingRoutes ? (
            <p>Loading route history...</p>
          ) : routes.length === 0 ? (
            <p>No routes have been assigned yet.</p>
          ) : (
            <table className="route-history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Collector</th>
                  <th>Route Name</th>
                  <th>Date</th>
                  <th>Instructions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id}>
                    <td>{route.id}</td>
                    <td>{route.collector?.name || 'All Collectors'}</td>
                    <td>{route.route_name}</td>
                    <td>{route.schedule_date}</td>
                    <td>{route.instructions}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteRoute(route.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section id="collectionlogs" className="collection-logs-container">
          <h2>Collection Logs</h2>
          {loadingLogs ? (
            <p>Loading collection logs...</p>
          ) : collectionLogs.length === 0 ? (
            <p>No collection logs available.</p>
          ) : (
            <div className="collection-logs-wrapper">
              <table className="collection-logs-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Collector</th>
                    <th>Zone</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {collectionLogs.map((log) => {
                    const dateObj = new Date(log.collected_at);
                    return (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>{log.collector_name}</td>
                        <td>{log.zone_code}</td>
                        <td>{dateObj.toLocaleDateString()}</td>
                        <td>{dateObj.toLocaleTimeString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>


        <section id="schedule">
          <ScheduleSection />
        </section>

        <section id="report">
          <ReportSection />
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            {modalStatus === 'loading' && <div className="loader"></div>}
            {modalStatus === 'success' && <div className="checkmark">✔</div>}
            {modalStatus === 'error' && <div className="xmark">✖</div>}
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
