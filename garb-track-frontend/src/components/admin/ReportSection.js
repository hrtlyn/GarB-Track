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

  // Fetch reports
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

  // Modal helper
  const openModal = (message, status = 'success') => {
    setModalMessage(message);
    setModalStatus('loading');
    setShowModal(true);
    setTimeout(() => {
      setModalStatus(status);
      setTimeout(() => setShowModal(false), 1500);
    }, 800);
  };

  // Mark report as Reviewed
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

  // Delete report
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

  // Print reports (new reliable method)
        const handlePrint = () => {
          const reportTable = document.querySelector('.report-table');
          if (!reportTable) return;

          // Clone table and remove Action column
          const clone = reportTable.cloneNode(true);
          const actionIndex = 5; // 0-based index for Action column
          // Remove header cell
          clone.querySelectorAll('thead tr th')[actionIndex].remove();
          // Remove action cells from each row
          clone.querySelectorAll('tbody tr').forEach(row => {
            row.querySelectorAll('td')[actionIndex].remove();
          });

          const printWindow = window.open('', '_blank', 'width=900,height=600');
          printWindow.document.write(`
            <html>
              <head>
                <title>Resident Reports</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 10px; }
                  h2 { color: #3E5F44; font-size: 1.2rem; margin-bottom: 1rem; }
                  table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
                  thead { display: table-header-group; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  th, td { border: 1px solid #000; padding: 0.4rem 0.6rem; word-break: break-word; vertical-align: top; }
                  th { background-color: #93DA97; color: #3E5F44; }
                  img { max-width: 150px; max-height: 150px; object-fit: cover; display: block; margin: 0.2rem 0; }
                </style>
              </head>
              <body>
                <h2>Resident Reports</h2>
                ${clone.outerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();

          // Wait for all images to load before printing
          const images = printWindow.document.querySelectorAll('img');
          let loadedCount = 0;
          const totalImages = images.length;

          if (totalImages === 0) {
            printWindow.print();
            printWindow.close();
          } else {
            images.forEach((img) => {
              img.onload = img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                  printWindow.print();
                  printWindow.close();
                }
              };
            });
          }
        };



  if (loading) return <p>Loading reports...</p>;

  return (
    <section className="report-section">
      <h2>Resident Reports</h2>
      <button className="btn-review" onClick={handlePrint} style={{ marginBottom: '1rem' }}>
        Print Reports
      </button>
      <div className="table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Reporter</th>
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
                <td colSpan="6" style={{ textAlign: 'center' }}>No reports found</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.reporter}</td>
                  <td>{report.zone}</td>
                  <td>{report.description}</td>
                  <td>
                    {report.photo ? (
                      <img
                        src={`http://127.0.0.1:8000/storage/${report.photo}`}
                        alt="Report"
                        className="report-photo"
                      />
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
      </div>

      {/* Delete Modal */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this report?</p>
            <button className="btn-delete" onClick={confirmDelete}>Yes, Delete</button>
            <button className="btn-cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
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
