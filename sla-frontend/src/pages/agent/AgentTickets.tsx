import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { useTickets } from '../../api/hooks';
import TicketTable from '../../components/TicketTable';
import Spinner from '../../components/Spinner';
import type { TicketStatus } from '../../api/types';

const STATUS_OPTIONS: Array<TicketStatus | ''> = [
  '', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED',
];

export default function AgentTickets() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('');
  const { data, isLoading, isError } = useTickets(
    { agentId: user?.id, status: status || undefined },
    0,
    100,
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Tickets</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load tickets.</p>}
        {data && <TicketTable tickets={data.content} detailBasePath="/agent/ticket" />}
      </div>
    </div>
  );
}
