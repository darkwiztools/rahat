import React, { useMemo } from 'react';
import { X, Bell, AlertTriangle, FileText, Users, Package, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Notification, Role, UserProfile } from '../types/rahat';
import { useRahatStore } from '../store/useRahatStore';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onNavigate?: (route: string) => void;
}

function iconForType(type: string): { icon: LucideIcon; color: string; bg: string } {
  const t = type.toUpperCase();
  if (t.includes('CRITICAL') || t.includes('INCIDENT') || t.includes('URGENT') || t.includes('SOS')) {
    return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' };
  }
  if (t.includes('MISSION') || t.includes('VOLUNTEER') || t.includes('ASSIGN')) {
    return { icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' };
  }
  if (t.includes('RESOURCE') || t.includes('ALLOCAT') || t.includes('STOCK')) {
    return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' };
  }
  if (t.includes('RESOLVED') || t.includes('COMPLETED') || t.includes('DELIVERED')) {
    return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' };
  }
  if (t.includes('REQUEST') || t.includes('STATUS') || t.includes('NEW_')) {
    return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' };
  }
  return { icon: Info, color: 'text-slate-600', bg: 'bg-slate-100' };
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.max(1, Math.floor(diff / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return 'recently';
  }
}

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigate,
}) => {
  const allNotifications = useRahatStore((s) => s.notifications);
  const markRead = useRahatStore((s) => s.markNotificationRead);

  const notifications = useMemo(() => {
    if (!currentUser) return allNotifications;
    return allNotifications.filter((n: Notification) => {
      const matchesRole = n.targetRole && n.targetRole === (currentUser.role as Role);
      const matchesUser = n.targetUserId && n.targetUserId === currentUser.id;
      const isBroadcast = !n.targetRole && !n.targetUserId;
      return matchesRole || matchesUser || isBroadcast;
    });
  }, [allNotifications, currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    if (onNavigate) {
      if (n.relatedRequestId) {
        onNavigate(`/admin/requests/${n.relatedRequestId}`);
      } else {
        onNavigate('/admin/notifications');
      }
    }
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 right-0 z-[60] h-full w-full sm:w-[420px] max-w-[100vw] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
              <p className="text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread • ${notifications.length} total`
                  : `${notifications.length} total`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">No notifications yet</h3>
              <p className="text-sm text-slate-500">
                You'll see new requests, mission updates, and alerts here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => {
                const { icon: Icon, color, bg } = iconForType(n.type);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className="w-full flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={`w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${n.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                            {n.title}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" aria-label="Unread" />
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="p-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('/admin/notifications');
              onClose();
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
          >
            View all notifications
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </aside>
    </>
  );
};

export default NotificationsDrawer;
