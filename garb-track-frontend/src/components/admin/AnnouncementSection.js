import React, { useState, useEffect, useCallback } from 'react';
import './AnnouncementSection.css';

function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState('loading');

  const token = localStorage.getItem('token');

  // Fetch announcements
  const fetchAnnouncements = useCallback(() => {
    fetch('http://127.0.0.1:8000/api/announcements', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error('Error fetching announcements:', err));
  }, [token]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const openModal = (message, status = 'success') => {
    setModalMessage(message);
    setModalStatus('loading');
    setShowModal(true);
    setTimeout(() => {
      setModalStatus(status);
      setTimeout(() => setShowModal(false), 1500);
    }, 800);
  };

  const handleSave = () => {
    if (!newAnnouncement.trim()) return;

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://127.0.0.1:8000/api/announcements/${editingId}`
      : 'http://127.0.0.1:8000/api/announcements';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message: newAnnouncement }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed request');
        return res.json();
      })
      .then(() => {
        setNewAnnouncement('');
        setEditingId(null);
        fetchAnnouncements();
        openModal(editingId ? 'Announcement updated!' : 'Announcement posted!', 'success');
      })
      .catch(err => {
        console.error(err);
        openModal(editingId ? 'Failed to update announcement' : 'Failed to post announcement', 'error');
      });
  };

  const handleEdit = (id, message) => {
    setNewAnnouncement(message);
    setEditingId(id);
  };

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8000/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed delete');
        fetchAnnouncements();
        openModal('Announcement deleted!', 'success');
      })
      .catch(err => {
        console.error(err);
        openModal('Failed to delete announcement', 'error');
      });
  };

  const formatDatetime = (dt) => {
    if (!dt) return '';
    const dateObj = new Date(dt);
    return dateObj.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="announcement-section">
      <h2>Manage Barangay Announcements</h2>

      <div className="announcement-form">
        <textarea
          placeholder="Write your announcement here..."
          value={newAnnouncement}
          onChange={(e) => setNewAnnouncement(e.target.value)}
        />
        <button className="blue-btn" onClick={handleSave}>
          {editingId ? 'Update' : 'Post'} Announcement
        </button>
        {editingId && (
          <button className="gray-btn" onClick={() => { setNewAnnouncement(''); setEditingId(null); }}>
            Cancel
          </button>
        )}
      </div>

      <div className="announcement-list">
        {announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          <ul>
            {announcements.map(a => (
              <li key={a.id}>
                <p className="announcement-message">{a.message}</p>
                <small className="announcement-datetime">
                  Posted: {formatDatetime(a.created_at)}
                </small>
                <div className="announcement-actions">
                  <button className="blue-btn" onClick={() => handleEdit(a.id, a.message)}>Edit</button>
                  <button className="red-btn" onClick={() => handleDelete(a.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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

export default AnnouncementSection;
