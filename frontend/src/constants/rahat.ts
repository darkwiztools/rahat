import type {
  EmergencyType,
  ResourceCategory,
  VolunteerSkill,
  IncidentType,
  IncidentStatus,
  RequestStatus,
  Severity,
  ContactMethod,
  VolunteerAvailability,
} from '../types/rahat';

export const EMERGENCY_TYPES: EmergencyType[] = [
  'Flood',
  'Fire',
  'Storm',
  'Medical Emergency',
  'Accident',
  'Building Damage',
  'Food Shortage',
  'Water Shortage',
  'Shelter Needed',
  'Transportation Needed',
  'Missing Person',
  'Rescue Required',
  'Emergency SOS',
  'Other',
];

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Food',
  'Drinking Water',
  'Medicine',
  'First Aid',
  'Shelter',
  'Transportation',
  'Clothing',
  'Baby Supplies',
  'Sanitary Supplies',
  'Rescue Equipment',
  'Other',
];

export const VOLUNTEER_SKILLS: VolunteerSkill[] = [
  'First Aid',
  'Medical',
  'Rescue',
  'Driving',
  'Food Distribution',
  'Water Distribution',
  'Search & Rescue',
  'Logistics',
  'Shelter Management',
  'Communication',
  'Technical Support',
];

export const INCIDENT_TYPES: IncidentType[] = [
  'Flood',
  'Fire',
  'Storm',
  'Cyclone',
  'Earthquake',
  'Landslide',
  'Heatwave',
  'Industrial Accident',
  'Other',
];

export const INCIDENT_STATUSES: IncidentStatus[] = [
  'Monitoring',
  'Active',
  'Contained',
  'Closed',
];

export const REQUEST_STATUSES: RequestStatus[] = [
  'NEW',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'REACHED',
  'DELIVERED',
  'RESOLVED',
  'CANCELLED',
];

export const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const CONTACT_METHODS: ContactMethod[] = [
  'Phone',
  'SMS',
  'WhatsApp',
  'Email',
];

export const AVAILABILITY_OPTIONS: VolunteerAvailability[] = [
  'AVAILABLE',
  'BUSY',
  'OFFLINE',
];

export const SEVERITY_LABELS: Record<Severity, { label: string; desc: string }> = {
  CRITICAL: {
    label: 'Critical',
    desc: 'Immediate threat to life. Requires urgent response within minutes.',
  },
  HIGH: {
    label: 'High',
    desc: 'Serious situation with potential harm. Response needed within 1-2 hours.',
  },
  MEDIUM: {
    label: 'Medium',
    desc: 'Moderate impact. Coordinated response within 4-6 hours.',
  },
  LOW: {
    label: 'Low',
    desc: 'Minor impact. Scheduled response within 24 hours.',
  },
};

export const STATUS_TRANSITION_GRAPH: Record<RequestStatus, RequestStatus[]> = {
  NEW: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['ASSIGNED', 'CANCELLED', 'NEW'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED', 'UNDER_REVIEW'],
  IN_PROGRESS: ['REACHED', 'CANCELLED'],
  REACHED: ['DELIVERED', 'IN_PROGRESS'],
  DELIVERED: ['RESOLVED', 'IN_PROGRESS'],
  RESOLVED: [],
  CANCELLED: [],
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

