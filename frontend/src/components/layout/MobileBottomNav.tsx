import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Map,
  Bell,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BottomNavItem {
  key: string;
  route: string;
  label: string;
  icon: LucideIcon;
}

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { key: 'dashboard', route: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { key: 'requests', route: '/admin/requests', label: 'Requests', icon: FileText },
  { key: 'map', route: '/admin/map', label: 'Map', icon: Map },
  { key: 'notifications', route: '/admin/notifications', label: 'Notifications', icon: Bell },
  { key: 'profile', route: '/admin/settings', label: 'Profile', icon: User },
];

interface MobileBottomNavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  unreadNotifications?: number;
}

const isActive = (activeRoute: string, route: string) => {
  if (route === '/admin/dashboard')
    return activeRoute === route || activeRoute === '/admin';
  if (route === '/admin/settings')
    return activeRoute === route || activeRoute.startsWith(route + '/');
  return activeRoute === route || activeRoute.startsWith(route + '/');
};

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeRoute,
  onNavigate,
  unreadNotifications = 0,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_8px_rgba(15,23,42,0.06)] pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(activeRoute, item.route);
          const showBadge = item.key === 'notifications' && unreadNotifications > 0;
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onNavigate(item.route)}
                className={`w-full flex flex-col items-center justify-center py-2 gap-0.5 transition-colors relative ${
                  active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${active ? 'stroke-[2.25px]' : ''}`}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
