// src/pages/Reviews.jsx
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Table.css'; // For filters
import '../styles/Reviews.css'; // For the new card styles

// A small helper component to display star ratings
const StarRating = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="star-rating">
            {[...Array(totalStars)].map((_, index) => {
                return <span key={index} className={`star ${index < rating ? '' : 'empty'}`}>&#9733;</span>;
            })}
        </div>
    );
};


const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [ratingFilter, setRatingFilter] = useState(''); // 1-5 or empty for all

    // Fetching logic
    useEffect(() => {
        // The API URL changes based on whether a rating filter is applied
        const ratingQuery = ratingFilter ? `?rating=${ratingFilter}` : '';
        const API_URL = `http://localhost:8080/api/admin/reviews-by-rating${ratingQuery}`;

        const fetchReviews = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(API_URL, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch reviews.');
                const data = await response.json();
                setReviews(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [ratingFilter]); // This effect re-runs every time the ratingFilter changes


    // Delete logic
    const handleDelete = async (reviewId) => {
        if (!window.confirm(`Are you sure you want to delete review #${reviewId}?`)) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:8080/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete the review.');
            // Update UI instantly
            setReviews(currentReviews => currentReviews.filter(review => review.reviewId !== reviewId));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // Client-side search filtering (applied after the server-side rating filter)
    const filteredReviews = useMemo(() => {
        return reviews.filter(review =>
            review.providerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [reviews, searchQuery]);


    return (
        <div className="page-container">
            <h1>Review Management</h1>

            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Search by provider name..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="filter-select"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {loading && <p className="loading-message">Loading reviews...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {!loading && !error && (
                <div className="reviews-grid">
                    {filteredReviews.map(review => (
                        <div className="review-card" key={review.reviewId}>
                            <div className="review-header">
                                <div className="review-header-info">
                                    <h3>{review.providerName}</h3>
                                    <small>Reviewed by: {review.userName}</small>
                                </div>
                                <StarRating rating={review.rating} />
                            </div>
                            <div className="review-body">
                                <p>{review.reviewText}</p>
                            </div>
                            <div className="review-footer">
                                <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                                <button className="btn btn-danger" onClick={() => handleDelete(review.reviewId)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;