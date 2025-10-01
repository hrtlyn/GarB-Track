import React, { useEffect, useState } from 'react';
import '../pages/GuestDashboard.css';
import api from '../api';

function GuestAnnouncementSection({ filterDate = '', searchTerm = '' }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch announcements from Laravel backend
    api.get('/announcements')
      .then(response => {
        setAnnouncements(response.data || []); // ensure array
      })
      .catch(error => {
        console.error('Error fetching announcements:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Helper function to format timestamp nicely
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // 🔹 Filtered announcements
  const filteredAnnouncements = (announcements || []).filter(a => {
    const matchDate = filterDate ? a.created_at?.slice(0,10) === filterDate : true;
    const matchSearch = searchTerm
      ? (a.title + ' ' + a.message).toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchDate && matchSearch;
  });

  return (
    <div className="announcement-box-container">
      <div className="announcement-box-title">Latest Barangay Announcements</div>

      {loading ? (
        <div>Loading announcements...</div>
      ) : filteredAnnouncements.length > 0 ? (
        filteredAnnouncements.map((item, index) => (
          <div className="announcement-item" key={index}>
            <h4>{item.title}</h4>
            <p>{item.message}</p>
            <div className="announcement-date">
              Posted: {formatDateTime(item.created_at)}
            </div>
          </div>
        ))
      ) : (
        <div>No announcements available.</div>
      )}
    </div>
  );
}

export default GuestAnnouncementSection;
