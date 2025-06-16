// src/pages/Jobs.jsx
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Table.css';

const Jobs = () => {
    // State for data from APIs
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    // State for loading and errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for all filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubcategoryName, setSelectedSubcategoryName] = useState('');


    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch all required data at once
                const [jobsRes, categoriesRes, subcategoriesRes] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/jobs', { headers }),
                    fetch('http://localhost:8080/api/admin/categories', { headers }),
                    fetch('http://localhost:8080/api/admin/subcategories', { headers }),
                ]);

                if (!jobsRes.ok || !categoriesRes.ok || !subcategoriesRes.ok) {
                    throw new Error('Failed to fetch page data. Please ensure all API endpoints exist.');
                }

                const jobsData = await jobsRes.json();
                const categoriesData = await categoriesRes.json();
                const subcategoriesData = await subcategoriesRes.json();

                setJobs(jobsData);
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

    const handleDelete = async (jobId) => {
        if (!window.confirm(`Are you sure you want to delete job #${jobId}?`)) {
            return;
        }
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:8080/api/admin/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete job.');
            setJobs(currentJobs => currentJobs.filter(job => job.jobId !== jobId));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // --- Derived data and filtering logic ---

    // Chained dropdown logic for subcategories
    const subcategoriesForFilter = useMemo(() => {
        if (!selectedCategoryId) return [];
        return subcategories.filter(sub => sub.category_id == selectedCategoryId);
    }, [selectedCategoryId, subcategories]);

    // Main filtering logic for the table
    const filteredJobs = useMemo(() => {
        const selectedCategory = categories.find(c => c.categoryId == selectedCategoryId);

        return jobs
            .filter(job => job.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(job => statusFilter ? job.status === (statusFilter === 'true') : true)
            .filter(job => selectedCategoryId ? job.categoryName === selectedCategory?.categoryName : true)
            .filter(job => selectedSubcategoryName ? job.subcategoryName === selectedSubcategoryName : true);
    }, [jobs, searchQuery, statusFilter, selectedCategoryId, selectedSubcategoryName, categories]);


    if (loading) return <p className="loading-message">Loading Jobs...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="page-container">
            <h1>Job Management</h1>

            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Search by job title..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="false">Open</option>
                    <option value="true">Closed</option>
                </select>
                {/* --- NEW FILTERS --- */}
                <select className="filter-select" value={selectedCategoryId} onChange={(e) => {setSelectedCategoryId(e.target.value); setSelectedSubcategoryName('');}}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>)}
                </select>
                <select className="filter-select" value={selectedSubcategoryName} onChange={(e) => setSelectedSubcategoryName(e.target.value)} disabled={!selectedCategoryId}>
                    <option value="">All Subcategories</option>
                    {subcategoriesForFilter.map(sub => <option key={sub.subcategory_id} value={sub.subcategory_name}>{sub.subcategory_name}</option>)}
                </select>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Job ID</th>
                        <th>Title</th>
                        <th>Subcategory</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Requests</th>
                        <th>Posted By</th>
                        <th>Email</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredJobs.map(job => (
                        <tr key={job.jobId}>
                            <td>{job.jobId}</td>
                            <td>{job.title}</td>
                            <td>{job.subcategoryName}</td>
                            <td>
                                <span className={`status status-${job.status ? 'open' : 'closed'}`}>
                                    {job.status ? 'open' : 'closed'}
                                </span>
                            </td>
                            <td>{`$${job.budgetMin} - $${job.budgetMax}`}</td>
                            <td>{job.requestCount}</td>
                            <td>{job.user ? `${job.user.firstName} ${job.user.lastName}` : 'N/A'}</td>
                            <td>{job.user ? `${job.user.email}` : 'N/A'}</td>
                            <td>{job.location ?? 'N/A'}</td>
                            <td>
                                <button className="btn btn-danger" onClick={() => handleDelete(job.jobId)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Jobs;