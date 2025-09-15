// src/components/NavigationBar.js
import React from 'react';
import './NavigationBar.css';

function NavigationBar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">GarB-Track</div>
      <ul className="navbar-links">
        <li><a href="#schedule">Schedule</a></li>
        <li><a href="#announcements">Announcements</a></li>
        <li><a href="#report">Report</a></li>
        <li><a href="/login">Login</a></li>
      </ul>
    </nav>
  );
}

export default NavigationBar;
