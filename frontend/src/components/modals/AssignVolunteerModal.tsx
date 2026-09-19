import React, { useMemo, useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import DataTable from '../ui/DataTable';
import { Users, Award, CheckCircle2, XCircle, MapPin, Briefcase, Check, AlertTriangle } from 'lucide-react';
import type { Volunteer } from '../../types/rahat';
import { useRahatStore, useCurrentUser } from '../../store/useRahatStore';
import { matchScoreVolunteer } from '../../utils/matchScore';
import AvailabilityBadge from '../ui/AvailabilityBadge';
import { haversineKm } from '../../utils/geo';

interface AssignVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

interface ScoreRow {
  volunteer: Volunteer;
  overall: number;
  skill: number;
  availability: number;
  distance: number;
  workload: number;
  suggested: boolean;
  distanceKm: number;
}

const AssignVolunteerModal: React.FC<AssignVolunteerModalProps> = ({ isOpen, onClose, requestId }) => {
  const requests = useRahatStore((s) => s.requests);
  const volunteers = useRahatStore((s) => s.volunteers);
  const assign = useRahatStore((s) => s.assignVolunteerToRequest);
  const currentUser = useCurrentUser();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const request = useMemo(
    () => (requestId ? requests.find((r) => r.id === requestId) || null : null),
    [requests, requestId]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setError('');
      setSubmitting(false);
      setToast(null);
    }
  }, [isOpen]);

  const scored: ScoreRow[] = useMemo(() => {
    if (!request) return [];
    const rows = volunteers.map((v) => {
      const score = matchScoreVolunteer(v, request);
      let distanceKm = 0;
      try {
        distanceKm = haversineKm(v.location, request.location);
      } catch {
        distanceKm = -1;
      }
      return {
        volunteer: v,
        overall: score.overall,
        skill: score.skill,
        availability: score.availability,
        distance: score.distance,
        workload: score.workload,
        suggested: false,
        distanceKm: Math.round(distanceKm * 10) / 10,
      };
    });
    rows.sort((a, b) => b.overall - a.overall);
    if (rows.length > 0) rows[0].suggested = true;
    if (rows.length > 1 && rows[1].overall >= rows[0].overall * 0.9) rows[1].suggested = true;
    return rows;
  }, [volunteers, request]);

  const handleConfirm = () => {
    if (!request || !selectedId || !currentUser) return;
    setSubmitting(true);
    setError('');
    const ctx = { actorId: currentUser.id, actorName: currentUser.name, role: currentUser.role };
    const result = assign(request.id, selectedId, ctx);
    setSubmitting(false);
    if (result.ok) {
      const vol = volunteers.find((v) => v.id === selectedId);
      setToast({ type: 'success', msg: `${vol?.name || 'Volunteer'} assigned to ${request.id}` });
      setSelectedId(null);
      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1200);
    } else {
      setError(result.error || 'Assignment failed');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Volunteer',
      stickyFirst: true,
      render: (row: ScoreRow) => (
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {row.volunteer.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
            {row.suggested && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-400 to-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded text-white uppercase shadow-sm">
                Best
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">
              {row.volunteer.name}
              {row.suggested && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  <Award className="w-2.5 h-2.5" /> Suggested responder
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {row.volunteer.location.address.split(',')[0]}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{row.volunteer.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'skills',
      label: 'Skills',
      render: (row: ScoreRow) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.volunteer.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              {s}
            </span>
          ))}
          {row.volunteer.skills.length > 3 && (
            <span className="text-[10px] text-slate-500">+{row.volunteer.skills.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'availability',
      label: 'Availability',
      render: (row: ScoreRow) => <AvailabilityBadge availability={row.volunteer.availability} />,
    },
    {
      key: 'distance',
      label: 'Distance',
      render: (row: ScoreRow) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-900">
            {row.distanceKm >= 0 ? `${row.distanceKm} km` : '—'}
          </div>
          <div className="text-slate-500">
            {row.distanceKm <= 5 ? 'Nearby' : row.distanceKm <= 15 ? 'Mid-range' : 'Far'}
          </div>
        </div>
      ),
    },
    {
      key: 'workload',
      label: 'Workload',
      render: (row: ScoreRow) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-900">
            {row.volunteer.currentAssignmentIds.length} active
          </div>
          <div className="text-slate-500">{row.volunteer.completedMissions} done</div>
        </div>
      ),
    },
    {
      key: 'match',
      label: 'Match Breakdown',
      render: (row: ScoreRow) => {
        const skillPct = Math.round(row.skill * 100);
        const availPct = Math.round(row.availability * 100);
        const distPct = Math.round(row.distance * 100);
        const wlPct = Math.round(row.workload * 100);
        const overallPct = Math.round(row.overall * 100);
        const barColor =
          overallPct >= 75 ? 'bg-emerald-500'
          : overallPct >= 50 ? 'bg-blue-500'
          : overallPct >= 25 ? 'bg-amber-500'
          : 'bg-slate-400';
        return (
          <div className="w-[180px]">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
              <span className="text-slate-700">Overall {overallPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${overallPct}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-1 text-[9.5px] text-slate-500 font-mono">
              <span className="text-slate-700">S{skillPct}</span>
              <span className="text-slate-700">A{availPct}</span>
              <span className="text-slate-700">D{distPct}</span>
              <span className="text-slate-700">W{wlPct}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[9px] text-slate-400 uppercase tracking-tight">
              <span>Skill</span>
              <span>Avail</span>
              <span>Dist</span>
              <span>WL</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'select',
      label: 'Select',
      className: 'w-16 text-right',
      render: (row: ScoreRow) => (
        <div className="text-right">
          <div className={`w-5 h-5 rounded-full border-2 mx-auto flex items-center justify-center transition-colors ${
            selectedId === row.volunteer.id
              ? 'border-blue-600 bg-blue-600'
              : 'border-slate-300 bg-white'
          }`}>
            {selectedId === row.volunteer.id && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>
      ),
    },
  ];

  const rows = scored;
  const selected = scored.find((r) => r.volunteer.id === selectedId);

  const footer = (
    <>
      <div className="flex-1 min-h-0 mr-2">
        {error && (
          <div className="text-xs text-red-700 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        disabled={submitting || !!toast}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedId || submitting || !!toast}
        className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-1.5"
      >
        <Users className="w-4 h-4" />
        {selected ? `Assign ${selected.volunteer.name.split(' ')[0]}` : 'Confirm Assignment'}
      </button>
    </>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <div>Assign Volunteer to Request</div>
            <div className="text-xs font-normal text-slate-500 mt-0.5">
              {request ? `${request.id} — ${request.emergencyType} • ${request.severity}` : 'No request selected'}
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="space-y-4 relative">
        {toast && (
          <div className={`fixed top-6 right-6 z-[70] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}
        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="text-slate-600 leading-relaxed">
            <div className="font-semibold text-slate-700 mb-0.5">How matching works</div>
            Candidates are ranked by <b>Skill</b> (40%) — skills relevant to emergency/resources, <b>Availability</b> (30%) — Available=1, Busy=0.1, Offline=0, <b>Distance</b> (20%) — 1.0 within 5km, 0 at 30km, <b>Workload</b> (10%) — fewer missions preferred.
          </div>
        </div>
        {!request ? (
          <div className="py-10 text-center text-sm text-slate-500">Request not found.</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">No volunteers available.</div>
        ) : (
          <DataTable
            columns={columns as any}
            rows={rows}
            rowKey={(r: ScoreRow) => r.volunteer.id}
            onRowClick={(r: ScoreRow) => setSelectedId(r.volunteer.id)}
            selectedRowKey={selectedId}
            selectedClass="bg-blue-50 ring-1 ring-inset ring-blue-200"
            className="max-h-[420px] border border-slate-200 rounded-lg"
          />
        )}
      </div>
    </Modal>
  );
};

export default AssignVolunteerModal;
