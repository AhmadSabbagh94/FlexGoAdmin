// src/pages/Users.jsx
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Table.css'; // Using a shared table style

const API_URL = 'http://localhost:8080/api/admin/users';

const Users = () => {
  const [users, setUsers] = useState([]); // Holds the original full list of users
  const [searchQuery, setSearchQuery] = useState(''); // State for the text search
  const [selectedCity, setSelectedCity] = useState(''); // State for the city dropdown
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = (userId) => {
    console.log(`Request to delete user ${userId}`);
    alert(`(Simulation) Deleting user ${userId}`);
  };

  // NEW: Derive a unique list of cities from the user data for the dropdown
  const uniqueCities = useMemo(() => {
    const cities = users.map(user => user.city).filter(Boolean); // Get all cities and remove any null/empty values
    return [...new Set(cities)]; // Return a new array of unique cities
  }, [users]);


  // UPDATED: Chained filtering logic
  const filteredUsers = users
    .filter(user => {
      // First, filter by search query (name/email)
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    })
    .filter(user => {
      // Then, filter the result by selected city
      return selectedCity ? user.city === selectedCity : true;
    });


  if (loading) return <p className="loading-message">Loading Users...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="page-container">
      <h1>User Management</h1>

      <div className="filter-container">
        {/* Search input field */}
        <input
          type="text"
          placeholder="Search by name or email..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* NEW: City filter dropdown */}
        <select
          className="filter-select"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">All Cities</option>
          {uniqueCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>City</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber ?? 'N/A'}</td>
              <td>{user.city ?? 'N/A'}</td>
              <td>
                <button className="btn btn-danger" onClick={() => handleDelete(user.userId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;