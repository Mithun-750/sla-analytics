import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../client';
import type {
  User,
  Customer,
  Skill,
  TicketSummary,
  TicketDetail,
  TicketEvent,
  TicketEscalation,
  TicketPause,
  PagedResponse,
  StatsOverview,
  AgentStats,
} from '../types';

// ---- Users ----
export function useUsers(role?: string, search?: string, page = 0, size = 20) {
  return useQuery<PagedResponse<User>>({
    queryKey: ['users', role, search, page, size],
    queryFn: () =>
      client
        .get('/users', { params: { role, search, page, size } })
        .then((r) => r.data),
  });
}

export function useUser(id: number | undefined) {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => client.get(`/users/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

// ---- Customers ----
export function useCustomers(search?: string, page = 0, size = 20) {
  return useQuery<PagedResponse<Customer>>({
    queryKey: ['customers', search, page, size],
    queryFn: () =>
      client
        .get('/customers', { params: { search, page, size } })
        .then((r) => r.data),
  });
}

// ---- Skills ----
export function useSkills() {
  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: () => client.get('/skills').then((r) => r.data),
  });
}

// ---- Tickets ----
export interface TicketFilters {
  status?: string;
  customerId?: number;
  agentId?: number;
  priority?: string;
}

export function useTickets(filters: TicketFilters = {}, page = 0, size = 20) {
  return useQuery<PagedResponse<TicketSummary>>({
    queryKey: ['tickets', filters, page, size],
    queryFn: () =>
      client.get('/tickets', { params: { ...filters, page, size } }).then((r) => r.data),
  });
}

export function useTicket(id: number | undefined) {
  return useQuery<TicketDetail>({
    queryKey: ['ticket', id],
    queryFn: () => client.get(`/tickets/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useTicketEvents(id: number | undefined) {
  return useQuery<TicketEvent[]>({
    queryKey: ['ticket-events', id],
    queryFn: () => client.get(`/tickets/${id}/events`).then((r) => r.data),
    enabled: !!id,
  });
}

// ---- Escalations ----
export interface EscalationFilters {
  status?: string;
  supervisorId?: number;
}

export function useEscalations(filters: EscalationFilters = {}) {
  return useQuery<PagedResponse<TicketEscalation>>({
    queryKey: ['escalations', filters],
    queryFn: () =>
      client.get('/escalations', { params: { ...filters, size: 50 } }).then((r) => r.data),
  });
}

// ---- Pauses ----
export function usePauses(status?: string) {
  return useQuery<PagedResponse<TicketPause>>({
    queryKey: ['pauses', status],
    queryFn: () =>
      client.get('/pauses', { params: { status, size: 50 } }).then((r) => r.data),
  });
}

// ---- Stats ----
export function useStats() {
  return useQuery<StatsOverview>({
    queryKey: ['stats'],
    queryFn: () => client.get('/stats/overview').then((r) => r.data),
  });
}

export function useAgentStats(id: number | undefined) {
  return useQuery<AgentStats>({
    queryKey: ['agent-stats', id],
    queryFn: () => client.get(`/stats/agent/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

// ---- Mutations ----

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      subject: string;
      description?: string;
      urgency?: string;
      skillId?: number;
      customerId: number;
    }) => client.post('/tickets', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      client.patch(`/tickets/${id}/status`, { status }).then((r) => r.data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['ticket', v.id] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agentId }: { id: number; agentId: number }) =>
      client.post(`/tickets/${id}/assign`, { agentId }).then((r) => r.data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['ticket', v.id] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useCreateEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, reason }: { ticketId: number; reason: string }) =>
      client.post('/escalations', { ticketId, reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escalations'] }),
  });
}

export function useClaimEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, supervisorId }: { id: number; supervisorId: number }) =>
      client.post(`/escalations/${id}/claim`, { supervisorId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escalations'] }),
  });
}

export function useResolveEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolutionNote }: { id: number; resolutionNote: string }) =>
      client.post(`/escalations/${id}/resolve`, { resolutionNote }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escalations'] }),
  });
}

export function useRequestPause() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, reason, agentId }: { ticketId: number; reason: string; agentId: number }) =>
      client.post(`/tickets/${ticketId}/pause`, { reason, agentId }).then((r) => r.data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['ticket', v.ticketId] });
      qc.invalidateQueries({ queryKey: ['pauses'] });
    },
  });
}

export function useApprovePause() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, supervisorId }: { id: number; supervisorId: number }) =>
      client.post(`/pauses/${id}/approve`, { supervisorId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pauses'] }),
  });
}

export function useRejectPause() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, supervisorId }: { id: number; supervisorId: number }) =>
      client.post(`/pauses/${id}/reject`, { supervisorId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pauses'] }),
  });
}

export function useResumePause() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      client.post(`/pauses/${id}/resume`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pauses'] }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { username: string; role: string; maxConcurrentTickets: number }) =>
      client.post('/users', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useToggleAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      client.patch(`/users/${id}/availability`, { available }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUserSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      skills,
    }: {
      id: number;
      skills: { skillId: number; proficiencyLevel: number }[];
    }) => client.put(`/users/${id}/skills`, skills).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; tier: string }) =>
      client.post('/customers', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      client.post('/skills', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { type: string; id: number }) =>
      client.post('/auth/login', data).then((r) => r.data),
  });
}
