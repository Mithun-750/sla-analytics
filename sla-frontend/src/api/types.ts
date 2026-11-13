// Enums
export type TicketStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_CUSTOMER'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Urgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SlaClockStatus = 'RUNNING' | 'PAUSED' | 'BREACHED' | 'STOPPED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EscalationStatus = 'OPEN' | 'CLAIMED' | 'RESOLVED';
export type PauseDecisionStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RESUMED';
export type UserRole = 'AGENT' | 'SUPERVISOR' | 'ADMIN';
export type CustomerTier = 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

// Core entities
export interface Skill {
  id: number;
  name: string;
}

export interface UserSkill {
  skillId: number;
  skillName: string;
  proficiencyLevel: number;
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  available: boolean;
  maxConcurrentTickets: number;
  createdAt: string;
  skills: UserSkill[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  tier: CustomerTier;
  createdAt: string;
}

// Ticket types
export interface TicketSummary {
  id: number;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  urgency: Urgency;
  slaClockStatus: SlaClockStatus;
  slaConsumedSeconds: number;
  slaTargetSeconds: number;
  slaDeadlineAt: string;
  slaBreached: boolean;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
  customerId: number;
  customerName: string;
  assignedAgentId: number | null;
  assignedAgentUsername: string | null;
}

export interface TicketEvent {
  id: string;
  ticketId: number;
  actorId: number | null;
  actorType: string;
  eventType: string;
  fromState: string | null;
  toState: string | null;
  slaConsumedSecondsSnapshot: number | null;
  metadata: string | null;
  createdAt: string;
}

export interface TicketEscalation {
  id: number;
  ticketId: number;
  ticketNumber?: string;
  reason: string;
  status: EscalationStatus;
  createdAt: string;
  updatedAt: string;
  createdById: number | null;
  createdByUsername: string | null;
  ownerSupervisorId: number | null;
  ownerSupervisorUsername: string | null;
  resolvedById: number | null;
  resolvedByUsername: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export interface TicketPause {
  id: number;
  ticketId: number;
  ticketNumber?: string;
  reason?: string;
  attemptedReason?: string;
  decisionStatus: PauseDecisionStatus;
  requestedById?: number;
  requestedByUsername?: string | null;
  initiatedById?: number;
  initiatedByUsername?: string | null;
  approvedById: number | null;
  approvedByUsername: string | null;
  remarks?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  pausedAt?: string | null;
  resumedAt?: string | null;
  pauseStartedAt?: string | null;
  pauseEndedAt?: string | null;
  pausedDurationBusinessSeconds?: number | null;
}

export interface TicketAssignment {
  id: number;
  ticketId: number;
  agentId: number;
  agentUsername: string | null;
  assignedById: number | null;
  assignedByUsername: string | null;
  assignedAt: string;
  unassignedAt: string | null;
}

export interface TicketDetail extends TicketSummary {
  description: string;
  skillId: number | null;
  skillName: string | null;
  events: TicketEvent[];
  activePause: TicketPause | null;
  activeEscalation: TicketEscalation | null;
  assignments: TicketAssignment[];
}

// Paged response
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Stats
export interface StatsOverview {
  totalTickets: number;
  newCount: number;
  assignedCount: number;
  inProgressCount: number;
  pendingCustomerCount: number;
  escalatedCount: number;
  resolvedCount: number;
  closedCount: number;
  slaBreachedCount: number;
  openEscalationsCount: number;
  pendingPausesCount: number;
}

export interface AgentStats {
  agentId: number;
  assignedCount: number;
  resolvedCount: number;
  slaBreachedCount: number;
}
