// src/components/ScheduleSection.js
import React, { useEffect, useState, useCallback } from 'react';
import './ScheduleSection.css';

function ScheduleSection() {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    zone: '',
    date: '',
    time: '',
    type: 'Biodegradable',
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState('loading');
  const [modalMessage, setModalMessage] = useState('');

  const token = localStorage.getItem('token');

  // 🔹 Modal helper
  const openModal = (message, status = 'success') => {
    setModalMessage(message);
    setModalStatus('loading');
    setShowModal(true);
    setTimeout(() => {
      setModalStatus(status);
      setTimeout(() => setShowModal(false), 1500);
    }, 800);
  };

  // 🔹 Fetch schedules
  const fetchSchedules = useCallback(() => {
    fetch('http://127.0.0.1:8000/api/schedules', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const normalized = (Array.isArray(data) ? data : []).map((s) => ({
          ...s,
          date: s?.date ? String(s.date).slice(0, 10) : '',
          time: s?.time || '00:00',
        }));
        setSchedules(normalized);
      })
      .catch((err) => {
        console.error('Error fetching schedules:', err);
        openModal(`Failed to fetch schedules: ${err.message}`, 'error');
      });
  }, [token]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // 🔹 Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Add schedule
  const handleAdd = () => {
    const { zone, date, time, type } = newSchedule;
    if (!zone || !date || !time) {
      openModal('Please complete Zone, Date, and Time.', 'error');
      return;
    }

    fetch('http://127.0.0.1:8000/api/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ zone, date, time, type }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Save failed: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setNewSchedule({ zone: '', date: '', time: '', type: 'Biodegradable' });
        fetchSchedules();
        openModal('Schedule added successfully!', 'success');
      })
      .catch((err) => {
        console.error('Error saving schedule:', err);
        openModal(`Failed to save schedule: ${err.message}`, 'error');
      });
  };

  // 🔹 Delete schedule
  const handleDelete = (id) => setConfirmDeleteId(id);

  const confirmDelete = () => {
    fetch(`http://127.0.0.1:8000/api/schedules/${confirmDeleteId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        setConfirmDeleteId(null);
        fetchSchedules();
        openModal('Schedule deleted successfully!', 'success');
      })
      .catch((err) => {
        console.error('Error deleting schedule:', err);
        openModal(`Failed to delete schedule: ${err.message}`, 'error');
      });
  };

  // 🔹 Time formatting
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <section className="schedule-section">
      <h2>Manage Collection Schedules</h2>

      {/* 🔹 Form */}
      <div className="schedule-form">
        <select name="zone" value={newSchedule.zone} onChange={handleInputChange}>
          <option value="">Select Zone</option>
          {['A', 'B', 'C'].map((z) => (
            <option key={z} value={`Zone ${z}`}>{`Zone ${z}`}</option>
          ))}
        </select>

        <input type="date" name="date" value={newSchedule.date} onChange={handleInputChange} />
        <input type="time" name="time" value={newSchedule.time} onChange={handleInputChange} />

        <select name="type" value={newSchedule.type} onChange={handleInputChange}>
          <option value="Biodegradable">Biodegradable</option>
          <option value="Non-Biodegradable">Non-Biodegradable</option>
        </select>

        <button className="blue-btn" onClick={handleAdd}>Add Schedule</button>
      </div>

      {/* 🔹 Table */}
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Date</th>
            <th>Time</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td>{schedule.zone}</td>
                <td>{schedule.date}</td>
                <td>{formatTime(schedule.time)}</td>
                <td>{schedule.type}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(schedule.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No schedules posted yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔹 Delete Confirmation */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this schedule?</p>
            <button className="btn-delete" onClick={confirmDelete}>Yes, Delete</button>
            <button className="btn-cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* 🔹 Feedback Modal */}
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
    </section>
  );
}

export default ScheduleSection;
