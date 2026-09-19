import type {
  EmergencyRequest,
  Volunteer,
  ResourceInventory,
  Shelter,
  ReliefCenter,
  Incident,
  UserProfile,
  Allocation,
} from '../types/rahat';
import { generateRequestId, generateIncidentId, generateUUID } from '../utils/ids';
import { randomNearby, WEST_CHAMBARAN_CENTER } from '../utils/geo';

export interface SeedData {
  users: UserProfile[];
  requests: EmergencyRequest[];
  volunteers: Volunteer[];
  resources: ResourceInventory[];
  allocations: Allocation[];
  shelters: Shelter[];
  reliefCenters: ReliefCenter[];
  incidents: Incident[];
  requestCounter: number;
  incidentCounter: number;
}

export function createSeedData(): SeedData {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);

  const users: UserProfile[] = [
    {
      id: 'u-admin',
      email: 'admin@rahat.demo',
      name: 'Priya Sharma',
      role: 'coordinator',
      phone: '+91-98765-43210',
      createdAt: iso(hoursAgo(720)),
    },
    {
      id: 'u-vol-1',
      email: 'volunteer@rahat.demo',
      name: 'Amit Kumar',
      role: 'volunteer',
      phone: '+91-90123-45678',
      createdAt: iso(hoursAgo(600)),
    },
    {
      id: 'u-cit-1',
      email: 'citizen@rahat.demo',
      name: 'Rajesh Singh',
      role: 'citizen',
      phone: '+91-91111-22222',
      createdAt: iso(hoursAgo(500)),
    },
  ];

  const volunteers: Volunteer[] = [
    {
      id: 'v-amit',
      name: 'Amit Kumar',
      phone: '+91-90123-45678',
      skills: ['First Aid', 'Driving', 'Logistics'],
      availability: 'AVAILABLE',
      location: randomNearby(3),
      vehicle: 'Car',
      currentAssignmentIds: [],
      completedMissions: 12,
      experienceMonths: 8,
    },
    {
      id: 'v-sunita',
      name: 'Sunita Devi',
      phone: '+91-99887-66554',
      skills: ['Medical', 'First Aid', 'Shelter Management'],
      availability: 'AVAILABLE',
      location: randomNearby(6),
      vehicle: 'Motorcycle',
      currentAssignmentIds: [],
      completedMissions: 28,
      experienceMonths: 18,
    },
    {
      id: 'v-rahul',
      name: 'Rahul Verma',
      phone: '+91-98111-22333',
      skills: ['Rescue', 'Search & Rescue', 'Driving'],
      availability: 'BUSY',
      location: randomNearby(10),
      vehicle: 'Truck',
      currentAssignmentIds: ['RQ-2024-00002'],
      completedMissions: 19,
      experienceMonths: 14,
    },
    {
      id: 'v-priya',
      name: 'Priya Nair',
      phone: '+91-97777-88899',
      skills: ['Water Distribution', 'Food Distribution', 'Communication'],
      availability: 'AVAILABLE',
      location: randomNearby(4),
      vehicle: 'None',
      currentAssignmentIds: [],
      completedMissions: 7,
      experienceMonths: 3,
    },
    {
      id: 'v-raj',
      name: 'Rajesh Patel',
      phone: '+91-96000-11223',
      skills: ['Logistics', 'Driving', 'Shelter Management'],
      availability: 'OFFLINE',
      location: randomNearby(15),
      vehicle: 'Car',
      currentAssignmentIds: [],
      completedMissions: 41,
      experienceMonths: 36,
    },
  ];

  const resources: ResourceInventory[] = [
    {
      id: 'res-water',
      name: 'Drinking Water Bottles (1L)',
      category: 'Drinking Water',
      quantity: 320,
      unit: 'bottle',
      storageLocation: 'Central Warehouse - A1',
      lowThreshold: 100,
      lastUpdated: iso(hoursAgo(2)),
    },
    {
      id: 'res-food-rations',
      name: 'Dry Food Rations (Family Pack)',
      category: 'Food',
      quantity: 85,
      unit: 'pack',
      storageLocation: 'Central Warehouse - B2',
      lowThreshold: 30,
      lastUpdated: iso(hoursAgo(5)),
    },
    {
      id: 'res-firstaid',
      name: 'First Aid Kits',
      category: 'First Aid',
      quantity: 42,
      unit: 'kit',
      storageLocation: 'Medical Depot',
      lowThreshold: 20,
      lastUpdated: iso(hoursAgo(8)),
    },
    {
      id: 'res-meds',
      name: 'Emergency Medicines (Assorted)',
      category: 'Medicine',
      quantity: 18,
      unit: 'kit',
      storageLocation: 'Medical Depot - Locked',
      lowThreshold: 25,
      lastUpdated: iso(hoursAgo(1)),
    },
    {
      id: 'res-blankets',
      name: 'Blankets',
      category: 'Shelter',
      quantity: 0,
      unit: 'unit',
      storageLocation: 'Central Warehouse - C3',
      lowThreshold: 50,
      lastUpdated: iso(hoursAgo(24)),
    },
    {
      id: 'res-tarps',
      name: 'Tarpaulin Sheets',
      category: 'Shelter',
      quantity: 64,
      unit: 'sheet',
      storageLocation: 'Central Warehouse - C4',
      lowThreshold: 20,
      lastUpdated: iso(hoursAgo(12)),
    },
  ];

  let requestCounter = 0;
  function mkRequest(
    data: Partial<EmergencyRequest> & {
      citizenName: string;
      citizenPhone: string;
      emergencyType: EmergencyRequest['emergencyType'];
      severity: EmergencyRequest['severity'];
      description: string;
      location: EmergencyRequest['location'];
    }
  ): EmergencyRequest {
    requestCounter += 1;
    const id = generateRequestId(2024, requestCounter);
    const ts = iso(hoursAgo(Math.floor(Math.random() * 48)));
    return {
      id,
      citizenEmail: 'citizen@rahat.demo',
      citizenName: data.citizenName,
      citizenPhone: data.citizenPhone,
      peopleAffected: data.peopleAffected ?? 1,
      emergencyType: data.emergencyType,
      requiredResources: data.requiredResources ?? [],
      severity: data.severity,
      description: data.description,
      location: data.location,
      accessibilityRequirements: data.accessibilityRequirements,
      preferredContact: data.preferredContact ?? 'Phone',
      status: data.status ?? 'NEW',
      assignedVolunteerId: data.assignedVolunteerId,
      allocatedResources: data.allocatedResources ?? [],
      timeline: [
        {
          status: data.status ?? 'NEW',
          timestamp: ts,
          note: 'Request received by RAHAT platform',
          actor: 'System',
        },
      ],
      coordinatorNotes: data.coordinatorNotes ?? '',
      createdAt: ts,
      updatedAt: ts,
    };
  }

  const requests: EmergencyRequest[] = [
    mkRequest({
      citizenName: 'Rajesh Singh',
      citizenPhone: '+91-91111-22222',
      peopleAffected: 4,
      emergencyType: 'Flood',
      requiredResources: ['Drinking Water', 'Food', 'Shelter'],
      severity: 'CRITICAL',
      description: 'Ground floor submerged. Family on roof. Needs immediate rescue and supplies.',
      location: { lat: 26.991, lng: 84.502, address: 'Narkatiyaganj, Ward 3, Opp. Bus Stand' },
      status: 'UNDER_REVIEW',
    }),
    mkRequest({
      citizenName: 'Meera Devi',
      citizenPhone: '+91-92000-33112',
      peopleAffected: 2,
      emergencyType: 'Medical Emergency',
      requiredResources: ['Medicine', 'First Aid', 'Transportation'],
      severity: 'HIGH',
      description: 'Elderly mother with high fever and breathing difficulty. No private transport.',
      location: { lat: 26.955, lng: 84.541, address: 'Bettiah, Gandhi Chowk, House #42' },
      status: 'ASSIGNED',
      assignedVolunteerId: 'v-rahul',
    }),
    mkRequest({
      citizenName: 'Suresh Yadav',
      citizenPhone: '+91-93444-55667',
      peopleAffected: 6,
      emergencyType: 'Food Shortage',
      requiredResources: ['Food', 'Drinking Water'],
      severity: 'MEDIUM',
      description: 'Family of 6. No rations for 2 days. Shopkeepers closed due to flooding.',
      location: { lat: 26.92, lng: 84.47, address: 'Ramnagar Block, Village - Bhitiharwa' },
      status: 'NEW',
    }),
    mkRequest({
      citizenName: 'Anita Mahato',
      citizenPhone: '+91-94555-88990',
      peopleAffected: 3,
      emergencyType: 'Shelter Needed',
      requiredResources: ['Shelter', 'Clothing', 'Baby Supplies'],
      severity: 'HIGH',
      description: 'House collapsed. 3-month-old baby in family. Needs temporary shelter immediately.',
      location: { lat: 26.89, lng: 84.52, address: 'Bagaha, Near Primary School' },
      status: 'IN_PROGRESS',
    }),
  ];

  const allocations: Allocation[] = [];

  const shelters: Shelter[] = [
    {
      id: 'sh-1',
      name: 'Narkatiyaganj High School Shelter',
      address: 'Ward 5, Narkatiyaganj',
      location: { lat: 27.0, lng: 84.51, address: 'Narkatiyaganj High School' },
      capacity: 200,
      occupied: 142,
      foodAvailable: true,
      waterAvailable: true,
      medicalAvailable: true,
      status: 'Near Capacity',
      notes: 'Additional mats and blankets requested.',
    },
    {
      id: 'sh-2',
      name: 'Bettiah Collectorate Hall',
      address: 'Gandhi Chowk, Bettiah',
      location: { lat: 26.95, lng: 84.52, address: 'Bettiah Collectorate Hall' },
      capacity: 400,
      occupied: 285,
      foodAvailable: true,
      waterAvailable: true,
      medicalAvailable: false,
      status: 'Open',
    },
  ];

  const reliefCenters: ReliefCenter[] = [
    {
      id: 'rc-1',
      name: 'Central Relief Warehouse',
      address: 'Bettiah Industrial Area',
      location: { lat: 26.96, lng: 84.53, address: 'Central Relief Warehouse, Bettiah' },
      type: 'Warehouse + Dispatch',
      contact: '+91-90000-11111',
      resources: ['Food', 'Water', 'Shelter', 'Medical'],
      status: 'Active',
    },
  ];

  let incidentCounter = 0;
  function mkIncident(d: Partial<Incident> & { name: string; type: Incident['type']; severity: Incident['severity']; description: string }): Incident {
    incidentCounter += 1;
    return {
      id: generateIncidentId(2024, incidentCounter),
      name: d.name,
      type: d.type,
      affectedArea: d.affectedArea ?? 'West Champaran',
      severity: d.severity,
      startTime: iso(hoursAgo(Math.floor(Math.random() * 200))),
      description: d.description,
      status: d.status ?? 'Active',
      operationalNotes: d.operationalNotes ?? [],
    };
  }

  const incidents: Incident[] = [
    mkIncident({
      name: 'North Bihar Floods 2024',
      type: 'Flood',
      affectedArea: 'W Champaran, E Champaran, Sitamarhi',
      severity: 'CRITICAL',
      description: 'Heavy rains caused Gandak river overflow. Multiple blocks submerged. Rescue ops in progress.',
      status: 'Active',
    }),
    mkIncident({
      name: 'Bettiah Fire Incident',
      type: 'Fire',
      affectedArea: 'Bettiah Ward 7',
      severity: 'MEDIUM',
      description: 'Electrical fire in slum area. 12 huts affected. No casualties reported.',
      status: 'Contained',
    }),
  ];

  return {
    users,
    requests,
    volunteers,
    resources,
    allocations,
    shelters,
    reliefCenters,
    incidents,
    requestCounter,
    incidentCounter,
  };
}
