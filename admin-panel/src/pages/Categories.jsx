// src/pages/Categories.jsx
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Table.css';
import '../styles/Categories.css';

// Reusable hook for API calls (no changes here)
const useApi = (config) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const callApi = async (body, path = '') => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${config.url}${path}`, {
                method: config.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : null,
            });
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };
    return { data, error, loading, callApi };
};


const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form states
    const [categoryName, setCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    const [subcategoryName, setSubcategoryName] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState('');
    const [editingSubcategory, setEditingSubcategory] = useState(null);

    // --- NEW: State for the filter dropdown ---
    const [filterCategoryId, setFilterCategoryId] = useState('');


    const addCategoryApi = useApi({ url: 'http://localhost:8080/api/admin/categories', method: 'POST' });
    const updateCategoryApi = useApi({ url: 'http://localhost:8080/api/admin/categories/', method: 'PUT' });
    const deleteCategoryApi = useApi({ url: 'http://localhost:8080/api/admin/categories/', method: 'DELETE' });

    const addSubcategoryApi = useApi({ url: 'http://localhost:8080/api/admin/subcategories', method: 'POST' });
    const updateSubcategoryApi = useApi({ url: 'http://localhost:8080/api/admin/subcategories/', method: 'PUT' });
    const deleteSubcategoryApi = useApi({ url: 'http://localhost:8080/api/admin/subcategories/', method: 'DELETE' });


    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };
            const [catRes, subcatRes] = await Promise.all([
                fetch('http://localhost:8080/api/admin/categories', { headers }),
                fetch('http://localhost:8080/api/admin/subcategories', { headers }),
            ]);
            if (!catRes.ok || !subcatRes.ok) throw new Error('Failed to fetch data');
            const catData = await catRes.json();
            const subcatData = await subcatRes.json();
            setCategories(catData);
            setSubcategories(subcatData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Category Handlers (No changes here) ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const success = editingCategory
            ? await updateCategoryApi.callApi({ categoryName }, editingCategory.categoryId)
            : await addCategoryApi.callApi({ categoryName });

        if (success) {
            fetchData();
            setCategoryName('');
            setEditingCategory(null);
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryName(category.categoryName);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This might affect subcategories.')) {
            const success = await deleteCategoryApi.callApi(null, id);
            if (success) fetchData();
        }
    };

    // --- Subcategory Handlers (No changes here) ---
    const handleSubcategorySubmit = async (e) => {
        e.preventDefault();
        const dto = { subcategory_name: subcategoryName, category_id: parentCategoryId };
        const success = editingSubcategory
            ? await updateSubcategoryApi.callApi(dto, editingSubcategory.subcategory_id)
            : await addSubcategoryApi.callApi(dto);

        if (success) {
            fetchData();
            setSubcategoryName('');
            setParentCategoryId('');
            setEditingSubcategory(null);
        }
    };

    const handleEditSubcategory = (subcategory) => {
        setEditingSubcategory(subcategory);
        setSubcategoryName(subcategory.subcategory_name);
        setParentCategoryId(subcategory.category_id);
    };

    const handleDeleteSubcategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this subcategory?')) {
            const success = await deleteSubcategoryApi.callApi(null, id);
            if (success) fetchData();
        }
    };

    // --- NEW: Create a filtered list of subcategories to display ---
    const displaySubcategories = useMemo(() => {
        if (!filterCategoryId) {
            return subcategories; // If "Show All" is selected, return the full list
        }
        return subcategories.filter(sub => sub.category_id == filterCategoryId);
    }, [filterCategoryId, subcategories]);


    if (loading && categories.length === 0) return <p className="loading-message">Loading...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="page-container">
            <h1>Category & Subcategory Management</h1>
            <div className="management-container">
                {/* --- CATEGORIES SECTION (No changes here) --- */}
                <div className="management-section">
                    <div className="management-header">
                        <h2>Categories</h2>
                    </div>
                    <form onSubmit={handleCategorySubmit} className="form-container">
                        <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                        <div className="form-group">
                            <label>Category Name</label>
                            <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-success">{editingCategory ? 'Update' : 'Add'}</button>
                        {editingCategory && <button type="button" className="btn" onClick={() => { setEditingCategory(null); setCategoryName(''); }}>Cancel</button>}
                    </form>
                    <table className="data-table">
                        <thead>
                            <tr><th>Name</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.categoryId}>
                                    <td>{cat.categoryName}</td>
                                    <td>
                                        <button className="btn btn-warning" onClick={() => handleEditCategory(cat)}>Edit</button>
                                        <button className="btn btn-danger" onClick={() => handleDeleteCategory(cat.categoryId)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- SUBCATEGORIES SECTION (Changes are here) --- */}
                <div className="management-section">
                    <div className="management-header">
                        <h2>Subcategories</h2>
                    </div>

                    {/* Subcategory Form (No changes here) */}
                    <form onSubmit={handleSubcategorySubmit} className="form-container">
                        <h3>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h3>
                        <div className="form-group">
                            <label>Parent Category</label>
                            <select value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)} required>
                                <option value="">Select a category...</option>
                                {categories.map(cat => (
                                    <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Subcategory Name</label>
                            <input type="text" value={subcategoryName} onChange={(e) => setSubcategoryName(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-success">{editingSubcategory ? 'Update' : 'Add'}</button>
                        {editingSubcategory && <button type="button" className="btn" onClick={() => { setEditingSubcategory(null); setSubcategoryName(''); setParentCategoryId('') }}>Cancel</button>}
                    </form>

                    <hr/>

                    {/* --- NEW: Filter dropdown for the table --- */}
                    <div className="form-group">
                       <label>Filter by Category</label>
                       <select className="filter-select" value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)}>
                           <option value="">Show All</option>
                           {categories.map(cat => (
                               <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                           ))}
                       </select>
                    </div>

                    {/* --- UPDATED: Subcategory Table now uses the filtered list --- */}
                    <table className="data-table">
                        <thead>
                            <tr><th>Name</th><th>Parent</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {displaySubcategories.map(sub => (
                                <tr key={sub.subcategory_id}>
                                    <td>{sub.subcategory_name}</td>
                                    <td>{categories.find(c => c.categoryId === sub.category_id)?.categoryName || 'N/A'}</td>
                                    <td>
                                        <button className="btn btn-warning" onClick={() => handleEditSubcategory(sub)}>Edit</button>
                                        <button className="btn btn-danger" onClick={() => handleDeleteSubcategory(sub.subcategory_id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Categories;