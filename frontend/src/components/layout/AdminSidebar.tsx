import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Map,
  Users,
  Package,
  AlertTriangle,
  Home,
  BarChart3,
  Bell,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Crown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  route: string;
  label: string;
  icon: LucideIcon;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { route: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { route: '/admin/requests', label: 'Requests', icon: FileText },
  { route: '/admin/map', label: 'Live Map', icon: Map },
  { route: '/admin/volunteers', label: 'Volunteers', icon: Users },
  { route: '/admin/resources', label: 'Resources', icon: Package },
  { route: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
  { route: '/admin/shelters', label: 'Shelters', icon: Home },
  { route: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { route: '/admin/notifications', label: 'Notifications', icon: Bell },
  { route: '/admin/audit-log', label: 'Audit Log', icon: ClipboardList },
  { route: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeRoute: string;
  onNavigate: (route: string) => void;
  role?: 'citizen' | 'volunteer' | 'coordinator';
  unreadNotifications?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  activeRoute,
  onNavigate,
  role,
  unreadNotifications = 0,
}) => {
  const width = collapsed ? 'w-20' : 'w-64';

  const isActive = (route: string) => {
    if (route === '/admin/dashboard')
      return activeRoute === route || activeRoute === '/admin';
    return activeRoute === route || activeRoute.startsWith(route + '/');
  };

  const isCoordinator = role === 'coordinator';

  return (
    <aside
      className={`${width} hidden md:flex lg:flex flex-col bg-slate-900 text-slate-100 min-h-screen border-r border-slate-800 transition-all duration-300 flex-shrink-0`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="text-sm font-bold text-white leading-tight">RAHAT</div>
              <div className="text-[11px] text-slate-400 leading-tight flex items-center gap-1">
                Command Center
                {isCoordinator && (
                  <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                    <Crown className="w-2.5 h-2.5" />
                    COORDINATOR
                  </span>
                )}
              </div>
            </div>
          )}
          {collapsed && isCoordinator && (
            <span
              className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0 ml-auto"
              title="Coordinator"
            />
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.route);
          const hasUnreadBadge =
            item.route === '/admin/notifications' && unreadNotifications > 0;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                active
                  ? 'bg-slate-800 text-white border-l-4 border-blue-500 pl-[10px]'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-400' : ''}`} />
              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              {!collapsed && hasUnreadBadge && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
              {collapsed && hasUnreadBadge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <div
          className={`text-[11px] text-slate-500 ${collapsed ? 'text-center' : ''}`}
        >
          {collapsed ? 'v1.0' : 'RAHAT Platform v1.0'}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
