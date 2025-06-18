// src/pages/ProviderStatus.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/MediaGrid.css';

const ProviderStatus = () => {
    const { providerId } = useParams();
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStatuses = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`http://localhost:8080/api/admin/providers/${providerId}/status-media`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch statuses.');
                const data = await response.json();
                setStatuses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStatuses();
    }, [providerId]);

    const handleDelete = async (statusId) => {
        if (!window.confirm('Are you sure you want to delete this status?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:8080/api/admin/providers/status-media/${statusId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete status.');
            setStatuses(currentStatuses => currentStatuses.filter(status => status.id !== statusId));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // Assuming status object has properties: id, mediaUrl, mediaType ('IMAGE' or 'VIDEO')
    if (loading) return <p className="loading-message">Loading Statuses...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <Link to="/providers" className="back-button">&#8592; Back</Link>
                <h1>Provider Status Media (ID: {providerId})</h1>
            </div>

            <div className="media-grid">
                {statuses.map(status => (
                    <div className="media-card" key={status.id}>
                        {status.mediaType === 'VIDEO' ? (
                            <video src={status.mediaUrl} controls />
                        ) : (
                            <img src={status.mediaUrl} alt={`Status item ${status.id}`} />
                        )}
                        <div className="media-type-badge">{status.mediaType}</div>
                        <div className="delete-overlay">
                            <button className="btn btn-danger" onClick={() => handleDelete(status.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            {statuses.length === 0 && <p>This provider has no status media.</p>}
        </div>
    );
};

export default ProviderStatus;