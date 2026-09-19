export * from './rahat';

export interface User {
  id: string
  email: string
  name?: string
  role?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Case {
  id: string
  caseNumber: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'closed' | 'pending'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
  assignedTo?: string
}

export interface Evidence {
  id: string
  caseId: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
  hash?: string
  description?: string
}

export interface CDRRecord {
  id?: string
  caseId?: string
  msisdn?: string
  imsi?: string
  imei?: string
  callType?: string
  otherParty?: string
  callDate?: string
  callTime?: string
  duration?: number
  cellId?: string
  lac?: string
  operator?: string
  latitude?: number
  longitude?: number
}

export interface StatItem {
  label: string
  value: number | string
  change?: string
  icon?: string
}

export interface ActivityDataPoint {
  date: string
  cases: number
  evidence: number
  cdr: number
}
