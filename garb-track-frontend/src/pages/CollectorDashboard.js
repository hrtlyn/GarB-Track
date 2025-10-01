import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './CollectorDashboard.css';
import QRScannerComponent from '../components/QRScannerComponent';

function CollectorDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalStatus, setModalStatus] = useState('loading'); 

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const collector = JSON.parse(localStorage.getItem('user'));
  const collectorName = collector?.name || 'Collector';

  const fetchRoutes = useCallback(async () => {
    try {
      setLoadingRoutes(true);
      const res = await fetch("http://127.0.0.1:8000/api/routes", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch routes: ${res.status}`);
      const data = await res.json();
      setRoutes(data);
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setLoadingRoutes(false);
    }
  }, [token]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch("http://127.0.0.1:8000/api/collection-logs", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchRoutes();
      fetchLogs();
      const interval = setInterval(() => {
        fetchRoutes();
        fetchLogs();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchRoutes, fetchLogs, token]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
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

  // 🔹 Filtered data
  const filteredRoutes = routes.filter(route => {
    const matchDate = filterDate ? route.schedule_date === filterDate : true;
    const matchSearch = searchTerm
      ? route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        route.instructions.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchDate && matchSearch;
  });

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.collected_at).toISOString().split('T')[0];
    const matchDate = filterDate ? logDate === filterDate : true;
    const matchSearch = searchTerm
      ? log.zone_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.collector_name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchDate && matchSearch;
  });

  return (
    <div className="collector-container">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? '✖' : '☰'}
      </button>

      <aside className={`collector-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo-centered">
          <img src="/logogarb1.png" alt="GarB-Track Logo" className="logo-img-large" />
          <h2 className="sidebar-title1">GarB-Track</h2>
        </div>
        <ul>
          <li><a href="#assigned" onClick={toggleSidebar}>Assigned Routes & Instructions</a></li>
          <li><a href="#scan" onClick={toggleSidebar}>Scan QR</a></li>
          <li><a href="#logs" onClick={toggleSidebar}>Collection Logs</a></li>
          <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
        </ul>
      </aside>

      <div
        className={`sidebar-overlay ${isSidebarOpen && window.innerWidth <= 768 ? 'visible' : ''}`}
        onClick={toggleSidebar}
      ></div>

      <main className="collector-main-content">
        <header className="collector-header">
          <h1>Welcome, {collectorName} 👋</h1>
          <p>View your assigned zones, follow instructions, and confirm collections.</p>
        </header>

        {/* 🔹 Filter & Search Inputs */}
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

        {/* Assigned Routes */}
        <section id="assigned" className="collector-section">
          <h2>Assigned Routes & Instructions</h2>
          {loadingRoutes ? (
            <p>Loading assigned routes...</p>
          ) : filteredRoutes.length === 0 ? (
            <p>No routes found.</p>
          ) : (
            filteredRoutes.map(route => (
              <div className="card" key={route.id}>
                <h3>{route.route_name}</h3>
                <p>Scheduled: {new Date(route.schedule_date).toDateString()}</p>
                <ul>
                  <li className="instructions-text">{route.instructions}</li>
                </ul>
              </div>
            ))
          )}
        </section>

        {/* QR Scanner */}
        <section id="scan" className="collector-section">
          <h2>QR Code Scanner</h2>
          {!scannerOpen ? (
            <button className="blue-btn" onClick={() => setScannerOpen(true)}>Open Scanner</button>
          ) : (
            <div>
              <QRScannerComponent
                onScanSuccess={(zoneCode, success = true) => {
                  if (success && zoneCode) {
                    openModal(`${zoneCode} collection logged successfully!`, 'success');
                    fetchLogs();
                  } else {
                    openModal('Failed to log collection.', 'error');
                  }
                }}
              />
              <button className="blue-btn" style={{ marginTop: '10px' }} onClick={() => setScannerOpen(false)}>
                Close Scanner
              </button>
            </div>
          )}
        </section>

        {/* Collection Logs */}
        <section id="logs" className="collector-section">
          <h2>Collection Logs</h2>
          {loadingLogs ? (
            <p>Loading logs...</p>
          ) : filteredLogs.length === 0 ? (
            <p>No collections found.</p>
          ) : (
            <div className="logs-table-wrapper">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Collector</th>
                    <th>Zone</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => {
                    const dateObj = new Date(log.collected_at);
                    return (
                      <tr key={log.id}>
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

export default CollectorDashboard;
