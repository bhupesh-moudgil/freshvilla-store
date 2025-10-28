import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI, productsAPI } from '../../services/api';

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        ordersAPI.getAll().catch(() => ({ data: { data: [] } })),
        productsAPI.getAll().catch(() => ({ data: { data: [] } }))
      ]);
      
      const orders = ordersRes.data.data || [];
      const products = productsRes.data.data || [];
      
      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0),
        totalProducts: products.length,
        pendingOrders: orders.filter(o => o.orderStatus === 'Pending').length
      });
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
              {admin?.name || 'Admin'}
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
                  {stats && stats.pendingOrders > 0 && (
                    <span className="badge bg-danger ms-2">{stats.pendingOrders}</span>
                  )}
                </Link>
              </li>
            </ul>

            <h6 className="text-muted text-uppercase small mb-3 mt-4">
              <i className="bi bi-building me-2"></i>
              Store Management
            </h6>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/store-erp">
                  <i className="bi bi-bar-chart me-2"></i>
                  Store ERP
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/service-areas">
                  <i className="bi bi-geo-alt me-2"></i>
                  Service Areas
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/order-printing">
                  <i className="bi bi-printer me-2"></i>
                  Order Printing
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/admin/store-users">
                  <i className="bi bi-people me-2"></i>
                  Store Users
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 56px)' }}>
          <div className="container-fluid">
            <h2 className="mb-4">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted mb-1">Total Orders</p>
                        <h3 className="mb-0">{stats.totalOrders}</h3>
                      </div>
                      <div className="bg-primary bg-opacity-10 p-3 rounded">
                        <i className="bi bi-cart3 fs-2 text-primary"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted mb-1">Revenue</p>
                        <h3 className="mb-0">₹{stats.totalRevenue.toFixed(2)}</h3>
                      </div>
                      <div className="bg-success bg-opacity-10 p-3 rounded">
                        <i className="bi bi-currency-rupee fs-2 text-success"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted mb-1">Products</p>
                        <h3 className="mb-0">{stats.totalProducts}</h3>
                      </div>
                      <div className="bg-info bg-opacity-10 p-3 rounded">
                        <i className="bi bi-box-seam fs-2 text-info"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted mb-1">Pending Orders</p>
                        <h3 className="mb-0">{stats.pendingOrders}</h3>
                      </div>
                      <div className="bg-warning bg-opacity-10 p-3 rounded">
                        <i className="bi bi-clock-history fs-2 text-warning"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Quick Actions</h5>
                <div className="d-flex gap-2">
                  <Link to="/admin/products/create" className="btn btn-success">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Product
                  </Link>
                  <Link to="/admin/products" className="btn btn-primary">
                    <i className="bi bi-grid me-2"></i>
                    Manage Products
                  </Link>
                  <Link to="/admin/orders" className="btn btn-info text-white">
                    <i className="bi bi-receipt me-2"></i>
                    View Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
