// src/components/GuestScheduleSection.js
import React, { useEffect, useState } from 'react';
import api from '../api';

function GuestScheduleSection({ filterDate = '', searchTerm = '' }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schedules')
      .then((res) => setSchedules(res.data || []))
      .catch((err) => console.error('Failed to load schedules:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  // 🔹 Filter schedules
  const filteredSchedules = (schedules || []).filter(s => {
    const matchDate = filterDate ? s.date === filterDate : true;
    const matchSearch = searchTerm ? 
      (s.zone + ' ' + s.type).toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchDate && matchSearch;
  });

 return (
  <div className="table-responsive">
    <table className="schedule-table">
      <thead>
        <tr>
          <th>Zone</th>
          <th>Date</th>
          <th>Time</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan="4">Loading schedules...</td></tr>
        ) : filteredSchedules.length === 0 ? (
          <tr><td colSpan="4">No schedules posted yet.</td></tr>
        ) : (
          filteredSchedules.map((sched, idx) => (
            <tr key={idx}>
              <td>{sched.zone}</td>
              <td>{sched.date}</td>
              <td>{formatTime(sched.time)}</td>
              <td>{sched.type}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
 );
}

export default GuestScheduleSection;
