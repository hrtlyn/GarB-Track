import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router v6 hook
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // use this instead of window.location.href

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Store token and role
      if (data.token) localStorage.setItem('token', data.token);
      if (data.role) localStorage.setItem('role', data.role);

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'collector') {
        navigate('/collector');
      } else {
        navigate('/'); // guest or other roles
      }

    } catch (err) {
      setError('Server error. Please try again later.');
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src="/logogarb1.png" alt="GarB-Track Logo" className="login-logo" />
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
