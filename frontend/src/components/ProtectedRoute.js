import React from 'react';
import { useAuth } from '../utils/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="text-center mt-5">
        <h3>Please log in to continue</h3>
        <p>Use your email and password to login</p>
      </div>
    );
  }
  
  return children;
};

export default ProtectedRoute;