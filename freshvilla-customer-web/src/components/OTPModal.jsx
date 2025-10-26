import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const OTPModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  purpose, 
  customerId, 
  email 
}) => {
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onVerify(otp);
      // Success - modal will be closed by parent
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResend = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/customer/auth/resend-otp`,
        { customerId, purpose }
      );
      
      if (response.data.success) {
        setTimeLeft(600);
        setCanResend(false);
        setOTP('');
        Swal.fire({
          icon: 'success',
          title: 'OTP Resent',
          text: 'A new OTP has been sent to your email',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleVerify();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title">
              {purpose === 'login' ? (
                <>
                  <i className="bi bi-shield-exclamation text-warning me-2"></i>
                  Security Verification
                </>
              ) : (
                <>
                  <i className="bi bi-cart-check text-success me-2"></i>
                  Verify Your Order
                </>
              )}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="text-center mb-4">
              <p className="text-muted mb-2">
                Enter the 6-digit code sent to
              </p>
              <p className="fw-bold text-success">{email}</p>
            </div>
            
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg text-center"
                style={{ 
                  fontSize: '24px', 
                  letterSpacing: '0.5rem',
                  fontFamily: 'monospace'
                }}
                maxLength={6}
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                disabled={loading}
                autoFocus
              />
            </div>
            
            {error && (
              <div className="alert alert-danger py-2">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </div>
            )}
            
            <div className="text-center mb-3">
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                Time remaining: <strong>{formatTime(timeLeft)}</strong>
              </small>
            </div>
            
            <div className="d-grid gap-2">
              <button
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className="btn btn-success btn-lg"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Verify OTP
                  </>
                )}
              </button>
              
              <button
                onClick={handleResend}
                disabled={!canResend || loading}
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                {canResend ? 'Resend OTP' : `Resend in ${formatTime(timeLeft)}`}
              </button>
            </div>
            
            <div className="text-center mt-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Didn't receive? Check your spam folder
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
