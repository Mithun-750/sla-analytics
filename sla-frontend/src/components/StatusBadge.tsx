interface StatusBadgeProps {
  value: string;
}

const colorMap: Record<string, string> = {
  // TicketStatus
  NEW: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  PENDING_CUSTOMER: 'bg-orange-100 text-orange-700',
  ESCALATED: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  // EscalationStatus
  OPEN: 'bg-red-100 text-red-700',
  CLAIMED: 'bg-yellow-100 text-yellow-700',
  // PauseDecisionStatus
  REQUESTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  RESUMED: 'bg-gray-100 text-gray-600',
  // Priority / Urgency
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
  // SlaClockStatus
  RUNNING: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  BREACHED: 'bg-red-100 text-red-700',
  STOPPED: 'bg-gray-100 text-gray-600',
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  const cls = colorMap[value] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  );
}
