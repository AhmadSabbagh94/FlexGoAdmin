// src/pages/Subscriptions.jsx
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Table.css'; // Reusing our standard table and filter styles

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');

    useEffect(() => {
        const fetchSubscriptions = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch('http://localhost:8080/api/admin/subscriptions', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch subscriptions.');
                }
                const data = await response.json();
                setSubscriptions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    // --- Derived data and filtering ---

    // Get a unique list of plan names for the filter dropdown
    const uniquePlanNames = useMemo(() => {
        const plans = subscriptions.map(sub => sub.planName).filter(Boolean);
        return [...new Set(plans)];
    }, [subscriptions]);

    const filteredSubscriptions = useMemo(() => {
        return subscriptions
            .filter(sub => { // Filter by provider name or email
                const provider = sub.providerName.toLowerCase();
                const email = sub.providerEmail.toLowerCase();
                const query = searchQuery.toLowerCase();
                return provider.includes(query) || email.includes(query);
            })
            .filter(sub => { // Filter by payment status
                return statusFilter ? sub.paymentStatus === statusFilter : true;
            })
            .filter(sub => { // Filter by plan name
                return planFilter ? sub.planName === planFilter : true;
            });
    }, [subscriptions, searchQuery, statusFilter, planFilter]);

    if (loading) return <p className="loading-message">Loading Subscriptions...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="page-container">
            <h1>User Subscriptions</h1>

            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Search by provider name or email..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="filter-select"
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                >
                    <option value="">All Plans</option>
                    {uniquePlanNames.map(planName => (
                        <option key={planName} value={planName}>{planName}</option>
                    ))}
                </select>
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Provider Name</th>
                        <th>Plan</th>
                        <th>Price</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSubscriptions.map(sub => (
                        <tr key={sub.subscriptionId}>
                            <td>{sub.subscriptionId}</td>
                            <td>
                                {sub.providerName}<br />
                                <small>{sub.providerEmail}</small>
                            </td>
                            <td>{sub.planName}</td>
                            <td>${parseFloat(sub.planPrice).toFixed(2)}</td>
                            <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                            <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                            <td>
                                <span className={`status status-${sub.paymentStatus?.toLowerCase()}`}>
                                    {sub.paymentStatus}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Subscriptions;