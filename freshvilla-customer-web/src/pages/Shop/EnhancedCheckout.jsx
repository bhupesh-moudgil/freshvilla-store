import React, { useState } from 'react';
import { sendOrderToWhatsApp } from '../../utils/whatsapp';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ordersAPI, customerAuthAPI } from '../../services/api';
import OTPModal from '../../components/OTPModal';
import Swal from 'sweetalert2';

const EnhancedCheckout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpData, setOtpData] = useState({ customerId: '', email: '' });
  const [otpVerified, setOtpVerified] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    pincode: '',
    notes: ''
  });

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="container my-5 text-center">
        <div className="py-5">
          <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#ccc' }}></i>
          <h3 className="mt-3">Your cart is empty</h3>
          <p className="text-muted">Add some products to checkout</p>
          <Link to="/Shop" className="btn btn-success mt-3">
            <i className="bi bi-shop me-2"></i>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }


  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      Swal.fire('Error', 'Please enter your name', 'error');
      return false;
    }
    if (!customerInfo.mobile.trim() || customerInfo.mobile.length < 10) {
      Swal.fire('Error', 'Please enter a valid 10-digit mobile number', 'error');
      return false;
    }
    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) {
      Swal.fire('Error', 'Please enter a valid email address', 'error');
      return false;
    }
    if (!customerInfo.address.trim()) {
      Swal.fire('Error', 'Please enter your delivery address', 'error');
      return false;
    }
    if (!customerInfo.city.trim()) {
      Swal.fire('Error', 'Please enter your city', 'error');
      return false;
    }
    if (!customerInfo.pincode.trim() || customerInfo.pincode.length !== 6) {
      Swal.fire('Error', 'Please enter a valid 6-digit pincode', 'error');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if customer is logged in and OTP not verified yet
    if (customer && !otpVerified) {
      // Request OTP for checkout
      try {
        const response = await ordersAPI.requestOTP({
          customerId: customer.id,
          orderTotal: getCartTotal()
        });

        if (response.data.success) {
          setOtpData({
            customerId: response.data.data.customerId,
            email: response.data.data.email
          });
          setShowOTPModal(true);
          Swal.fire({
            icon: 'info',
            title: 'Verify Your Order',
            text: 'Please check your email for the verification code.',
            confirmButtonColor: '#0aad0a'
          });
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to send OTP', 'error');
      }
      return;
    }

    // OTP verified or guest checkout - proceed with order
    await processOrder();
  };

  const handleOTPVerify = async (otp) => {
    try {
      await customerAuthAPI.verifyOTP({
        customerId: otpData.customerId,
        otp,
        purpose: 'checkout'
      });
      setShowOTPModal(false);
      setOtpVerified(true);
      Swal.fire('Verified!', 'OTP verified successfully', 'success').then(() => {
        // Now process the order
        processOrder();
      });
    } catch (error) {
      throw error; // Pass error to OTP modal
    }
  };

  const processOrder = async () => {
    // Show confirmation
    Swal.fire({
      title: 'Submit Order?',
      html: `
        <p>Your order will be sent to our WhatsApp.</p>
        <p><strong>Total: ₹${getCartTotal()}</strong></p>
        <p class="text-muted small">You will be redirected to WhatsApp to confirm your order.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0aad0a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Send Order!',
      cancelButtonText: 'Review Again'
    }).then((result) => {
      if (result.isConfirmed) {
        // Prepare full customer info for WhatsApp
        const fullInfo = {
          name: customerInfo.name,
          phone: customerInfo.mobile,
          email: customerInfo.email,
          address: `${customerInfo.address}, ${customerInfo.city} - ${customerInfo.pincode}`,
          notes: customerInfo.notes
        };

        // Send to WhatsApp
        sendOrderToWhatsApp(cartItems, fullInfo);

        // Show success message
        Swal.fire({
          title: 'Order Sent!',
          html: `
            <p>✅ Your order has been sent to our WhatsApp.</p>
            <p>📞 Our agent will call you on <strong>${customerInfo.mobile}</strong> to confirm payment and delivery.</p>
            <p class="text-muted small mt-3">Please keep your WhatsApp open to track your order.</p>
          `,
          icon: 'success',
          confirmButtonColor: '#0aad0a',
          confirmButtonText: 'Got it!'
        }).then(() => {
          // Clear cart after successful order
          clearCart();
          // Reset OTP verification for next order
          setOtpVerified(false);
          // Redirect to home
          navigate('/');
        });
      }
    });
  };

  return (
    <div className="container my-5">
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        purpose="checkout"
        customerId={otpData.customerId}
        email={otpData.email}
      />
      <div className="row">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/Shop">Shop</Link></li>
              <li className="breadcrumb-item active">Checkout</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Customer Information */}
        <div className="col-lg-7 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Customer Information
              </h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmitOrder}>
                {/* Personal Information */}
                <h5 className="text-success mb-3">Personal Details</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="mobile"
                      value={customerInfo.mobile}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                {/* Delivery Address */}
                <h5 className="text-success mb-3 mt-4">Delivery Address</h5>
                <div className="mb-3">
                  <label className="form-label">Address *</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    placeholder="House No., Street, Locality"
                    rows="2"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pincode"
                      value={customerInfo.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-3">
                  <label className="form-label">Order Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery..."
                    rows="2"
                  />
                </div>

                {/* Payment Info Alert */}
                <div className="alert alert-info mt-4">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  <strong>Cash on Delivery</strong>
                  <p className="mb-0 small mt-1">Our agent will call you to confirm your order and arrange payment.</p>
                </div>

                <button type="submit" className="btn btn-success btn-lg w-100 mt-3">
                  <i className="bi bi-whatsapp me-2"></i>
                  Submit Order via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-light">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              {cartItems.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.name}</h6>
                    <small className="text-muted">Qty: {item.quantity} × ₹{item.price}</small>
                  </div>
                  <div className="fw-bold">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}

              <div className="border-top pt-3 mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                  <h5 className="mb-0">Total</h5>
                  <h5 className="mb-0 text-success">₹{getCartTotal()}</h5>
                </div>
              </div>

              <div className="alert alert-success mt-4 mb-0">
                <i className="bi bi-shield-check me-2"></i>
                <small>
                  <strong>100% Secure</strong><br/>
                  Your order will be confirmed via WhatsApp call
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCheckout;
