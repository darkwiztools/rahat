import type {
  Volunteer,
  EmergencyRequest,
  VolunteerSkill,
  EmergencyType,
  ResourceCategory,
} from '../types/rahat';
import { haversineKm } from './geo';

interface MatchResult {
  overall: number;
  skill: number;
  availability: number;
  distance: number;
  workload: number;
}

const RESOURCE_TO_SKILLS: Record<ResourceCategory, VolunteerSkill[]> = {
  Food: ['Food Distribution', 'Logistics', 'Driving'],
  'Drinking Water': ['Water Distribution', 'Logistics', 'Driving'],
  Medicine: ['Medical', 'First Aid', 'Driving'],
  'First Aid': ['First Aid', 'Medical'],
  Shelter: ['Shelter Management', 'Logistics', 'Driving'],
  Transportation: ['Driving', 'Logistics'],
  Clothing: ['Logistics', 'Driving'],
  'Baby Supplies': ['Logistics', 'Driving', 'Shelter Management'],
  'Sanitary Supplies': ['Logistics', 'Driving'],
  'Rescue Equipment': ['Rescue', 'Search & Rescue', 'Logistics'],
  Other: ['Driving', 'Logistics'],
};

const EMERGENCY_TYPE_TO_SKILLS: Record<EmergencyType, VolunteerSkill[]> = {
  Flood: ['Rescue', 'Search & Rescue', 'Driving', 'Water Distribution', 'Shelter Management'],
  Fire: ['Rescue', 'Search & Rescue', 'First Aid', 'Medical'],
  Storm: ['Rescue', 'Shelter Management', 'Logistics', 'Communication'],
  'Medical Emergency': ['Medical', 'First Aid', 'Driving'],
  Accident: ['First Aid', 'Medical', 'Rescue', 'Driving'],
  'Building Damage': ['Rescue', 'Search & Rescue', 'Technical Support', 'Logistics'],
  'Food Shortage': ['Food Distribution', 'Logistics', 'Driving'],
  'Water Shortage': ['Water Distribution', 'Logistics', 'Driving'],
  'Shelter Needed': ['Shelter Management', 'Logistics', 'Driving'],
  'Transportation Needed': ['Driving', 'Logistics'],
  'Missing Person': ['Search & Rescue', 'Rescue', 'Communication'],
  'Rescue Required': ['Rescue', 'Search & Rescue', 'First Aid', 'Medical', 'Driving'],
  'Emergency SOS': ['Rescue', 'First Aid', 'Medical', 'Communication'],
  Other: ['Driving', 'Logistics'],
};

function getRelevantSkills(request: EmergencyRequest): Set<VolunteerSkill> {
  const relevant = new Set<VolunteerSkill>();

  for (const resource of request.requiredResources) {
    const skills = RESOURCE_TO_SKILLS[resource] || RESOURCE_TO_SKILLS.Other;
    for (const skill of skills) {
      relevant.add(skill);
    }
  }

  const emergencySkills = EMERGENCY_TYPE_TO_SKILLS[request.emergencyType] || EMERGENCY_TYPE_TO_SKILLS.Other;
  for (const skill of emergencySkills) {
    relevant.add(skill);
  }

  return relevant;
}

function calcSkillScore(volunteer: Volunteer, relevantSkills: Set<VolunteerSkill>): number {
  if (relevantSkills.size === 0) return 0.5;

  const matched = volunteer.skills.filter((s) => relevantSkills.has(s));
  const hasAny = matched.length > 0 ? 1 : 0;
  const fraction = matched.length / relevantSkills.size;

  return (hasAny + fraction) / 2;
}

function calcAvailabilityScore(volunteer: Volunteer): number {
  switch (volunteer.availability) {
    case 'AVAILABLE':
      return 1;
    case 'BUSY':
      return 0.1;
    case 'OFFLINE':
      return 0;
    default:
      return 0;
  }
}

function calcDistanceScore(volunteer: Volunteer, request: EmergencyRequest): number {
  if (!volunteer.location || !request.location) {
    return 0.5;
  }
  try {
    const distance = haversineKm(volunteer.location, request.location);
    if (distance <= 5) return 1;
    if (distance >= 30) return 0;
    return (30 - distance) / 25;
  } catch {
    return 0.5;
  }
}

function calcWorkloadScore(activeWorkload: number): number {
  if (activeWorkload === 0) return 1;
  if (activeWorkload === 1) return 0.3;
  return 0;
}

export function matchScoreVolunteer(
  volunteer: Volunteer,
  request: EmergencyRequest,
  volunteersActiveWorkload?: number
): MatchResult {
  const relevantSkills = getRelevantSkills(request);
  const skill = calcSkillScore(volunteer, relevantSkills);
  const availability = calcAvailabilityScore(volunteer);
  const distance = calcDistanceScore(volunteer, request);
  const workload = calcWorkloadScore(
    volunteersActiveWorkload !== undefined
      ? volunteersActiveWorkload
      : volunteer.currentAssignmentIds.length
  );

  const overall = skill * 0.4 + availability * 0.3 + distance * 0.2 + workload * 0.1;

  return {
    overall: Math.round(overall * 1000) / 1000,
    skill: Math.round(skill * 1000) / 1000,
    availability: Math.round(availability * 1000) / 1000,
    distance: Math.round(distance * 1000) / 1000,
    workload: Math.round(workload * 1000) / 1000,
  };
}
