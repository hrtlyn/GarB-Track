import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import './DashboardHome.css';

function DashboardHome() {
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [upcomingRoutesCount, setUpcomingRoutesCount] = useState(0);
  const [totalReportsCount, setTotalReportsCount] = useState(0);
  const [reportsReviewedToday, setReportsReviewedToday] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [reportsPerZone, setReportsPerZone] = useState([]);
  const [reportsStatus, setReportsStatus] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingReportsCount(data.pending_reports);
        setUpcomingRoutesCount(data.upcoming_routes);
        setTotalReportsCount(data.total_reports || 0);
        setReportsReviewedToday(data.reports_reviewed_today || 0);
        setRecentActivities(data.recent_activities || []);
        setReportsPerZone(data.reports_per_zone || []);
        setReportsStatus(data.reports_status || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#3E5F44', '#5E936C', '#93DA97', '#E8FFD7'];

  return (
    <div className="dashboard-home">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Welcome, Barangay Captain 👋</h1>
        <p>Manage schedules, monitor collection, assign routes, and update announcements efficiently.</p>
      </header>

      {/* Metric Cards */}
      <section className="dashboard-cards">
        <div className="card">
          <h3>Total Reports</h3>
          <p>{totalReportsCount} report{totalReportsCount !== 1 ? 's' : ''} submitted</p>
        </div>
        <div className="card">
          <h3>Pending Reports</h3>
          <p>{pendingReportsCount} new resident concern{pendingReportsCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="card">
          <h3>Reviewed Today</h3>
          <p>{reportsReviewedToday} report{reportsReviewedToday !== 1 ? 's' : ''} reviewed</p>
        </div>
        <div className="card">
          <h3>Upcoming Schedules</h3>
          <p>{upcomingRoutesCount} assigned route{upcomingRoutesCount !== 1 ? 's' : ''}</p>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivities.length === 0 ? (
          <p>No recent activity</p>
        ) : (
          <ul>
            {recentActivities.map((act, index) => (
              <li key={index}>
                <strong>{act.user}</strong> {act.action} {act.zone ? `for ${act.zone}` : ''} <em>({act.time})</em>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Reports Overview Charts */}
      <section className="dashboard-charts">
        <div className="charts-container">
          {/* Reports per Zone (Bar Chart) */}
          <div className="chart-container">
            <h3>Reports per Zone</h3>
            <BarChart width={400} height={250} data={reportsPerZone}>
              <XAxis dataKey="zone" />
              <YAxis allowDecimals={false} /> {/* prevents decimals */}
              <Tooltip />
              <Bar dataKey="total" fill="#5E936C" />
            </BarChart>
          </div>

          {/* Reports Status (Pie Chart) */}
          <div className="chart-container">
            <h3>Reports Status</h3>
            <PieChart width={400} height={250}>
              <Pie
                data={reportsStatus}
                dataKey="total"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#3E5F44"
                label
              >
                {reportsStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} /> {/* added legend */}
            </PieChart>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardHome;
