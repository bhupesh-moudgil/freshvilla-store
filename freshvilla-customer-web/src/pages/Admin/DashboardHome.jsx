import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, productsAPI } from '../../services/api';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const productsRes = await productsAPI.getAll();
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        totalProducts: productsRes.data.data.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
  }

  return (
    <div>
      <h2 className="mb-4">Dashboard Overview</h2>
      
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6>Total Orders</h6>
              <h2>{stats.totalOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h6>Pending</h6>
              <h2>{stats.pendingOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6>Completed</h6>
              <h2>{stats.completedOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6>Products</h6>
              <h2>{stats.totalProducts}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5>Quick Actions</h5>
              <Link to="/admin/dashboard/products/create" className="btn btn-success me-2">
                <i className="bi bi-plus-circle me-2"></i>Add Product
              </Link>
              <Link to="/admin/dashboard/products" className="btn btn-primary me-2">
                <i className="bi bi-box-seam me-2"></i>View Products
              </Link>
              <Link to="/admin/dashboard/coupons/create" className="btn btn-info me-2">
                <i className="bi bi-tag me-2"></i>Create Coupon
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
