// src/pages/Plans.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Table.css';
import '../styles/SubscriptionPlans.css';

const API_BASE_URL = 'http://localhost:8080/api/admin';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the form
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlanId, setCurrentPlanId] = useState(null);
    const [formData, setFormData] = useState({
        planName: '',
        price: '',
        duration: '', // Duration in months
    });

    // --- Data Fetching ---
    const fetchPlans = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            // NOTE: Assumes a GET endpoint for subscription plans exists from your AdminController
            const response = await fetch(`${API_BASE_URL}/subscription-plans`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch subscription plans.');
            const data = await response.json();
            setPlans(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // --- Form and API Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentPlanId(null);
        setFormData({ planName: '', price: '', duration: '' });
    };

    const handleEditClick = (plan) => {
        setIsEditing(true);
        setCurrentPlanId(plan.planId);
        setFormData({
            planName: plan.planName,
            price: plan.price,
            duration: plan.duration,
        });
    };

    const handleDelete = async (planId) => {
        if (!window.confirm(`Are you sure you want to delete this plan?`)) return;

        try {
            const token = localStorage.getItem('adminToken');
            // Using the specific delete URL you provided
            const response = await fetch(`${API_BASE_URL}/delete-subscription-plans/${planId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete plan.');
            fetchPlans(); // Refetch the list to show the change
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing
            ? `${API_BASE_URL}/subscription-plans/${currentPlanId}`
            : `${API_BASE_URL}/subscription-plans`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'add'} plan.`);
            fetchPlans(); // Refetch data on success
            resetForm(); // Clear the form
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <p className="loading-message">Loading Plans...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="page-container">
            <h1>Subscription Plan Management</h1>

            <section className="form-section">
                <h2>{isEditing ? 'Edit Plan' : 'Add New Plan'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="planName">Plan Name</label>
                            <input type="text" id="planName" name="planName" value={formData.planName} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price ($)</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} required step="0.01" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="duration">Duration (Months)</label>
                            <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} required />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-success">{isEditing ? 'Update Plan' : 'Add Plan'}</button>
                            {isEditing && <button type="button" className="btn" onClick={resetForm}>Cancel</button>}
                        </div>
                    </div>
                </form>
            </section>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Plan ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {plans.map(plan => (
                        <tr key={plan.planId}>
                            <td>{plan.planId}</td>
                            <td>{plan.planName}</td>
                            <td>${parseFloat(plan.price).toFixed(2)}</td>
                            <td>{plan.duration} Month(s)</td>
                            <td>
                                <button className="btn btn-warning" onClick={() => handleEditClick(plan)}>Edit</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(plan.planId)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubscriptionPlans;