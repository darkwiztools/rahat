import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRouteGuard from './components/RoleRouteGuard';
import AdminLayout from './components/layout/AdminLayout';
import CommandCenter from './pages/admin/CommandCenter';
import LiveMapPage from './pages/admin/LiveMapPage';
import LoginPage from './pages/shared/LoginPage';
import PortalPage from './pages/shared/PortalPage';
import { useAuth } from './context/AuthContext';
import { useRahatStore } from './store/useRahatStore';

const AdminShell: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const backendOnline = useRahatStore((s) => s.backendOnline);
  const dismissOfflineBanner = useRahatStore((s) => s.dismissOfflineBanner);
  const offlineBannerDismissed = useRahatStore((s) => s.offlineBannerDismissed);
  const requests = useRahatStore((s) => s.requests);
  const notifications = useRahatStore((s) => s.notifications);
  const incidents = useRahatStore((s) => s.incidents);

  return (
    <AdminLayout
      currentUser={currentUser}
      requests={requests}
      notifications={notifications}
      incidents={incidents}
      backendOnline={backendOnline}
      offlineBannerDismissed={offlineBannerDismissed}
      onDismissOfflineBanner={dismissOfflineBanner}
      onLogout={logout}
    />
  );
};

const App: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<RoleRouteGuard allowedRoles={['coordinator']}><CommandCenter /></RoleRouteGuard>} />
      <Route path="/admin/map" element={<RoleRouteGuard allowedRoles={['coordinator']}><LiveMapPage /></RoleRouteGuard>} />
      <Route path="/admin/*" element={<RoleRouteGuard allowedRoles={['coordinator']}><PortalPage title="Operations workspace" /></RoleRouteGuard>} />
    </Route>
    <Route path="/citizen" element={<ProtectedRoute><RoleRouteGuard allowedRoles={['citizen']}><PortalPage title="Citizen assistance" /></RoleRouteGuard></ProtectedRoute>} />
    <Route path="/volunteer" element={<ProtectedRoute><RoleRouteGuard allowedRoles={['volunteer']}><PortalPage title="Volunteer missions" /></RoleRouteGuard></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
