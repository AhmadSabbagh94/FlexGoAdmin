// src/components/Dashboard.jsx

import { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const API_URL = 'http://localhost:8080/api/admin/dashboard';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('Authentication token not found. Please log in.');
        }

        const response = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty array means this runs once on component mount

  if (loading) {
    return <p className="loading-message">Loading Dashboard...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard Summary</h2>
      <div className="summary-cards">
        {/* --- Existing Cards --- */}
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{summary?.totalUsers ?? 'N/A'}</p>
        </div>
        <div className="stat-card">
          <h3>Total Providers</h3>
          <p className="stat-number">{summary?.totalProviders ?? 'N/A'}</p>
        </div>
        <div className="stat-card">
          <h3>Total Jobs Posted</h3>
          <p className="stat-number">{summary?.totalJobs ?? 'N/A'}</p>
        </div>

        {/* --- Updated & New Cards based on your API --- */}
        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <p className="stat-number">{summary?.activeSubscriptions ?? 'N/A'}</p>
        </div>
        <div className="stat-card">
          <h3>Total Provider Services</h3>
          <p className="stat-number">{summary?.totalProviderServices ?? 'N/A'}</p>
        </div>
        <div className="stat-card">
          <h3>Total Job Requests</h3>
          <p className="stat-number">{summary?.totalJobRequests ?? 'N/A'}</p>
        </div>
        <div className="stat-card">
          <h3>Total Reviews</h3>
          <p className="stat-number">{summary?.totalReviews ?? 'N/A'}</p>
        </div>
        <div className="stat-card">
          <h3>Active Providers Now</h3>
          <p className="stat-number">{summary?.totalActiveProviders ?? 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;