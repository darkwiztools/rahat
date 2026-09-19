import React, { useRef, useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Wifi,
  WifiOff,
  AlertTriangle,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import type { UserProfile, Incident, Notification, EmergencyRequest } from '../../types/rahat';
import NotificationsDrawer from './NotificationsDrawer';

interface TopBarProps {
  onToggleSidebar: () => void;
  user: UserProfile | null;
  requests?: EmergencyRequest[];
  notifications: Notification[];
  incidents: Incident[];
  selectedIncidentId?: string;
  onIncidentChange: (incidentId: string) => void;
  onSearch: (query: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onNavigate: (route: string) => void;
  offline?: boolean;
  onLogout?: () => void;
}

const statusColorForIncident = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-red-600';
    case 'Contained':
      return 'bg-amber-500';
    case 'Monitoring':
      return 'bg-blue-500';
    case 'Closed':
      return 'bg-slate-400';
    default:
      return 'bg-slate-400';
  }
};

const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  user,
  notifications,
  incidents,
  selectedIncidentId,
  onIncidentChange,
  onSearch,
  onMarkNotificationRead,
  onNavigate,
  offline = false,
  onLogout,
}) => {
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const incidentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeIncidents = incidents.filter(
    (i) => i.status === 'Active' || i.status === 'Monitoring'
  );
  const currentIncidentId = selectedIncidentId || activeIncidents[0]?.id || incidents[0]?.id || '';
  const selectedIncident =
    incidents.find((i) => i.id === currentIncidentId) || incidents[0] || null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (incidentRef.current && !incidentRef.current.contains(e.target as Node)) {
        setIncidentOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleIncidentSelect = (id: string) => {
    onIncidentChange(id);
    setIncidentOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || '')
        .join('')
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 shadow-sm flex items-center">
      <div className="flex items-center gap-3 px-4 w-full">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:block relative" ref={incidentRef}>
          <button
            type="button"
            onClick={() => setIncidentOpen((o) => !o)}
            className="inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-colors text-sm"
          >
            {selectedIncident ? (
              <>
                <span
                  className={`w-2 h-2 rounded-full ${statusColorForIncident(
                    selectedIncident.status
                  )}`}
                />
                <span className="font-semibold text-slate-800 max-w-[180px] truncate">
                  {selectedIncident.name}
                </span>
                <span className="text-xs text-slate-500 hidden xl:inline">
                  {selectedIncident.type} • {selectedIncident.severity}
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">No incident</span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {incidentOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] w-80 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Select active incident
                </div>
              </div>
              <ul className="max-h-[320px] overflow-y-auto">
                {incidents.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-slate-500">
                    No incidents defined.
                  </li>
                ) : (
                  incidents.map((inc) => (
                    <li key={inc.id}>
                      <button
                        type="button"
                        onClick={() => handleIncidentSelect(inc.id)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                          inc.id === selectedIncident?.id ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${statusColorForIncident(
                            inc.status
                          )}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-900 truncate">
                              {inc.name}
                            </span>
                            <span className="text-xs text-slate-400 flex-shrink-0">
                              {inc.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {inc.type} • {inc.severity} • {inc.affectedArea}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search requests, volunteers, locations…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" title="Connected">
            <Wifi className="w-3.5 h-3.5" />
            <span>Online</span>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`${unreadCount} unread notifications`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm ring-2 ring-white">
                {initials}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-sm font-semibold text-slate-800 max-w-[140px] truncate">
                  {user?.name || user?.email || 'Guest'}
                </div>
                <div className="text-[11px] text-slate-500 capitalize">
                  {user?.role || 'User'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {user?.name || user?.email || 'Guest User'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {user?.email || ''}
                      </div>
                      <div className="mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                        {user?.role || 'user'}
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="py-1.5">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onNavigate('/admin/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onNavigate('/admin/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      Settings
                    </button>
                  </li>
                </ul>
                <div className="border-t border-slate-100 py-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        onRead={onMarkNotificationRead}
        onNavigate={onNavigate}
      />
    </header>
  );
};

export default TopBar;
