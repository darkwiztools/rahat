import React, { useMemo } from 'react';
import {
  AlertTriangle,
  LifeBuoy,
  Users,
  Navigation,
  UsersRound,
  HandHeart,
  Package,
  CheckCheck,
  Clock,
  Bell,
  ChevronRight,
  MoreVertical,
  Droplets,
} from 'lucide-react';
import KpiCard from '../../components/ui/KpiCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SeverityBadge from '../../components/ui/SeverityBadge';
import AvailabilityBadge from '../../components/ui/AvailabilityBadge';
import { useRahatStore } from '../../store/useRahatStore';
import type { EmergencyRequest, Notification, Volunteer } from '../../types/rahat';
import { SEVERITY_ORDER } from '../../constants/rahat';

const TERMINAL_STATUSES = ['RESOLVED', 'CANCELLED'] as const;

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const CommandCenter: React.FC = () => {
  const requests = useRahatStore((s) => s.requests);
  const volunteers = useRahatStore((s) => s.volunteers);
  const resources = useRahatStore((s) => s.resources);
  const notifications = useRahatStore((s) => s.notifications);
  const markNotificationRead = useRahatStore((s) => s.markNotificationRead);

  const kpis = useMemo(() => {
    const activeRequests = requests.filter(
      (r) => !TERMINAL_STATUSES.includes(r.status as any)
    );
    const criticalCases = requests.filter(
      (r) =>
        r.severity === 'CRITICAL' &&
        !TERMINAL_STATUSES.includes(r.status as any)
    );
    const availableVolunteers = volunteers.filter(
      (v) => v.availability === 'AVAILABLE'
    );
    const activeMissions = volunteers.filter((v) => v.availability === 'BUSY');
    const peopleAffected = activeRequests.reduce(
      (sum, r) => sum + r.peopleAffected,
      0
    );
    const peopleAssisted = requests
      .filter((r) => r.status === 'RESOLVED' && isToday(r.updatedAt))
      .reduce((sum, r) => sum + r.peopleAffected, 0);
    const resourcesLow = resources.filter(
      (r) => r.quantity > 0 && r.quantity <= r.lowThreshold
    );
    const resolvedToday = requests.filter(
      (r) => r.status === 'RESOLVED' && isToday(r.updatedAt)
    ).length;

    return {
      activeRequests: activeRequests.length,
      criticalCases: criticalCases.length,
      availableVolunteers: availableVolunteers.length,
      activeMissions: activeMissions.length,
      peopleAffected,
      peopleAssisted,
      resourcesLow: resourcesLow.length,
      resolvedToday,
    };
  }, [requests, volunteers, resources]);

  const recentRequests = useMemo(() => {
    return [...requests]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);
  }, [requests]);

  const recentNotifications = useMemo(() => {
    return [...notifications].slice(0, 8);
  }, [notifications]);

  const volunteerWorkload = useMemo(() => {
    return [...volunteers]
      .sort(
        (a, b) =>
          b.currentAssignmentIds.length - a.currentAssignmentIds.length
      )
      .slice(0, 8);
  }, [volunteers]);

  const maxWorkload = Math.max(
    1,
    ...volunteerWorkload.map((v) => v.currentAssignmentIds.length)
  );

  const requestColumns = [
    {
      key: 'id',
      label: 'Request ID',
      stickyFirst: true,
      render: (row: EmergencyRequest) => (
        <span className="text-xs font-mono font-semibold text-slate-900">
          {row.id}
        </span>
      ),
    },
    {
      key: 'citizen',
      label: 'Citizen',
      render: (row: EmergencyRequest) => (
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">
            {row.citizenName}
          </div>
          <div className="text-xs text-slate-500">{row.citizenPhone}</div>
        </div>
      ),
    },
    {
      key: 'emergencyType',
      label: 'Emergency',
      render: (row: EmergencyRequest) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <Droplets className="w-3.5 h-3.5 text-sky-600" />
          {row.emergencyType}
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Priority',
      render: (row: EmergencyRequest) => (
        <SeverityBadge severity={row.severity} />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: EmergencyRequest) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row: EmergencyRequest) => (
        <span className="text-xs text-slate-500 inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(row.createdAt)}
        </span>
      ),
    },
  ];

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markNotificationRead(n.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Command Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            North Bihar Flood Response
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Last synced: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="ACTIVE REQUESTS"
          value={kpis.activeRequests}
          icon={AlertTriangle}
          variant="info"
          subtitle="Requiring response"
        />
        <KpiCard
          title="CRITICAL CASES"
          value={kpis.criticalCases}
          icon={LifeBuoy}
          variant="critical"
          subtitle="Immediate threat"
        />
        <KpiCard
          title="AVAILABLE VOLUNTEERS"
          value={kpis.availableVolunteers}
          icon={Users}
          variant="success"
          subtitle="Ready to deploy"
        />
        <KpiCard
          title="ACTIVE MISSIONS"
          value={kpis.activeMissions}
          icon={Navigation}
          variant="warning"
          subtitle="Volunteers busy"
        />
        <KpiCard
          title="PEOPLE AFFECTED"
          value={kpis.peopleAffected.toLocaleString()}
          icon={UsersRound}
          variant="info"
          subtitle="Active incidents"
        />
        <KpiCard
          title="PEOPLE ASSISTED"
          value={kpis.peopleAssisted.toLocaleString()}
          icon={HandHeart}
          variant="success"
          subtitle="Resolved today"
        />
        <KpiCard
          title="RESOURCES LOW"
          value={kpis.resourcesLow}
          icon={Package}
          variant="warning"
          subtitle="At or below threshold"
        />
        <KpiCard
          title="RESOLVED TODAY"
          value={kpis.resolvedToday}
          icon={CheckCheck}
          variant="success"
          subtitle="Closed requests"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest 10 emergency submissions
              </p>
            </div>
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <DataTable
            columns={requestColumns as any}
            rows={recentRequests}
            rowKey="id"
            className="max-h-[420px]"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 inline-flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                Recent Notifications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {recentNotifications.filter((n) => !n.read).length} unread
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No notifications yet.
              </div>
            ) : (
              recentNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors ${
                    !n.read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                        !n.read ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !n.read
                              ? 'font-semibold text-slate-900'
                              : 'font-medium text-slate-700'
                          } truncate`}
                        >
                          {n.title}
                        </p>
                        <MoreVertical className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Volunteer Workload
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Top 8 volunteers by active mission count
          </p>
        </div>
        <div className="p-5">
          {volunteerWorkload.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No volunteer data available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {volunteerWorkload.map((v) => {
                const count = v.currentAssignmentIds.length;
                const pct = (count / maxWorkload) * 100;
                const barColor =
                  count === 0
                    ? 'bg-slate-300'
                    : count >= 4
                    ? 'bg-red-500'
                    : count >= 2
                    ? 'bg-amber-500'
                    : 'bg-emerald-500';
                return (
                  <div
                    key={v.id}
                    className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {v.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {v.name}
                          </p>
                        </div>
                        <div className="mt-1">
                          <AvailabilityBadge
                            availability={v.availability}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-700">
                          {count} active mission{count === 1 ? '' : 's'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {v.completedMissions} done
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${count === 0 ? 4 : pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
