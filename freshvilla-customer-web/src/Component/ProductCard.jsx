import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Swal from 'sweetalert2';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();

  // Get image path
  const getImagePath = (imageName) => {
    try {
      return require(`../images/${imageName}`);
    } catch (err) {
      // Fallback to a default image if not found
      return require('../images/category-baby-care.jpg');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
    
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: `${product.name} has been added to your cart`,
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: 'top-end'
    });
  };

  const inCart = isInCart(product.id);
  const quantity = getItemQuantity(product.id);

  return (
    <div className="col fade-zoom">
      <div className="card card-product">
        <div className="card-body">
          <div className="text-center position-relative">
            {/* Badge */}
            {product.badge && (
              <div className="position-absolute top-0 start-0">
                <span className={`badge ${product.badge === 'Sale' ? 'bg-danger' : 'bg-success'}`}>
                  {product.badge}
                </span>
              </div>
            )}
            
            {/* Product Image */}
            <Link to="#!">
              <img
                src={getImagePath(product.image)}
                alt={product.name}
                className="mb-3 img-fluid"
              />
            </Link>

            {/* Quick Actions */}
            <div className="card-product-action">
              <Link
                to="#!"
                className="btn-action"
                data-bs-toggle="tooltip"
                title="Quick View"
              >
                <i className="bi bi-eye" />
              </Link>
              <Link
                to="/ShopWishList"
                className="btn-action"
                data-bs-toggle="tooltip"
                title="Wishlist"
              >
                <i className="bi bi-heart" />
              </Link>
            </div>
          </div>

          {/* Category */}
          <div className="text-small mb-1">
            <Link to="#!" className="text-decoration-none text-muted">
              <small>{product.category}</small>
            </Link>
          </div>

          {/* Product Name */}
          <h2 className="fs-6">
            <Link to="#!" className="text-inherit text-decoration-none">
              {product.name}
            </Link>
          </h2>

          {/* Rating */}
          {product.rating && (
            <div>
              <small className="text-warning">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`bi bi-star${i < Math.floor(product.rating) ? '-fill' : i < product.rating ? '-half' : ''}`}
                  />
                ))}
              </small>
              {product.reviews && (
                <span className="text-muted small ms-1">({product.reviews})</span>
              )}
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <span className="text-dark fw-bold">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-decoration-line-through text-muted ms-1">
                  ₹{product.originalPrice}
                </span>
              )}
              {product.unit && (
                <div className="text-muted small">{product.unit}</div>
              )}
            </div>
            
            <div>
              {!product.inStock ? (
                <button className="btn btn-secondary btn-sm" disabled>
                  Out of Stock
                </button>
              ) : inCart ? (
                <Link to="/ShopCart" className="btn btn-success btn-sm">
                  <i className="bi bi-check2 me-1"></i>
                  In Cart ({quantity})
                </Link>
              ) : (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleAddToCart}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-plus"
                  >
                    <line x1={12} y1={5} x2={12} y2={19} />
                    <line x1={5} y1={12} x2={19} y2={12} />
                  </svg>
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
