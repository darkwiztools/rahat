export type Role = 'citizen' | 'volunteer' | 'coordinator';

export type RequestStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'REACHED'
  | 'DELIVERED'
  | 'RESOLVED'
  | 'CANCELLED';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type VolunteerAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type VolunteerSkill =
  | 'First Aid'
  | 'Medical'
  | 'Rescue'
  | 'Driving'
  | 'Food Distribution'
  | 'Water Distribution'
  | 'Search & Rescue'
  | 'Logistics'
  | 'Shelter Management'
  | 'Communication'
  | 'Technical Support';

export type ResourceCategory =
  | 'Food'
  | 'Drinking Water'
  | 'Medicine'
  | 'First Aid'
  | 'Shelter'
  | 'Transportation'
  | 'Clothing'
  | 'Baby Supplies'
  | 'Sanitary Supplies'
  | 'Rescue Equipment'
  | 'Other';

export type InventoryStatus = 'Available' | 'Low' | 'Out of Stock';

export type EmergencyType =
  | 'Flood'
  | 'Fire'
  | 'Storm'
  | 'Medical Emergency'
  | 'Accident'
  | 'Building Damage'
  | 'Food Shortage'
  | 'Water Shortage'
  | 'Shelter Needed'
  | 'Transportation Needed'
  | 'Missing Person'
  | 'Rescue Required'
  | 'Emergency SOS'
  | 'Other';

export type ContactMethod = 'Phone' | 'SMS' | 'WhatsApp' | 'Email';

export type IncidentType =
  | 'Flood'
  | 'Fire'
  | 'Storm'
  | 'Cyclone'
  | 'Earthquake'
  | 'Landslide'
  | 'Heatwave'
  | 'Industrial Accident'
  | 'Other';

export type IncidentStatus = 'Monitoring' | 'Active' | 'Contained' | 'Closed';

export interface GeoCoords {
  lat: number;
  lng: number;
  address: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  avatar?: string;
  createdAt: string;
  password?: string;
}

export interface TimelineEntry {
  status: RequestStatus;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface Allocation {
  id: string;
  requestId: string;
  resourceId: string;
  quantity: number;
  allocatedBy: string;
  allocatedAt: string;
}

export interface EmergencyRequest {
  id: string;
  citizenEmail: string;
  citizenName: string;
  citizenPhone: string;
  peopleAffected: number;
  emergencyType: EmergencyType;
  requiredResources: ResourceCategory[];
  severity: Severity;
  description: string;
  location: GeoCoords;
  accessibilityRequirements?: string;
  preferredContact?: ContactMethod;
  status: RequestStatus;
  assignedVolunteerId?: string;
  allocatedResources: Allocation[];
  timeline: TimelineEntry[];
  coordinatorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Volunteer {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  skills: VolunteerSkill[];
  availability: VolunteerAvailability;
  location: GeoCoords;
  vehicle?: 'None' | 'Motorcycle' | 'Car' | 'Truck' | 'Boat';
  currentAssignmentIds: string[];
  completedMissions: number;
  experienceMonths?: number;
}

export interface ResourceInventory {
  id: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  unit: string;
  storageLocation: string;
  lowThreshold: number;
  lastUpdated: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  location: GeoCoords;
  capacity: number;
  occupied: number;
  foodAvailable: boolean;
  waterAvailable: boolean;
  medicalAvailable: boolean;
  status: 'Open' | 'Near Capacity' | 'Full' | 'Closed';
  notes?: string;
}

export interface ReliefCenter {
  id: string;
  name: string;
  address: string;
  location: GeoCoords;
  type: string;
  contact: string;
  resources: string[];
  status: 'Active' | 'Inactive';
}

export interface IncidentNote {
  id: string;
  actor: string;
  text: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  name: string;
  type: IncidentType;
  affectedArea: string;
  severity: Severity;
  startTime: string;
  description: string;
  status: IncidentStatus;
  operationalNotes: IncidentNote[];
}

export interface Notification {
  id: string;
  targetRole?: Role;
  targetUserId?: string;
  type: string;
  title: string;
  message: string;
  relatedRequestId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeSnapshot?: any;
  afterSnapshot?: any;
  note?: string;
  timestamp: string;
}
