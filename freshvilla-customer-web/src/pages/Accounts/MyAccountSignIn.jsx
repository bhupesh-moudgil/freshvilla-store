import React, { useState } from "react";
import signinimage from '../../images/signin-g.svg'
import { Link, useNavigate } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import OTPModal from '../../components/OTPModal';
import Swal from 'sweetalert2';
// import Grocerylogo from '../../images/Grocerylogo.png'

const MyAccountSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpData, setOtpData] = useState({ customerId: '', email: '' });
  const { login, verifyOTP } = useCustomerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.requiresOTP) {
        // Show OTP modal for suspicious login
        setOtpData({
          customerId: result.customerId,
          email: result.email
        });
        setShowOTPModal(true);
        Swal.fire({
          icon: 'warning',
          title: 'Security Verification Required',
          text: 'We detected suspicious activity. Please check your email for OTP.',
          confirmButtonColor: '#0aad0a'
        });
      } else {
        Swal.fire('Success!', 'Logged in successfully', 'success');
        navigate('/MyAccountOrder');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    try {
      await verifyOTP(otpData.customerId, otp, 'login');
      setShowOTPModal(false);
      Swal.fire('Success!', 'Login verified successfully', 'success');
      navigate('/MyAccountOrder');
    } catch (error) {
      throw error; // Pass error to OTP modal
    }
  };

  return (
    <div>
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        purpose="login"
        customerId={otpData.customerId}
        email={otpData.email}
      />
      <>
        <div>
          {/* navigation */}
          {/* <div className="border-bottom shadow-sm">
            <nav className="navbar navbar-light py-2">
              <div className="container justify-content-center justify-content-lg-between">
                <Link className="navbar-brand" to="../index.html">
                  <img
                    src={Grocerylogo}
                    alt="freshvilla"
                    className="d-inline-block align-text-top"
                  />
                </Link>
                <span className="navbar-text">
                  Already have an account? <Link to="signin.html">Sign in</Link>
                </span>
              </div>
            </nav>
          </div> */}
          {/* section */}
          <>
            <ScrollToTop/>
            </>
          <section className="my-lg-14 my-8">
            <div className="container">
              {/* row */}
              <div className="row justify-content-center align-items-center">
                <div className="col-12 col-md-6 col-lg-4 order-lg-1 order-2">
                  {/* img */}
                  <img
                    src={signinimage}
                    alt="freshvilla"
                    className="img-fluid"
                  />
                </div>
                {/* col */}
                <div className="col-12 col-md-6 offset-lg-1 col-lg-4 order-lg-2 order-1">
                  <div className="mb-lg-9 mb-5">
                    <h1 className="mb-1 h2 fw-bold">Sign in to FreshVilla</h1>
                    <p>
                      Welcome back to FreshVilla! Enter your email to get
                      started.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* row */}
                      <div className="col-12">
                        {/* input */}
                        <input
                          type="email"
                          className="form-control"
                          id="inputEmail4"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        {/* input */}
                        <input
                          type="password"
                          className="form-control"
                          id="inputPassword4"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="d-flex justify-content-between">
                        {/* form check */}
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            defaultValue
                            id="flexCheckDefault"
                          />
                          {/* label */}{" "}
                          <label
                            className="form-check-label"
                            htmlFor="flexCheckDefault"
                          >
                            Remember me
                          </label>
                        </div>
                        <div>
                          {" "}
                          Forgot password?{" "}
                          <Link to="/MyAccountForgetPassword">Reset it</Link>
                        </div>
                      </div>
                      {/* btn */}
                      <div className="col-12 d-grid">
                        {" "}
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                      </div>
                      {/* link */}
                      <div>
                        Don’t have an account?{" "}
                        <Link to="/MyAccountSignUp"> Sign Up</Link>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
    </div>
  );
};

export default MyAccountSignIn;
