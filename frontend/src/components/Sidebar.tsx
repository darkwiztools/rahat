import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Folder,
  ImageIcon,
  VideoIcon,
  FileText,
  MapPin,
  Search,
  ShieldCheck,
  PhoneCall,
  Wifi,
  Radio,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { name?: string; email?: string; role?: string } | null;
  onLogout?: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cases', label: 'Cases', icon: FolderKanban },
  { path: '/evidence', label: 'Evidence', icon: Folder },
  { path: '/image-forensics', label: 'Image Forensics', icon: ImageIcon },
  { path: '/video-forensics', label: 'Video Forensics', icon: VideoIcon },
  { path: '/pdf-forensics', label: 'PDF Forensics', icon: FileText },
  { path: '/geospatial-osint', label: 'Geospatial OSINT', icon: MapPin },
  { path: '/osint', label: 'OSINT', icon: Search },
  { path: '/hashes', label: 'Hashes / Integrity', icon: ShieldCheck },
  { path: '/cdr-analyzer', label: 'CDR Analyzer', icon: PhoneCall },
  { path: '/ipdr-analyzer', label: 'IPDR Analyzer', icon: Wifi },
  { path: '/tower-dump', label: 'Tower Dump Analyzer', icon: Radio },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">RAHAT</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-4">
            {(user?.name || user?.email) && (
              <div className="mb-3">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || user?.email || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.role || 'User'}
                </p>
              </div>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
