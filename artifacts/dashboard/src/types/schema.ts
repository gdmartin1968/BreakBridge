// Inferred types based on implementation notes

export interface Location {
  id: string;
  name: string;
  timezone: string;
}

export type RatioStatus = "GREEN" | "FRAGILE" | "MAXED";

export interface Classroom {
  id: string;
  name: string;
  label: string;
  staffCount: number;
  currentKids: number;
  ratioStatus: RatioStatus;
  napWindowActive: boolean;
  pastBreakCutoff: boolean;
  canSendOnBreak: boolean;
}

export interface Staff {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: "CLASSROOM" | "BREAKER";
  classroomId: string | null;
  classroom?: { name: string };
  noBreaks: boolean;
}

export interface BreakPlan {
  id: string;
  planDate: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  generatedBy: string;
  _count: { assignments: number };
}

export interface BreakAssignment {
  id: string;
  staffId: string;
  classroomId: string;
  breakStart: string;
  breakEnd: string;
  durationMins: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  staff: { displayName: string };
  classroom: { name: string };
  coverageAssignment: { breaker: { displayName: string } } | null;
}

export interface ProposeBreakPlanResponse {
  breakPlanId: string;
  status: string;
  assignmentsCount: number;
  assignments: any[];
  breakersAvailable: number;
}

export interface RuleConfig {
  breakCutoffTime: string;
  defaultBreakMins: number;
  minBreakGapMins: number;
  maxBreaksPerStaff: number;
}

export interface AdminStatus {
  organizations: number;
  locations: number;
  classrooms: number;
  activeStaff: number;
}
