import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Info,
} from 'lucide-react';
import RahatMap from '../../components/map/RahatMap';
import { useRahatStore } from '../../store/useRahatStore';
import type { EmergencyRequest, RequestStatus } from '../../types/rahat';
import { MARKER_COLORS } from '../../components/map/layerStyles';

const WEST_CHAMBARAN_CENTER: [number, number] = [26.98, 84.5];
const DEFAULT_ZOOM = 11;
const TERMINAL_STATUSES: RequestStatus[] = ['RESOLVED', 'CANCELLED', 'DELIVERED'];

function isTerminalStatus(s: RequestStatus): boolean {
  return TERMINAL_STATUSES.includes(s);
}

function LegendDot({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full mr-2 border border-white shadow-sm flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: '0 0 0 1px rgba(15,23,42,0.1)',
      }}
    />
  );
}

const LiveMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { requests, volunteers, shelters, reliefCenters, incidents } = useRahatStore();
  const refreshFromStorage = useRahatStore((s) => s.refreshFromStorage);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('all');
  const [center, setCenter] = useState<[number, number] | undefined>(undefined);
  const [zoom, setZoom] = useState<number | undefined>(undefined);
  const [resetKey, setResetKey] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => { void refreshFromStorage(); }, 3000);
    return () => window.clearInterval(interval);
  }, [refreshFromStorage]);

  const activeRequestsCount = useMemo(
    () => requests.filter((r) => !isTerminalStatus(r.status)).length,
    [requests]
  );

  const handleRequestClick = (req: EmergencyRequest) => {
    setSelectedRequest(req);
  };

  const handleViewRequest = () => {
    if (selectedRequest) {
      navigate(`/admin/requests/${selectedRequest.id}`);
    }
  };

  const handleFitActiveRequests = () => {
    const coords = requests
      .filter((r) => !isTerminalStatus(r.status))
      .map((r) => r.location)
      .filter((l) => typeof l?.lat === 'number' && typeof l?.lng === 'number');

    if (coords.length === 0) {
      setCenter(WEST_CHAMBARAN_CENTER);
      setZoom(DEFAULT_ZOOM);
      setResetKey((n) => n + 1);
      return;
    }

    if (coords.length === 1) {
      setCenter([coords[0].lat, coords[0].lng]);
      setZoom(14);
      setResetKey((n) => n + 1);
      return;
    }

    const lats = coords.map((c) => c.lat);
    const lngs = coords.map((c) => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const avgLat = (minLat + maxLat) / 2;
    const avgLng = (minLng + maxLng) / 2;
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);
    const newZoom = maxSpan > 0.2 ? 11 : maxSpan > 0.08 ? 12 : maxSpan > 0.02 ? 13 : 14;
    setCenter([avgLat, avgLng]);
    setZoom(newZoom);
    setResetKey((n) => n + 1);
  };

  const handleResetView = () => {
    setCenter(WEST_CHAMBARAN_CENTER);
    setZoom(DEFAULT_ZOOM);
    setResetKey((n) => n + 1);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min((z ?? DEFAULT_ZOOM) + 1, 18));
    setResetKey((n) => n + 1);
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max((z ?? DEFAULT_ZOOM) - 1, 6));
    setResetKey((n) => n + 1);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-slate-900 whitespace-nowrap">
            Live Operations Map
          </h1>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Incident:
            </label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Incidents</option>
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.name} ({inc.status})
                </option>
              ))}
            </select>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <span className="font-semibold text-slate-700">{activeRequestsCount}</span> active
              requests &middot; Fit bounds to see all on map
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <div className="absolute top-3 left-3 z-[500] flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 px-2 py-1.5">
          <button
            type="button"
            onClick={handleFitActiveRequests}
            title="Fit Active Requests"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fit Active Requests</span>
          </button>
          <button
            type="button"
            onClick={handleResetView}
            title="Reset View"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset View</span>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

          <RahatMap
          key={resetKey}
          requests={requests}
          volunteers={volunteers}
          shelters={shelters}
          reliefCenters={reliefCenters}
          showRequests={true}
          showVolunteers={true}
          showShelters={true}
          showReliefCenters={true}
          onRequestClick={handleRequestClick}
          center={center}
          zoom={zoom}
          height="100%"
        />
      </div>

      {selectedRequest && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[600] w-full max-w-md px-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{selectedRequest.id}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        selectedRequest.severity === 'CRITICAL'
                          ? '#fef2f2'
                          : selectedRequest.severity === 'HIGH'
                          ? '#fffbeb'
                          : selectedRequest.severity === 'MEDIUM'
                          ? '#eff6ff'
                          : '#f1f5f9',
                      color:
                        selectedRequest.severity === 'CRITICAL'
                          ? MARKER_COLORS.CRITICAL_REQ
                          : selectedRequest.severity === 'HIGH'
                          ? MARKER_COLORS.HIGH_REQ
                          : selectedRequest.severity === 'MEDIUM'
                          ? MARKER_COLORS.MEDIUM_REQ
                          : MARKER_COLORS.LOW_REQ,
                    }}
                  >
                    {selectedRequest.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div>
                    <span className="text-slate-400">Emergency: </span>
                    <span className="font-medium text-slate-800">
                      {selectedRequest.emergencyType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <span className="font-medium text-slate-800">{selectedRequest.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">People: </span>
                    <span className="font-medium text-slate-800">
                      {selectedRequest.peopleAffected} affected
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleViewRequest}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md py-2 transition-colors"
            >
              View Request Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMapPage;
