// src/pages/Providers.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Table.css';

const Providers = () => {
    const navigate = useNavigate();

    // --- All state and logic remains exactly the same as before ---
    const [providers, setProviders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const headers = { 'Authorization': `Bearer ${token}` };
                const [providersRes, categoriesRes, subcategoriesRes] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/providers', { headers }),
                    fetch('http://localhost:8080/api/admin/categories', { headers }),
                    fetch('http://localhost:8080/api/admin/subcategories', { headers }),
                ]);
                if (!providersRes.ok || !categoriesRes.ok || !subcategoriesRes.ok) {
                    throw new Error('Failed to fetch initial page data');
                }
                const providersData = await providersRes.json();
                const categoriesData = await categoriesRes.json();
                const subcategoriesData = await subcategoriesRes.json();
                setProviders(providersData);
                setCategories(categoriesData);
                setSubcategories(subcategoriesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const uniqueCities = useMemo(() => {
        const cities = providers.map(p => p.city).filter(Boolean);
        return [...new Set(cities)];
    }, [providers]);

    const filteredSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        return subcategories.filter(sub => sub.category_id == selectedCategory);
    }, [selectedCategory, subcategories]);

    const filteredProviders = providers
        .filter(provider => {
            const name = provider.providerName.toLowerCase();
            const email = provider.email.toLowerCase();
            const query = searchQuery.toLowerCase();
            return name.includes(query) || email.includes(query);
        })
        .filter(provider => selectedCity ? provider.city === selectedCity : true)
        .filter(provider => {
            if (!selectedCategory && !selectedSubcategory) return true;
            const providerSubcategoryIds = provider.subcategories?.map(s => s.subcategory_id) ?? [];
            if (selectedSubcategory) {
                return providerSubcategoryIds.includes(Number(selectedSubcategory));
            }
            if (selectedCategory) {
                const categorysSubcategoryIds = filteredSubcategories.map(s => s.subcategory_id);
                return providerSubcategoryIds.some(id => categorysSubcategoryIds.includes(id));
            }
            return true;
        });

    if (loading) return <p className="loading-message">Loading...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="page-container">
            <h1>Provider Management</h1>
            <div className="filter-container">
                <input type="text" placeholder="Search by name or email..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <select className="filter-select" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                    <option value="">All Cities</option>
                    {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <select className="filter-select" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>)}
                </select>
                <select className="filter-select" value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)} disabled={!selectedCategory}>
                    <option value="">All Subcategories</option>
                    {filteredSubcategories.map(sub => <option key={sub.subcategory_id} value={sub.subcategory_id}>{sub.subcategory_name}</option>)}
                </select>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Verified</th>
                        <th>Banned</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProviders.map(provider => (
                        <tr key={provider.providerId}>
                            <td>{provider.providerId}</td>
                            <td>{provider.providerName}</td>
                            <td>{provider.email}</td>
                            <td>{provider.city ?? 'N/A'}</td>
                            <td>{provider.isVerified ? 'Yes' : 'No'}</td>
                            <td>{provider.is_banned ? 'Yes' : 'No'}</td>
                            <td className="actions-cell">
                                {/* --- CORRECTED ACTIONS COLUMN --- */}
                                <button className="btn btn-success">Verify</button>
                                <button className="btn btn-warning">Suspend</button>
                                <button className="btn btn-danger">Delete</button>
                                <button className="btn btn-info" onClick={() => navigate(`/provider/${provider.providerId}/gallery`)}>Gallery</button>
                                 <button className="btn btn-secondary" onClick={() => navigate(`/provider/${provider.providerId}/status`)}>Status</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Providers;