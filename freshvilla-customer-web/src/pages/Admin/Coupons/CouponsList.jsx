import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { couponsAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const CouponsList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const response = await couponsAPI.getAll();
      setCoupons(response.data.data || []);
    } catch (error) {
      Swal.fire('Error', 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Coupon?',
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await couponsAPI.delete(id);
        Swal.fire('Deleted!', 'Coupon deleted successfully', 'success');
        loadCoupons();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete coupon', 'error');
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await couponsAPI.toggle(id);
      Swal.fire('Success!', 'Coupon status updated', 'success');
      loadCoupons();
    } catch (error) {
      Swal.fire('Error', 'Failed to update coupon', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Coupons</h2>
        <Link to="/admin/coupons/create" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i>Add Coupon
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Valid Until</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td><strong>{coupon.code}</strong></td>
                    <td>{coupon.description}</td>
                    <td>
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%` 
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td>₹{coupon.minOrderValue}</td>
                    <td>{new Date(coupon.validUntil).toLocaleDateString()}</td>
                    <td>{coupon.usedCount} / {coupon.usageLimit || '∞'}</td>
                    <td>
                      <button 
                        onClick={() => handleToggle(coupon.id)} 
                        className={`btn btn-sm ${coupon.isActive ? 'btn-success' : 'btn-secondary'}`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <Link to={`/admin/coupons/edit/${coupon.id}`} className="btn btn-sm btn-primary me-2">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button onClick={() => handleDelete(coupon.id)} className="btn btn-sm btn-danger">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {coupons.length === 0 && (
              <div className="text-center py-4 text-muted">
                No coupons found. Create your first coupon!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponsList;
