import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="col-12 col-md-6 text-center">
          <h1 className="display-1 fw-bold text-success">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="text-muted mb-4">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-success">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
