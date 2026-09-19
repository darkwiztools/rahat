import L from 'leaflet';
import type { Severity, VolunteerAvailability } from '../../types/rahat';

export const MARKER_COLORS = {
  CRITICAL_REQ: '#dc2626',
  HIGH_REQ: '#f59e0b',
  MEDIUM_REQ: '#2563eb',
  LOW_REQ: '#d1d5db',
  VOLUNTEER_AVAILABLE: '#16a34a',
  VOLUNTEER_BUSY: '#6b7280',
  SHELTER: '#7c3aed',
  RELIEF_CENTER: '#0d9488',
} as const;

export function colorForSeverity(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return MARKER_COLORS.CRITICAL_REQ;
    case 'HIGH':
      return MARKER_COLORS.HIGH_REQ;
    case 'MEDIUM':
      return MARKER_COLORS.MEDIUM_REQ;
    case 'LOW':
      return MARKER_COLORS.LOW_REQ;
    default:
      return MARKER_COLORS.LOW_REQ;
  }
}

export function colorForVolunteer(availability: VolunteerAvailability): string {
  switch (availability) {
    case 'AVAILABLE':
      return MARKER_COLORS.VOLUNTEER_AVAILABLE;
    case 'BUSY':
      return MARKER_COLORS.VOLUNTEER_BUSY;
    case 'OFFLINE':
      return MARKER_COLORS.LOW_REQ;
    default:
      return MARKER_COLORS.LOW_REQ;
  }
}

export function customDivIcon(color: string, size: number = 24): L.DivIcon {
  const half = size / 2;
  const ring = size + 8;
  const halfRing = ring / 2;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:${ring}px;height:${ring}px;">
        <div style="position:absolute;left:0;top:0;width:${ring}px;height:${ring}px;border-radius:50%;background:${color};opacity:0.2;"></div>
        <div style="position:absolute;left:${(ring - size) / 2}px;top:${(ring - size) / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 0 2px rgba(255,255,255,1),0 2px 4px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [ring, ring],
    iconAnchor: [halfRing, halfRing],
    popupAnchor: [0, -halfRing],
  });
}

export const pinIcon = (color: string): L.DivIcon => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.25);transform:translate(-18px, -36px);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};
