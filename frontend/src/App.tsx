import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRouteGuard from './components/RoleRouteGuard';
import AdminLayout from './components/layout/AdminLayout';
import CommandCenter from './pages/admin/CommandCenter';
import LiveMapPage from './pages/admin/LiveMapPage';
import SettingsPage from './pages/admin/SettingsPage';
import VolunteersPage from './pages/admin/VolunteersPage';
import OperationsPage from './pages/admin/OperationsPage';
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
  const markNotificationRead = useRahatStore((s) => s.markNotificationRead);
  const refreshFromStorage = useRahatStore((s) => s.refreshFromStorage);

  useEffect(() => {
    const refresh = () => { void refreshFromStorage(); };
    const interval = window.setInterval(refresh, 3000);
    window.addEventListener('storage', refresh);
    window.addEventListener('rahat-store-updated', refresh);
    return () => { window.clearInterval(interval); window.removeEventListener('storage', refresh); window.removeEventListener('rahat-store-updated', refresh); };
  }, [refreshFromStorage]);

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
      onMarkNotificationRead={markNotificationRead}
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
      <Route path="/admin/settings" element={<RoleRouteGuard allowedRoles={['coordinator']}><SettingsPage /></RoleRouteGuard>} />
      <Route path="/admin/volunteers" element={<RoleRouteGuard allowedRoles={['coordinator']}><VolunteersPage /></RoleRouteGuard>} />
      <Route path="/admin/requests" element={<RoleRouteGuard allowedRoles={['coordinator']}><OperationsPage section="requests" /></RoleRouteGuard>} />
      <Route path="/admin/resources" element={<RoleRouteGuard allowedRoles={['coordinator']}><OperationsPage section="resources" /></RoleRouteGuard>} />
      <Route path="/admin/incidents" element={<RoleRouteGuard allowedRoles={['coordinator']}><OperationsPage section="incidents" /></RoleRouteGuard>} />
      <Route path="/admin/shelters" element={<RoleRouteGuard allowedRoles={['coordinator']}><OperationsPage section="shelters" /></RoleRouteGuard>} />
      <Route path="/admin/analytics" element={<RoleRouteGuard allowedRoles={['coordinator']}><OperationsPage section="analytics" /></RoleRouteGuard>} />
      <Route path="/admin/notifications" element={<RoleRouteGuard allowedRoles={['coordinator']}><OperationsPage section="notifications" /></RoleRouteGuard>} />
      <Route path="/admin/audit-log" element={<RoleRouteGuard allowedRoles={['coordinator']}><OperationsPage section="audit" /></RoleRouteGuard>} />
      <Route path="/admin/*" element={<RoleRouteGuard allowedRoles={['coordinator']}><OperationsPage section="requests" /></RoleRouteGuard>} />
    </Route>
    <Route path="/citizen" element={<ProtectedRoute><RoleRouteGuard allowedRoles={['citizen']}><PortalPage title="Citizen assistance" /></RoleRouteGuard></ProtectedRoute>} />
    <Route path="/volunteer" element={<ProtectedRoute><RoleRouteGuard allowedRoles={['volunteer']}><PortalPage title="Volunteer missions" /></RoleRouteGuard></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
