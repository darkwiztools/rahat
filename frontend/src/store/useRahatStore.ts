import { create } from 'zustand';
import * as idbKeyval from 'idb-keyval';

import type {
  Allocation,
  AuditLogEntry,
  EmergencyRequest,
  GeoCoords,
  Incident,
  IncidentNote,
  Notification,
  RequestStatus,
  ResourceInventory,
  Role,
  Shelter,
  TimelineEntry,
  UserProfile,
  Volunteer,
  VolunteerAvailability,
  ReliefCenter,
  Severity,
} from '../types/rahat';

export type UiDensity = 'comfortable' | 'compact';
import { STATUS_TRANSITION_GRAPH, DEMO_USERS } from '../constants/rahat';
import { createSeedData, SeedData } from '../data/seed';
import { generateRequestId, generateIncidentId, generateUUID } from '../utils/ids';

export type RahatSlice = {
  initialized: boolean;
  users: UserProfile[];
  requests: EmergencyRequest[];
  volunteers: Volunteer[];
  resources: ResourceInventory[];
  allocations: Allocation[];
  shelters: Shelter[];
  reliefCenters: ReliefCenter[];
  incidents: Incident[];
  notifications: Notification[];
  auditLog: AuditLogEntry[];
  requestCounter: number;
  incidentCounter: number;
  currentUserId: string | null;
  offlineBannerDismissed: boolean;
  backendOnline: boolean;
};

type ActorCtx = { actorId: string | null; actorName: string; role?: Role };

export type RahatActions = {
  initialize: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  setBackendOnline: (online: boolean) => void;
  dismissOfflineBanner: () => void;
  setCurrentUser: (userId: string | null) => Promise<void>;
  getCurrentUser: () => UserProfile | null;
  findUserByEmail: (email: string) => UserProfile | null;

  assignVolunteerToRequest: (requestId: string, volunteerId: string, ctx: ActorCtx) => { ok: boolean; error?: string };
  allocateResourcesToRequest: (
    requestId: string,
    items: Array<{ resourceId: string; quantity: number }>,
    ctx: ActorCtx
  ) => { ok: boolean; error?: string; allocations?: Allocation[] };

  createNotification: (payload: {
    targetRole?: Role;
    targetUserId?: string;
    type: string;
    title: string;
    message: string;
    relatedRequestId?: string;
  }) => Notification;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (roleOrUserId: Role | string) => void;

  appendAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }) => AuditLogEntry;
};

export type RahatStore = RahatSlice & RahatActions;

const STORAGE_KEY = 'rahat-store-v1';
const PERSIST_KEYS: Array<keyof RahatSlice> = [
  'users',
  'requests',
  'volunteers',
  'resources',
  'allocations',
  'shelters',
  'reliefCenters',
  'incidents',
  'notifications',
  'auditLog',
  'requestCounter',
  'incidentCounter',
  'currentUserId',
  'offlineBannerDismissed',
];

async function persist(state: RahatSlice): Promise<void> {
  const snapshot: Partial<RahatSlice> = {};
  for (const k of PERSIST_KEYS) snapshot[k] = state[k] as any;
  try {
    await idbKeyval.set(STORAGE_KEY, snapshot);
  } catch {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* ignore */
    }
  }
}

async function hydrate(): Promise<Partial<RahatSlice> | null> {
  try {
    const fromIdb = (await idbKeyval.get(STORAGE_KEY)) as Partial<RahatSlice> | undefined;
    if (fromIdb && fromIdb.users && fromIdb.users.length > 0) return fromIdb;
  } catch {
    /* fallthrough */
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Partial<RahatSlice>;
  } catch {
    /* ignore */
  }
  return null;
}

async function clearStorage(): Promise<void> {
  try {
    await idbKeyval.del(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function seedToState(seed: SeedData): RahatSlice {
  return {
    initialized: true,
    users: seed.users,
    requests: seed.requests,
    volunteers: seed.volunteers,
    resources: seed.resources,
    allocations: seed.allocations,
    shelters: seed.shelters,
    reliefCenters: seed.reliefCenters,
    incidents: seed.incidents,
    notifications: [],
    auditLog: [],
    requestCounter: seed.requestCounter,
    incidentCounter: seed.incidentCounter,
    currentUserId: null,
    offlineBannerDismissed: false,
    backendOnline: false,
  };
}

const nowISO = () => new Date().toISOString();

function getInventoryStatus(res: ResourceInventory): 'Available' | 'Low' | 'Out of Stock' {
  if (res.quantity <= 0) return 'Out of Stock';
  if (res.quantity <= res.lowThreshold) return 'Low';
  return 'Available';
}

export const useRahatStore = create<RahatStore>((set, get) => ({
  initialized: false,
  users: [],
  requests: [],
  volunteers: [],
  resources: [],
  allocations: [],
  shelters: [],
  reliefCenters: [],
  incidents: [],
  notifications: [],
  auditLog: [],
  requestCounter: 0,
  incidentCounter: 0,
  currentUserId: null,
  offlineBannerDismissed: false,
  backendOnline: false,

  initialize: async () => {
    if (get().initialized) return;
    const hydrated = await hydrate();
    if (hydrated) {
      set((s) => ({ ...s, ...(hydrated as any), initialized: true }));
    } else {
      const seed = createSeedData();
      const base = seedToState(seed);
      base.auditLog = [
        {
          id: generateUUID(),
          actor: 'system',
          action: 'INIT_SEED',
          entityType: 'SYSTEM',
          entityId: 'seed',
          note: 'Seeded demo data for RAHAT',
          timestamp: nowISO(),
        },
      ];
      set(base);
      await persist(get());
    }
  },

  resetDemoData: async () => {
    await clearStorage();
    const seed = createSeedData();
    const base = seedToState(seed);
    base.auditLog = [
      {
        id: generateUUID(),
        actor: 'system',
        action: 'RESET_DEMO',
        entityType: 'SYSTEM',
        entityId: 'reset',
        note: 'Demo data reset',
        timestamp: nowISO(),
      },
    ];
    set(base);
    await persist(get());
  },

  setBackendOnline: (online) => set({ backendOnline: online }),
  dismissOfflineBanner: () => set({ offlineBannerDismissed: true }),

  setCurrentUser: async (userId) => {
    set({ currentUserId: userId });
    if (userId) {
      try {
        localStorage.setItem('rahat_current_user_id', userId);
      } catch {
        /* ignore */
      }
    } else {
      try {
        localStorage.removeItem('rahat_current_user_id');
      } catch {
        /* ignore */
      }
    }
    await persist(get());
  },

  getCurrentUser: () => {
    const state = get();
    if (!state.currentUserId) return null;
    return state.users.find((u) => u.id === state.currentUserId) || null;
  },

  findUserByEmail: (email) => {
    const lower = email.toLowerCase();
    return get().users.find((u) => u.email.toLowerCase() === lower) || null;
  },

  assignVolunteerToRequest: (requestId, volunteerId, ctx) => {
    const req = get().requests.find((r) => r.id === requestId);
    const vol = get().volunteers.find((v) => v.id === volunteerId);
    if (!req) return { ok: false, error: 'Request not found' };
    if (!vol) return { ok: false, error: 'Volunteer not found' };
    const beforeReq = JSON.parse(JSON.stringify(req));
    const beforeVol = JSON.parse(JSON.stringify(vol));
    const ts = nowISO();
    const updatedVol: Volunteer = {
      ...vol,
      availability: 'BUSY',
      currentAssignmentIds: vol.currentAssignmentIds.includes(requestId)
        ? vol.currentAssignmentIds
        : [...vol.currentAssignmentIds, requestId],
    };
    const nextStatus: RequestStatus = req.status === 'NEW' || req.status === 'UNDER_REVIEW' ? 'ASSIGNED' : req.status;
    const updatedReq: EmergencyRequest = {
      ...req,
      assignedVolunteerId: volunteerId,
      status: nextStatus,
      timeline: [
        ...req.timeline,
        { status: nextStatus, timestamp: ts, actor: ctx.actorName, note: `Volunteer assigned: ${vol.name}` },
      ],
      updatedAt: ts,
    };
    set((s) => ({
      ...s,
      volunteers: s.volunteers.map((v) => (v.id === volunteerId ? updatedVol : v)),
      requests: s.requests.map((r) => (r.id === requestId ? updatedReq : r)),
    }));
    get().createNotification({
      targetUserId: volunteerId,
      type: 'NEW_MISSION',
      title: `New mission assigned: ${requestId}`,
      message: `${req.emergencyType} • ${req.severity} • ${req.location.address}`,
      relatedRequestId: requestId,
    });
    get().appendAuditLog({
      actor: ctx.actorId || ctx.actorName,
      action: 'ASSIGN_VOLUNTEER',
      entityType: 'REQUEST',
      entityId: requestId,
      note: `Assigned volunteer ${vol.name} (${volunteerId})`,
      beforeSnapshot: { request: beforeReq, volunteer: beforeVol },
      afterSnapshot: { request: JSON.parse(JSON.stringify(updatedReq)), volunteer: JSON.parse(JSON.stringify(updatedVol)) },
    });
    persist(get());
    return { ok: true };
  },

  allocateResourcesToRequest: (requestId, items, ctx) => {
    const state = get();
    const req = state.requests.find((r) => r.id === requestId);
    if (!req) return { ok: false, error: 'Request not found' };
    const beforeReq = JSON.parse(JSON.stringify(req));
    const beforeResources = state.resources.map((r) => JSON.parse(JSON.stringify(r)));
    const updatedResources = [...state.resources];
    const newAllocations: Allocation[] = [];
    const ts = nowISO();
    let totalQtyNote: string[] = [];
    for (const it of items) {
      const idx = updatedResources.findIndex((r) => r.id === it.resourceId);
      if (idx === -1) return { ok: false, error: `Resource not found: ${it.resourceId}` };
      const res = updatedResources[idx];
      if (it.quantity > res.quantity) {
        return { ok: false, error: `Cannot allocate ${it.quantity} ${res.unit} of ${res.name}; only ${res.quantity} available` };
      }
      const newQty = res.quantity - it.quantity;
      const newRes: ResourceInventory = { ...res, quantity: newQty, lastUpdated: ts };
      updatedResources[idx] = newRes;
      const allocation: Allocation = {
        id: generateUUID(),
        requestId,
        resourceId: res.id,
        quantity: it.quantity,
        allocatedBy: ctx.actorId || ctx.actorName,
        allocatedAt: ts,
      };
      newAllocations.push(allocation);
      totalQtyNote.push(`${res.name} ${it.quantity}${res.unit}`);
    }
    const updatedAllocations = [...state.allocations, ...newAllocations];
    const reqAllocIds = [...(req.allocatedResources.map((a) => a.id) || []), ...newAllocations.map((a) => a.id)];
    const updatedReq: EmergencyRequest = {
      ...req,
      allocatedResources: reqAllocIds
        .map((id) => updatedAllocations.find((a) => a.id === id)!)
        .filter(Boolean),
      timeline: [
        ...req.timeline,
        { status: req.status, timestamp: ts, actor: ctx.actorName, note: `Resources allocated: ${totalQtyNote.join(', ')}` },
      ],
      updatedAt: ts,
    };
    set((s) => ({
      ...s,
      resources: updatedResources,
      allocations: updatedAllocations,
      requests: s.requests.map((r) => (r.id === requestId ? updatedReq : r)),
    }));
    if (req.assignedVolunteerId) {
      get().createNotification({
        targetUserId: req.assignedVolunteerId,
        type: 'RESOURCES_ALLOCATED',
        title: `Resources allocated for ${requestId}`,
        message: totalQtyNote.join(', '),
        relatedRequestId: requestId,
      });
    }
    get().appendAuditLog({
      actor: ctx.actorId || ctx.actorName,
      action: 'ALLOCATE_RESOURCES',
      entityType: 'REQUEST',
      entityId: requestId,
      note: totalQtyNote.join(', '),
      beforeSnapshot: { request: beforeReq, resources: beforeResources },
      afterSnapshot: { request: JSON.parse(JSON.stringify(updatedReq)), resources: updatedResources.map((r) => JSON.parse(JSON.stringify(r))) },
    });
    persist(get());
    return { ok: true, allocations: newAllocations };
  },

  createNotification: (payload) => {
    const n: Notification = {
      id: generateUUID(),
      targetRole: payload.targetRole,
      targetUserId: payload.targetUserId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      relatedRequestId: payload.relatedRequestId,
      read: false,
      createdAt: nowISO(),
    };
    set((s) => ({ ...s, notifications: [n, ...s.notifications] }));
    persist(get());
    return n;
  },

  markNotificationRead: (id) => {
    set((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    persist(get());
  },

  markAllNotificationsRead: (roleOrUserId) => {
    set((s) => ({
      ...s,
      notifications: s.notifications.map((n) => {
        const match =
          (n.targetRole && n.targetRole === (roleOrUserId as Role)) ||
          (n.targetUserId && n.targetUserId === roleOrUserId);
        return match ? { ...n, read: true } : n;
      }),
    }));
    persist(get());
  },

  appendAuditLog: (entry) => {
    const ts = entry.timestamp || nowISO();
    const e: AuditLogEntry = { id: generateUUID(), timestamp: ts, ...entry };
    set((s) => ({ ...s, auditLog: [e, ...s.auditLog] }));
    return e;
  },
}));

export function useCurrentUser(): UserProfile | null {
  return useRahatStore((s) => (s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) || null : null));
}

export function useIsAdmin(): boolean {
  const u = useCurrentUser();
  return !!u && u.role === 'coordinator';
}

export function useInventoryStatusOf(resourceId: string): ReturnType<typeof getInventoryStatus> {
  const r = useRahatStore((s) => s.resources.find((x) => x.id === resourceId));
  return r ? getInventoryStatus(r) : 'Available';
}

export { getInventoryStatus };
