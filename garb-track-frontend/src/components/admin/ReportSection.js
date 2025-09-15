import React, { useEffect, useState, useCallback } from 'react';
import './ReportSection.css';

function ReportSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState('loading');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchReports = useCallback(() => {
    fetch('http://127.0.0.1:8000/api/reports', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
        return res.json();
      })
      .then(data => setReports(data))
      .catch(err => {
        console.error('Error fetching reports:', err);
        openModal(`Failed to fetch reports: ${err.message}`, 'error');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const openModal = (message, status = 'success') => {
    setModalMessage(message);
    setModalStatus('loading');
    setShowModal(true);
    setTimeout(() => {
      setModalStatus(status);
      setTimeout(() => setShowModal(false), 1500);
    }, 800);
  };

  const handleReview = (id) => {
    fetch(`http://127.0.0.1:8000/api/reports/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'Reviewed' }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Update failed with status ${res.status}`);
        return res.json();
      })
      .then(() => {
        fetchReports();
        openModal('Report marked as Reviewed!', 'success');
      })
      .catch(err => {
        console.error('Error updating report:', err);
        openModal(`Failed to update report: ${err.message}`, 'error');
      });
  };

  const handleDelete = (id) => setConfirmDeleteId(id);

  const confirmDelete = () => {
    fetch(`http://127.0.0.1:8000/api/reports/${confirmDeleteId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Delete failed: ${res.status} ${errorText}`);
        }
        setConfirmDeleteId(null);
        fetchReports();
        openModal('Report deleted successfully!', 'success');
      })
      .catch(err => {
        console.error('Error deleting report:', err);
        openModal(`Failed to delete report: ${err.message}`, 'error');
      });
  };

  if (loading) return <p>Loading reports...</p>;

  return (
    <section className="report-section">
      <h2>Resident Reports</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Message</th>
            <th>Photo</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No reports found</td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr key={report.id}>
                <td>{report.zone}</td>
                <td>{report.description}</td>
                <td>
                  {report.photo ? (
                    <a
                      href={`http://127.0.0.1:8000/storage/${report.photo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Photo
                    </a>
                  ) : 'No Photo'}
                </td>
                <td>{report.status}</td>
                <td>
                  <button
                    className="btn-review"
                    disabled={report.status === 'Reviewed'}
                    onClick={() => handleReview(report.id)}
                  >
                    {report.status === 'Reviewed' ? 'Reviewed' : 'Mark as Reviewed'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(report.id)}
                    style={{ marginLeft: '0.5rem', backgroundColor: '#5E936C', color: 'white' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this report?</p>
            <button className="btn-delete" onClick={confirmDelete}>Yes, Delete</button>
            <button className="btn-cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
          </div>
        </div>
      )}

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

export default ReportSection;
