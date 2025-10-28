import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminLayout from '../../../components/AdminLayout';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ServiceAreasList = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    pincode: '',
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
    estimatedDeliveryTime: '30-60',
    isActive: true
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/service-areas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAreas(response.data.data || []);
    } catch (error) {
      console.error('Error loading service areas:', error);
      Swal.fire('Error', 'Failed to load service areas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingArea
        ? `${API_BASE_URL}/service-areas/${editingArea.id}`
        : `${API_BASE_URL}/service-areas`;
      
      const method = editingArea ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', `Service area ${editingArea ? 'updated' : 'created'} successfully`, 'success');
      setShowModal(false);
      resetForm();
      loadAreas();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save service area', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Service Area?',
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('admin_token');
        await axios.delete(`${API_BASE_URL}/service-areas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Service area deleted successfully', 'success');
        loadAreas();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete service area', 'error');
      }
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      city: area.city,
      state: area.state,
      pincode: area.pincode,
      deliveryFee: area.deliveryFee,
      freeDeliveryThreshold: area.freeDeliveryThreshold,
      estimatedDeliveryTime: area.estimatedDeliveryTime,
      isActive: area.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingArea(null);
    setFormData({
      city: '',
      state: '',
      pincode: '',
      deliveryFee: 0,
      freeDeliveryThreshold: 0,
      estimatedDeliveryTime: '30-60',
      isActive: true
    });
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.patch(`${API_BASE_URL}/service-areas/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', `Service area ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      loadAreas();
    } catch (error) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-success"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Service Areas</h2>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-success"
          >
            <i className="bi bi-plus-circle me-2"></i>Add Service Area
          </button>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>City</th>
                    <th>State</th>
                    <th>Pincode</th>
                    <th>Delivery Fee</th>
                    <th>Free Delivery Above</th>
                    <th>Delivery Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area) => (
                    <tr key={area.id}>
                      <td>{area.city}</td>
                      <td>{area.state}</td>
                      <td>{area.pincode}</td>
                      <td>₹{area.deliveryFee}</td>
                      <td>₹{area.freeDeliveryThreshold}</td>
                      <td>{area.estimatedDeliveryTime} mins</td>
                      <td>
                        <span className={`badge ${area.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {area.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(area)}
                          className="btn btn-sm btn-primary me-2"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => toggleStatus(area.id, area.isActive)}
                          className="btn btn-sm btn-warning me-2"
                        >
                          <i className={`bi ${area.isActive ? 'bi-pause' : 'bi-play'}`}></i>
                        </button>
                        <button
                          onClick={() => handleDelete(area.id)}
                          className="btn btn-sm btn-danger"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal for Add/Edit */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingArea ? 'Edit' : 'Add'} Service Area</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Pincode (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Delivery Fee (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.deliveryFee}
                        onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Free Delivery Above (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.freeDeliveryThreshold}
                        onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Estimated Delivery Time (minutes)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., 30-60"
                        value={formData.estimatedDeliveryTime}
                        onChange={(e) => setFormData({ ...formData, estimatedDeliveryTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label">Active</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      {editingArea ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ServiceAreasList;
