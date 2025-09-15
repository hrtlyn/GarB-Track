// src/components/GuestScheduleSection.js
import React, { useEffect, useState } from 'react';
import api from '../api';

function GuestScheduleSection() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schedules')
      .then((res) => {
        setSchedules(res.data); 
      })
      .catch((err) => {
        console.error('Failed to load schedules:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🔹 Helper to format time to HH:MM AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':'); // get hour and minute
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
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
          <tr>
            <td colSpan="4">Loading schedules...</td>
          </tr>
        ) : schedules.length > 0 ? (
          schedules.map((sched, idx) => (
            <tr key={idx}>
              <td>{sched.zone}</td>
              <td>{sched.date}</td>
              <td>{formatTime(sched.time)}</td> {/* ⬅️ Now formatted */}
              <td>{sched.type}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No schedules posted yet.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default GuestScheduleSection;
