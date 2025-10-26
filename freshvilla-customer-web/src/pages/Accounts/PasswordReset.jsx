import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    } else {
      Swal.fire('Error', 'Invalid reset link', 'error');
      navigate('/MyAccountSignIn');
    }
  }, [searchParams, navigate]);

  const verifyToken = async (tokenValue) => {
    try {
      const response = await axios.post(`${API_URL}/password-reset/verify`, {
        token: tokenValue
      });
      
      if (response.data.success) {
        setIsValidToken(true);
      } else {
        Swal.fire('Error', 'Invalid or expired reset link', 'error');
        navigate('/MyAccountSignIn');
      }
    } catch (error) {
      Swal.fire('Error', 'Invalid or expired reset link', 'error');
      navigate('/MyAccountSignIn');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/password-reset/reset`, {
        token,
        newPassword
      });

      if (response.data.success) {
        Swal.fire('Success!', 'Password reset successful. You can now login with your new password.', 'success');
        navigate('/MyAccountSignIn');
      } else {
        Swal.fire('Error', response.data.message, 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="container my-14">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Validating...</span>
            </div>
            <p className="mt-3">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return null;
  }

  return (
    <section className="my-lg-14 my-8">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="mb-lg-9 mb-5">
              <h1 className="mb-1 h2 fw-bold">Reset Your Password</h1>
              <p>Enter your new password below.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                />
                <small className="text-muted">Minimum 6 characters</small>
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>

              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>

              <div className="mt-3 text-center">
                <a href="/MyAccountSignIn" className="text-decoration-none">
                  Back to Sign In
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PasswordReset;
