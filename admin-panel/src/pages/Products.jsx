// src/pages/Products.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageSlider from '../components/ImageSlider'; // <-- IMPORT THE NEW COMPONENT
import '../styles/Table.css';
import '../styles/Products.css';

const Products = () => {
    const { providerId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`http://localhost:8080/api/admin/get-products/${providerId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch products.');
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [providerId]);

    const handleDelete = async (productId) => {
        if (!window.confirm(`Are you sure you want to delete product #${productId}?`)) return;
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:8080/api/admin/store/product/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete product.');
            setProducts(currentProducts => currentProducts.filter(p => p.productId !== productId));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    if (loading) return <p className="loading-message">Loading Products...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <Link to="/providers" className="back-button">&#8592; Back to Providers</Link>
                <h1>Provider Store (ID: {providerId})</h1>
            </div>

            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Search by product title..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div className="product-card" key={product.productId}>
                        <div className="product-image-container">
                            {/* --- UPDATED LOGIC TO HANDLE SLIDESHOW --- */}
                            {product.imageUrls && product.imageUrls.length > 1 ? (
                                <ImageSlider images={product.imageUrls} />
                            ) : (
                                <img
                                    src={product.imageUrls && product.imageUrls.length === 1 ? product.imageUrls[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                                    alt={product.title}
                                />
                            )}
                        </div>
                        <div className="product-info">
                            <h3>{product.title}</h3>
                            <p className="price">${parseFloat(product.price).toFixed(2)}</p>
                            <p className="description">{product.description}</p>
                        </div>
                        <div className="product-actions">
                            <button className="btn btn-danger" onClick={() => handleDelete(product.productId)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            {!loading && filteredProducts.length === 0 && <p>No products found for this provider.</p>}
        </div>
    );
};

export default Products;