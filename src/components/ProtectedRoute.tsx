import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission } from '../services/permissions';
import type { Permission, Role } from '../services/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  permission?: Permission;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, permission }) => {
  const token = localStorage.getItem('inox_token');
  const location = useLocation();

  if (!token) {
    if (allowedRoles && (allowedRoles as string[]).includes('guest')) {
      return <>{children}</>;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('inox_token');
      if (allowedRoles && (allowedRoles as string[]).includes('guest')) {
        return <>{children}</>;
      }
      return <Navigate to="/login" replace />;
    }

    const userRole = (payload.role || 'guest') as Role;

    // Check by permission if provided
    if (permission && !hasPermission(userRole, permission)) {
      console.warn(`[ProtectedRoute] Access denied for permission: ${permission}. User role: ${userRole}`);
      return <Navigate to="/dashboard" replace />;
    }

    // Check by role if provided (legacy support)
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Legacy mapping: athlete -> user
      const effectiveRole = userRole === 'athlete' ? 'user' : userRole;
      if (!allowedRoles.includes(effectiveRole as Role)) {
        console.warn(`[ProtectedRoute] Access denied for role: ${userRole}. Required: ${allowedRoles.join(', ')}`);
        return <Navigate to="/dashboard" replace />;
      }
    }

    return <>{children}</>;
  } catch (e) {
    localStorage.removeItem('inox_token');
    if (allowedRoles && (allowedRoles as string[]).includes('guest')) {
        return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

