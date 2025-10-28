import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      const response = await ordersAPI.getAll().catch(() => ({ data: { data: [] } }));
      const orders = response.data.data || [];
      setPendingOrders(orders.filter(o => o.orderStatus === 'Pending').length);
    } catch (error) {
      console.error('Error loading pending orders:', error);
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
          <Link className="navbar-brand fw-bold" to="/admin/dashboard">
            <i className="bi bi-shop me-2"></i>
            FreshVilla Admin
          </Link>

          <div className="d-flex align-items-center ms-auto">
            <Link to="/" className="btn btn-outline-light me-3" target="_blank">
              <i className="bi bi-box-arrow-up-right me-2"></i>
              View Store
            </Link>
            
            <span className="text-white me-3">
              <i className="bi bi-person-circle me-2"></i>
              {admin?.name || admin?.User || 'Admin'}
            </span>
            
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex">
        {/* Sidebar */}
        <div
          className="bg-light border-end"
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
                  {pendingOrders > 0 && (
                    <span className="badge bg-danger ms-2">{pendingOrders}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 56px)' }}>
          <div className="container-fluid">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
