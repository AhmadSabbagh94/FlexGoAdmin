// src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Providers from './pages/Providers';
import Jobs from './pages/Jobs';
import Reviews from './pages/Reviews';
import Plans from './pages/Plans';
import Notifications from './pages/Notifications';
import Categories from './pages/Categories'; // <-- Import the new page
import Subscriptions from './pages/Subscriptions'; // <-- Import the new page
import ProviderGallery from './pages/ProviderGallery'; // <-- Import new page
import ProviderStatus from './pages/ProviderStatus'; // <-- Import new page
import Products from './pages/Products'; // <-- Import the new page

// Import Shared Components
import Sidebar from './components/Sidebar';

// Import Styles
import './styles/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  // This is a protected layout for all admin pages
  const AdminLayout = () => (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="main-header">
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/provider/:providerId/gallery" element={<ProviderGallery />} />
            <Route path="/provider/:providerId/status" element={<ProviderStatus />} />
             <Route path="/provider/:providerId/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/reviews" element={<Reviews />} />
             <Route path="/plans" element={<Plans />} /> {/* This line should point to your new component */}
            <Route path="/notifications" element={<Notifications />} />
                <Route path="/subscriptions" element={<Subscriptions />} />

            {/* Redirect to dashboard if no other route matches */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />
          }
        />
        <Route
          path="/*"
          element={isLoggedIn ? <AdminLayout /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;