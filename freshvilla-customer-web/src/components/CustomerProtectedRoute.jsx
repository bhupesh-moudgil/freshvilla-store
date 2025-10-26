import { Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

const CustomerProtectedRoute = ({ children }) => {
  const { customer } = useCustomerAuth();

  if (!customer) {
    // Redirect to sign in if not authenticated
    return <Navigate to="/MyAccountSignIn" replace />;
  }

  return children;
};

export default CustomerProtectedRoute;
