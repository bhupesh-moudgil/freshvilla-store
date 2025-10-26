import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI } from '../../services/api';

// Import Admin Pages
import ProductsList from './Products/ProductsList';
import ProductCreate from './Products/ProductCreate';
import ProductEdit from './Products/ProductEdit';
import CouponsList from './Coupons/CouponsList';
import CouponCreate from './Coupons/CouponCreate';
import OrdersList from './Orders/OrdersList';
import DashboardHome from './DashboardHome';

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await ordersAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="container-fluid">
          <button
            className="btn btn-outline-light me-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bi bi-list"></i>
          </button>
          
          <Link className="navbar-brand fw-bold" to="/admin/dashboard">
            <i className="bi bi-shop me-2"></i>
            FreshVilla Admin
          </Link>

          <div className="d-flex align-items-center ms-auto">
            <Link to="/" className="btn btn-outline-light me-3" target="_blank">
              <i className="bi bi-box-arrow-up-right me-2"></i>
              View Store
            </Link>
            
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle me-2"></i>
                {admin?.name || 'Admin'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><span className="dropdown-item-text small text-muted">{admin?.email}</span></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex">
        {/* Sidebar */}
        <div
          className={`bg-light border-end ${sidebarOpen ? '' : 'd-none'}`}
          style={{
            width: '250px',
            minHeight: 'calc(100vh - 56px)',
            position: 'sticky',
            top: '56px'
          }}
        >
          <div className="p-3">
            <h6 className="text-muted text-uppercase small mb-3">
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </h6>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/dashboard">
                  <i className="bi bi-house-door me-2"></i>
                  Overview
                </Link>
              </li>
            </ul>

            <h6 className="text-muted text-uppercase small mb-3 mt-4">
              <i className="bi bi-box-seam me-2"></i>
              Catalog
            </h6>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/products">
                  <i className="bi bi-grid me-2"></i>
                  Products
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/products/create">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Product
                </Link>
              </li>
            </ul>

            <h6 className="text-muted text-uppercase small mb-3 mt-4">
              <i className="bi bi-tag me-2"></i>
              Promotions
            </h6>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/coupons">
                  <i className="bi bi-ticket-perforated me-2"></i>
                  Coupons
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/coupons/create">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Coupon
                </Link>
              </li>
            </ul>

            <h6 className="text-muted text-uppercase small mb-3 mt-4">
              <i className="bi bi-cart me-2"></i>
              Sales
            </h6>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/orders">
                  <i className="bi bi-receipt me-2"></i>
                  Orders
                  {stats && stats.pendingOrders > 0 && (
                    <span className="badge bg-danger ms-2">{stats.pendingOrders}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 56px)' }}>
          <Routes>
            <Route path="/" element={<DashboardHome stats={stats} />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/create" element={<ProductCreate />} />
            <Route path="/products/edit/:id" element={<ProductEdit />} />
            <Route path="/coupons" element={<CouponsList />} />
            <Route path="/coupons/create" element={<CouponCreate />} />
            <Route path="/orders" element={<OrdersList />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
