import React, { createContext, useState, useEffect, useContext } from 'react';
import { customerAuthAPI } from '../services/api';

const CustomerAuthContext = createContext({});

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const customerData = localStorage.getItem('customer_user');
    
    if (token && customerData) {
      try {
        setCustomer(JSON.parse(customerData));
      } catch (e) {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await customerAuthAPI.login({ email, password });
      
      if (response.data.success) {
        // Check if OTP is required
        if (response.data.requiresOTP) {
          return {
            success: true,
            requiresOTP: true,
            customerId: response.data.data.customerId,
            email: response.data.data.email
          };
        }
        
        // Normal login flow
        const { token, customer: customerData } = response.data.data;
        
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(customerData));
        setCustomer(customerData);
        
        return { success: true, customer: customerData };
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const verifyOTP = async (customerId, otp, purpose) => {
    try {
      const response = await customerAuthAPI.verifyOTP({ customerId, otp, purpose });
      
      if (response.data.success && purpose === 'login') {
        const { token, customer: customerData } = response.data.data;
        
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(customerData));
        setCustomer(customerData);
        
        return { success: true, customer: customerData };
      }
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const register = async (data) => {
    try {
      const response = await customerAuthAPI.register(data);
      
      if (response.data.success) {
        const { token, customer: customerData } = response.data.data;
        
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(customerData));
        setCustomer(customerData);
        
        return { success: true, customer: customerData };
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    setCustomer(null);
  };

  const isAuthenticated = () => {
    return !!customer && !!localStorage.getItem('customer_token');
  };

  const value = {
    customer,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    verifyOTP
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {!loading && children}
    </CustomerAuthContext.Provider>
  );
};

export default CustomerAuthContext;
