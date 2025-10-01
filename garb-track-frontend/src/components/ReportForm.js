import React, { useState } from 'react';
import api from '../api'; // Your axios instance
import './ReportForm.css'; // add card/modal styling here

function ReportForm() {
  const [reporter, setReporter] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submittedReport, setSubmittedReport] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalStatus, setModalStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  const openModal = (message, status = 'success') => {
    setModalMessage(message);
    setModalStatus('loading');
    setShowModal(true);

    setTimeout(() => {
      setModalStatus(status);
      setTimeout(() => setShowModal(false), 1500);
    }, 800);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reporter || !zone || !description) {
      openModal('Please fill all required fields.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('reporter', reporter);
    formData.append('zone', zone);
    formData.append('description', description);
    if (photo) formData.append('photo', photo);

    try {
      const res = await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittedReport(res.data.report || null);
      setReporter('');
      setZone('');
      setDescription('');
      setPhoto(null);
      setPreviewUrl(null);

      openModal(res.data.message || 'Report submitted successfully!', 'success');
    } catch (err) {
      console.error(err);
      openModal('Failed to submit report.', 'error');
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${process.env.REACT_APP_API_URL}/storage/${path}`;
  };

  return (
    <>
      <form className="report-form" onSubmit={handleSubmit}>
        <label htmlFor="reporter">Your Name:</label>
        <input
          id="reporter"
          type="text"
          value={reporter}
          onChange={(e) => setReporter(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <label htmlFor="zone">Select Your Zone:</label>
        <select id="zone" value={zone} onChange={(e) => setZone(e.target.value)} required>
          <option value="">Select Zone</option>
          {['A', 'B', 'C'].map((z) => (
            <option key={z} value={`Zone ${z}`}>{`Zone ${z}`}</option>
          ))}
        </select>

        <label htmlFor="description">Describe the Concern:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain the garbage concern clearly..."
          required
        />

        <label htmlFor="photo">Attach Photo (optional):</label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
        />

        {previewUrl && (
          <div className="preview-card">
            <strong>Preview:</strong>
            <img src={previewUrl} alt="Preview" />
          </div>
        )}

        <button type="submit" className="submit-btn">Submit Report</button>
      </form>

      {submittedReport && (
        <div className="submitted-report-card">
          <h3>Submitted Report</h3>
          <p><strong>Reporter:</strong> {submittedReport.reporter}</p>
          <p><strong>Zone:</strong> {submittedReport.zone}</p>
          <p><strong>Description:</strong> {submittedReport.description}</p>
          {submittedReport.photo && (
            <img
              src={getImageUrl(submittedReport.photo)}
              alt="Uploaded"
              className="submitted-report-image"
            />
          )}
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
    </>
  );
}

export default ReportForm;
