import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/rahat';

interface RoleRouteGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
}

function portalForRole(role: Role): string {
  switch (role) {
    case 'citizen':
      return '/citizen';
    case 'volunteer':
      return '/volunteer';
    case 'coordinator':
      return '/admin';
    default:
      return '/login';
  }
}

const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({ children, allowedRoles }) => {
  const { currentUser, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={portalForRole(userRole)} replace />;
  }

  return <>{children}</>;
};

export default RoleRouteGuard;
