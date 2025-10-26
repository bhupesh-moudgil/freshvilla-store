import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const ProductCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Groceries',
    image: '/images/product-default.jpg',
    unit: '1 pc',
    stock: 0,
    inStock: true,
    featured: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setFormData(response.data.data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load product', 'error');
      navigate('/admin/products');
    }
  };

  const categories = ['Groceries', 'Fruits & Vegetables', 'Dairy & Eggs', 'Snacks & Beverages', 'Bakery', 'Personal Care', 'Household', 'Others'];

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
        await productsAPI.update(id, formData);
        Swal.fire('Success!', 'Product updated successfully', 'success');
      } else {
        await productsAPI.create(formData);
        Swal.fire('Success!', 'Product created successfully', 'success');
      }
      navigate('/admin/products');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Product Name *</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Category *</label>
                <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Description *</label>
                <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} required></textarea>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Price (₹) *</label>
                <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Original Price (₹)</label>
                <input type="number" className="form-control" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0" step="0.01" />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Unit</label>
                <input type="text" className="form-control" name="unit" value={formData.unit} onChange={handleChange} placeholder="e.g., 1kg, 500g" />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Image URL</label>
                <input type="text" className="form-control" name="image" value={formData.image} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Stock Quantity *</label>
                <input type="number" className="form-control" name="stock" value={formData.stock} onChange={handleChange} required min="0" />
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="inStock" name="inStock" checked={formData.inStock} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="inStock">In Stock</label>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="featured" name="featured" checked={formData.featured} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="featured">Featured Product</label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Product' : 'Create Product')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCreate;
