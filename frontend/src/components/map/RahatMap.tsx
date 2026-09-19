import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { Maximize2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import type {
  EmergencyRequest,
  Volunteer,
  Shelter,
  ReliefCenter,
  RequestStatus,
} from '../../types/rahat';
import {
  MARKER_COLORS,
  colorForSeverity,
  colorForVolunteer,
  customDivIcon,
} from './layerStyles';

const WEST_CHAMBARAN_CENTER = { lat: 26.98, lng: 84.5 };

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

interface FitControllerProps {
  requests: EmergencyRequest[];
  fitSignal: number;
}

function FitController({ requests, fitSignal }: FitControllerProps) {
  const map = useMap();
  useEffect(() => {
    if (fitSignal === 0) return;
    const coords = requests
      .filter((r) => !isTerminalStatus(r.status))
      .map((r) => r.location)
      .filter((l) => typeof l?.lat === 'number' && typeof l?.lng === 'number');
    if (coords.length === 0) {
      map.setView([WEST_CHAMBARAN_CENTER.lat, WEST_CHAMBARAN_CENTER.lng], 11);
      return;
    }
    if (coords.length === 1) {
      map.setView([coords[0].lat, coords[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(
      coords.map((c) => [c.lat, c.lng] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [fitSignal, requests, map]);
  return null;
}

interface CenterControllerProps {
  center?: [number, number];
  zoom?: number;
}

function CenterController({ center, zoom }: CenterControllerProps) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      map.setView(center, zoom ?? map.getZoom(), { animate: true });
    }
  }, [center?.[0], center?.[1], zoom, map]);
  return null;
}

export interface RahatMapProps {
  requests?: EmergencyRequest[];
  volunteers?: Volunteer[];
  shelters?: Shelter[];
  reliefCenters?: ReliefCenter[];
  showRequests?: boolean;
  showVolunteers?: boolean;
  showShelters?: boolean;
  showReliefCenters?: boolean;
  onRequestClick?: (req: EmergencyRequest) => void;
  center?: [number, number];
  zoom?: number;
  height?: string | number;
}

const RahatMap: React.FC<RahatMapProps> = ({
  requests = [],
  volunteers = [],
  shelters = [],
  reliefCenters = [],
  showRequests: initShowRequests = true,
  showVolunteers: initShowVolunteers = true,
  showShelters: initShowShelters = true,
  showReliefCenters: initShowReliefCenters = true,
  onRequestClick,
  center,
  zoom,
  height = '100%',
}) => {
  const [showRequests, setShowRequests] = useState(initShowRequests);
  const [showVolunteers, setShowVolunteers] = useState(initShowVolunteers);
  const [showShelters, setShowShelters] = useState(initShowShelters);
  const [showReliefCenters, setShowReliefCenters] = useState(initShowReliefCenters);
  const [fitSignal, setFitSignal] = useState(0);

  const requestMarkers = useMemo(() => {
    if (!showRequests) return [];
    return requests
      .filter((r) => r.location && typeof r.location.lat === 'number')
      .map((r) => ({
        key: `req-${r.id}`,
        position: [r.location.lat, r.location.lng] as L.LatLngTuple,
        icon: customDivIcon(colorForSeverity(r.severity), 22),
        request: r,
      }));
  }, [requests, showRequests]);

  const volunteerMarkers = useMemo(() => {
    if (!showVolunteers) return [];
    return volunteers
      .filter((v) => v.location && typeof v.location.lat === 'number')
      .map((v) => ({
        key: `vol-${v.id}`,
        position: [v.location.lat, v.location.lng] as L.LatLngTuple,
        icon: customDivIcon(colorForVolunteer(v.availability), 20),
        volunteer: v,
      }));
  }, [volunteers, showVolunteers]);

  const shelterMarkers = useMemo(() => {
    if (!showShelters) return [];
    return shelters
      .filter((s) => s.location && typeof s.location.lat === 'number')
      .map((s) => ({
        key: `sh-${s.id}`,
        position: [s.location.lat, s.location.lng] as L.LatLngTuple,
        icon: customDivIcon(MARKER_COLORS.SHELTER, 22),
        shelter: s,
      }));
  }, [shelters, showShelters]);

  const rcMarkers = useMemo(() => {
    if (!showReliefCenters) return [];
    return reliefCenters
      .filter((r) => r.location && typeof r.location.lat === 'number')
      .map((r) => ({
        key: `rc-${r.id}`,
        position: [r.location.lat, r.location.lng] as L.LatLngTuple,
        icon: customDivIcon(MARKER_COLORS.RELIEF_CENTER, 22),
        reliefCenter: r,
      }));
  }, [reliefCenters, showReliefCenters]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
      <MapContainer
        center={[WEST_CHAMBARAN_CENTER.lat, WEST_CHAMBARAN_CENTER.lng]}
        zoom={zoom ?? 11}
        scrollWheelZoom
        style={{ height, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CenterController center={center} zoom={zoom} />
        <FitController requests={requests} fitSignal={fitSignal} />

        {requestMarkers.map((m) => (
          <Marker key={m.key} position={m.position} icon={m.icon}>
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">{m.request.id}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        m.request.severity === 'CRITICAL'
                          ? '#fef2f2'
                          : m.request.severity === 'HIGH'
                          ? '#fffbeb'
                          : m.request.severity === 'MEDIUM'
                          ? '#eff6ff'
                          : '#f1f5f9',
                      color: colorForSeverity(m.request.severity),
                    }}
                  >
                    {m.request.severity}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div>
                    <span className="text-slate-400">Emergency: </span>
                    <span className="font-medium text-slate-800">
                      {m.request.emergencyType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">People: </span>
                    <span className="font-medium text-slate-800">
                      {m.request.peopleAffected} affected
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <span className="font-medium text-slate-800">{m.request.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-[220px]">
                    {m.request.location.address}
                  </div>
                </div>
                {onRequestClick && (
                  <button
                    onClick={() => onRequestClick(m.request)}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md py-1.5 transition-colors"
                  >
                    View Request
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {volunteerMarkers.map((m) => (
          <Marker key={m.key} position={m.position} icon={m.icon}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <div className="font-bold text-slate-900 mb-1">{m.volunteer.name}</div>
                <div className="space-y-1 text-slate-600">
                  <div>
                    <span className="text-slate-400">Availability: </span>
                    <span
                      className="font-medium"
                      style={{ color: colorForVolunteer(m.volunteer.availability) }}
                    >
                      {m.volunteer.availability}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Skills: </span>
                    <span className="text-xs text-slate-700">
                      {m.volunteer.skills.slice(0, 3).join(', ')}
                      {m.volunteer.skills.length > 3 ? ', …' : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Missions: </span>
                    <span className="font-medium text-slate-800">
                      {m.volunteer.completedMissions} completed
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {shelterMarkers.map((m) => (
          <Marker key={m.key} position={m.position} icon={m.icon}>
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-bold text-slate-900 mb-1">{m.shelter.name}</div>
                <div className="space-y-1 text-slate-600">
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <span className="font-medium text-slate-800">{m.shelter.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Capacity: </span>
                    <span className="font-medium text-slate-800">
                      {m.shelter.occupied}/{m.shelter.capacity}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs mt-1">
                    {m.shelter.foodAvailable && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Food</span>
                    )}
                    {m.shelter.waterAvailable && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">Water</span>
                    )}
                    {m.shelter.medicalAvailable && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">Medical</span>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {rcMarkers.map((m) => (
          <Marker key={m.key} position={m.position} icon={m.icon}>
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-bold text-slate-900 mb-1">{m.reliefCenter.name}</div>
                <div className="space-y-1 text-slate-600">
                  <div>
                    <span className="text-slate-400">Type: </span>
                    <span className="font-medium text-slate-800">{m.reliefCenter.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Contact: </span>
                    <span className="text-slate-800">{m.reliefCenter.contact}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Resources: </span>
                    <span className="text-xs text-slate-700">
                      {m.reliefCenter.resources.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setFitSignal((n) => n + 1)}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 self-end"
        >
          <Maximize2 className="w-4 h-4 text-blue-600" />
          Fit Active Requests
        </button>

        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-3 space-y-2 text-sm w-[190px]">
          <div className="font-semibold text-slate-800 mb-1">Layers</div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRequests}
              onChange={(e) => setShowRequests(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <span className="text-slate-700 flex items-center">
              {showRequests ? (
                <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
              )}
              Requests
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showVolunteers}
              onChange={(e) => setShowVolunteers(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <span className="text-slate-700 flex items-center">
              {showVolunteers ? (
                <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
              )}
              Volunteers
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <span className="text-slate-700 flex items-center">
              {showShelters ? (
                <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
              )}
              Shelters
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showReliefCenters}
              onChange={(e) => setShowReliefCenters(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <span className="text-slate-700 flex items-center">
              {showReliefCenters ? (
                <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
              )}
              Relief Centers
            </span>
          </label>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-[500] bg-white rounded-lg shadow-md border border-slate-200 p-3 text-xs space-y-1.5 w-[210px]">
        <div className="font-semibold text-slate-800 mb-1.5 text-sm">Legend</div>
        <div className="flex items-center text-slate-700">
          <LegendDot color={MARKER_COLORS.CRITICAL_REQ} /> Critical Request
        </div>
        <div className="flex items-center text-slate-700">
          <LegendDot color={MARKER_COLORS.HIGH_REQ} /> High Request
        </div>
        <div className="flex items-center text-slate-700">
          <LegendDot color={MARKER_COLORS.MEDIUM_REQ} /> Medium Request
        </div>
        <div className="flex items-center text-slate-700">
          <LegendDot color={MARKER_COLORS.LOW_REQ} /> Low Request
        </div>
        <div className="h-px bg-slate-100 my-1.5" />
        <div className="flex items-center text-slate-700">
          <LegendDot color={MARKER_COLORS.VOLUNTEER_AVAILABLE} /> Volunteer (Available)
        </div>
        <div className="flex items-center text-slate-700">
          <LegendDot color={MARKER_COLORS.VOLUNTEER_BUSY} /> Volunteer (Busy)
        </div>
        <div className="h-px bg-slate-100 my-1.5" />
        <div className="flex items-center text-slate-700">
          <LegendDot color={MARKER_COLORS.SHELTER} /> Shelter
        </div>
        <div className="flex items-center text-slate-700">
          <LegendDot color={MARKER_COLORS.RELIEF_CENTER} /> Relief Center
        </div>
      </div>
    </div>
  );
};

export default RahatMap;
