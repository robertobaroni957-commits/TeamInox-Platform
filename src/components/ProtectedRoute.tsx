import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('inox_token');
  const location = useLocation();

  // If GUEST is allowed, we don't strictly need a token
  if (!token) {
    if (allowedRoles && allowedRoles.includes('guest')) {
      return <>{children}</>;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Controllo scadenza
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('inox_token');
      if (allowedRoles && allowedRoles.includes('guest')) {
        return <>{children}</>;
      }
      return <Navigate to="/login" replace />;
    }

    // Controllo ruoli
    const userRole = payload.role === 'athlete' ? 'user' : payload.role;
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  } catch (e) {
    localStorage.removeItem('inox_token');
    if (allowedRoles && allowedRoles.includes('guest')) {
        return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
