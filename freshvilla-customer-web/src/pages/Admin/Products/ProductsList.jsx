import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.data || []);
    } catch (error) {
      Swal.fire('Error', 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await productsAPI.delete(id);
        Swal.fire('Deleted!', 'Product deleted successfully', 'success');
        loadProducts();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete product', 'error');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products</h2>
        <Link to="/admin/products/create" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i>Add Product
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img src={product.image} alt={product.name} style={{width: '50px', height: '50px', objectFit: 'cover'}} className="rounded" />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price}</td>
                    <td><span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>{product.stock}</span></td>
                    <td>
                      {product.featured && <span className="badge bg-warning me-1">Featured</span>}
                      {product.inStock ? <span className="badge bg-success">In Stock</span> : <span className="badge bg-danger">Out of Stock</span>}
                    </td>
                    <td>
                      <Link to={`/admin/products/edit/${product.id}`} className="btn btn-sm btn-primary me-2">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="btn btn-sm btn-danger">
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
    </div>
  );
};

export default ProductsList;
