// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* ... (profile section remains the same) ... */}
      <div className="sidebar-profile">
        <img src="https://picsum.photos/id/237/100" alt="Admin Profile" />
        <h5>Admin User</h5>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/providers">Providers</NavLink>
        {/* --- NEW LINK --- */}
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
        <NavLink to="/plans">Subscription Plans</NavLink>
        {/* --- NEW LINK --- */}
        <NavLink to="/subscriptions">Subscriptions</NavLink>
        <NavLink to="/notifications">Notifications</NavLink>
        <NavLink to="/reviews">Reviews</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;