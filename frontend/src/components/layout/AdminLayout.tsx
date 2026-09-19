import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { WifiOff, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import MobileBottomNav from './MobileBottomNav';
import TopBar from './TopBar';
import type {
  UserProfile,
  Incident,
  Notification,
  EmergencyRequest,
} from '../../types/rahat';

interface AdminLayoutProps {
  currentUser?: UserProfile | null;
  requests?: EmergencyRequest[];
  notifications?: Notification[];
  incidents?: Incident[];
  selectedIncidentId?: string;
  backendOnline?: boolean;
  offlineBannerDismissed?: boolean;
  onDismissOfflineBanner?: () => void;
  onMarkNotificationRead?: (id: string) => void;
  onIncidentChange?: (incidentId: string) => void;
  onLogout?: () => void | Promise<void>;
  onSearch?: (query: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser = null,
  requests = [],
  notifications = [],
  incidents = [],
  selectedIncidentId,
  backendOnline = true,
  offlineBannerDismissed = false,
  onDismissOfflineBanner,
  onMarkNotificationRead = () => {},
  onIncidentChange = () => {},
  onLogout,
  onSearch = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isBelowLg, setIsBelowLg] = useState(false);
  const [isBelowMd, setIsBelowMd] = useState(false);
  const [localBannerDismissed, setLocalBannerDismissed] = useState(offlineBannerDismissed);

  const activeRoute = location.pathname;
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const check = () => {
      setIsBelowLg(window.innerWidth < 1024);
      setIsBelowMd(window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isBelowMd) setMobileSidebarOpen(false);
  }, [isBelowMd]);

  const handleNavigate = (route: string) => {
    navigate(route);
    setMobileSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    if (isBelowMd) {
      setMobileSidebarOpen((o) => !o);
    } else {
      setCollapsed((c) => !c);
    }
  };

  const handleIncidentChange = (incidentId: string) => {
    onIncidentChange(incidentId);
  };

  const handleSearch = (query: string) => {
    onSearch(query);
  };

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    navigate('/login');
  };

  const handleDismissBanner = () => {
    setLocalBannerDismissed(true);
    onDismissOfflineBanner?.();
  };

  const showOfflineBanner = !backendOnline && !localBannerDismissed;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {showOfflineBanner && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800">
          <div className="flex items-center justify-between px-4 py-2 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-2 text-sm">
              <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <span className="font-semibold">Offline mode.</span> Changes are saved
                locally and will sync when the backend returns.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="p-1 rounded-md hover:bg-amber-100 text-amber-700"
              aria-label="Dismiss offline banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div
          className={`${
            isBelowMd ? 'hidden' : isBelowLg && collapsed ? 'hidden md:flex' : 'flex'
          }`}
        >
          <AdminSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            activeRoute={activeRoute}
            onNavigate={handleNavigate}
            role={currentUser?.role}
            unreadNotifications={unreadCount}
          />
        </div>

        {isBelowMd && mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 z-50">
              <AdminSidebar
                collapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
                activeRoute={activeRoute}
                onNavigate={handleNavigate}
                role={currentUser?.role}
                unreadNotifications={unreadCount}
              />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 pb-16 sm:pb-0">
          <TopBar
            onToggleSidebar={handleToggleSidebar}
            user={currentUser}
            requests={requests}
            notifications={notifications}
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onIncidentChange={handleIncidentChange}
            onSearch={handleSearch}
            onMarkNotificationRead={onMarkNotificationRead}
            onNavigate={handleNavigate}
            offline={!backendOnline}
            onLogout={handleLogout}
          />

          <main className="flex-1 min-h-0">
            <div className="px-4 py-6 max-w-screen-2xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        unreadNotifications={unreadCount}
      />
    </div>
  );
};

export default AdminLayout;
