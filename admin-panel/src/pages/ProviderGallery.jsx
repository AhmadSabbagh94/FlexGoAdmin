// src/pages/ProviderGallery.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/MediaGrid.css';

const ProviderGallery = () => {
    const { providerId } = useParams(); // Get providerId from URL
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGallery = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`http://localhost:8080/api/admin/providers/${providerId}/gallery`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch gallery.');
                const data = await response.json();
                setImages(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, [providerId]);

    const handleDelete = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:8080/api/admin/providers/gallery/${imageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete image.');
            setImages(currentImages => currentImages.filter(img => img.id !== imageId));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <p className="loading-message">Loading Gallery...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <Link to="/providers" className="back-button">&#8592; Back</Link>
                <h1>Provider Gallery (ID: {providerId})</h1>
            </div>

            <div className="media-grid">
                {images.map(image => (
                    <div className="media-card" key={image.id}>
                        {/* Assuming the image object has an 'imageUrl' property */}
                        <img src={image.imageUrl} alt={`Gallery item ${image.id}`} />
                        <div className="delete-overlay">
                            <button className="btn btn-danger" onClick={() => handleDelete(image.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            {images.length === 0 && <p>This provider has no images in their gallery.</p>}
        </div>
    );
};

export default ProviderGallery;