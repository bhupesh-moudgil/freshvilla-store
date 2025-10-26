import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { couponsAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const CouponCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadCoupon();
    }
  }, [id]);

  const loadCoupon = async () => {
    try {
      const response = await couponsAPI.getById(id);
      const coupon = response.data.data;
      setFormData({
        ...coupon,
        validFrom: coupon.validFrom.split('T')[0],
        validUntil: coupon.validUntil.split('T')[0]
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to load coupon', 'error');
      navigate('/admin/coupons');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await couponsAPI.update(id, formData);
        Swal.fire('Success!', 'Coupon updated successfully', 'success');
      } else {
        await couponsAPI.create(formData);
        Swal.fire('Success!', 'Coupon created successfully', 'success');
      }
      navigate('/admin/coupons');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} coupon`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">{isEditMode ? 'Edit Coupon' : 'Create New Coupon'}</h2>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Coupon Code *</label>
                <input type="text" className="form-control text-uppercase" name="code" value={formData.code} onChange={handleChange} required />
                <small className="text-muted">Use uppercase letters and numbers only</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Discount Type *</label>
                <select className="form-select" name="discountType" value={formData.discountType} onChange={handleChange} required>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" rows="2" value={formData.description} onChange={handleChange}></textarea>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Discount Value *</label>
                <input type="number" className="form-control" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="0" step="0.01" />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Min Order Value (₹)</label>
                <input type="number" className="form-control" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} min="0" />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Max Discount (₹)</label>
                <input type="number" className="form-control" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} min="0" placeholder="Optional for percentage" />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Valid From *</label>
                <input type="date" className="form-control" name="validFrom" value={formData.validFrom} onChange={handleChange} required />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Valid Until *</label>
                <input type="date" className="form-control" name="validUntil" value={formData.validUntil} onChange={handleChange} required />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Usage Limit</label>
                <input type="number" className="form-control" name="usageLimit" value={formData.usageLimit} onChange={handleChange} min="1" placeholder="Unlimited" />
              </div>

              <div className="col-md-12 mb-3">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="isActive">Active</label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Coupon' : 'Create Coupon')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/coupons')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CouponCreate;
