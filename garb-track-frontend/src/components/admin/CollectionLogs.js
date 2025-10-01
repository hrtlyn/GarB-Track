import React, { useState, useEffect } from 'react';

function CollectionLogs() {
  const [collectionLogs, setCollectionLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCollectionLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/collection-logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCollectionLogs(data);
        setFilteredLogs(data);
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
    fetchCollectionLogs();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let logs = [...collectionLogs];

    // Filter by date
    if (filterDate) {
      logs = logs.filter(log => {
        const logDate = new Date(log.collected_at).toISOString().split('T')[0];
        return logDate === filterDate;
      });
    }

    // Search by collector name or zone
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      logs = logs.filter(
        log =>
          log.collector_name.toLowerCase().includes(term) ||
          log.zone_code.toLowerCase().includes(term)
      );
    }

    setFilteredLogs(logs);
  }, [collectionLogs, filterDate, searchTerm]);

  return (
    <div className="collection-logs-container">
      <h2>Collection Logs</h2>

      {/* Filters */}
      <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Collector or Zone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loadingLogs ? (
        <p>Loading collection logs...</p>
      ) : filteredLogs.length === 0 ? (
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
              {filteredLogs.map((log) => {
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
    </div>
  );
}

export default CollectionLogs;
