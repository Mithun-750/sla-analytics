import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { useTickets, useAgentStats } from '../../api/hooks';
import TicketTable from '../../components/TicketTable';
import Spinner from '../../components/Spinner';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const stats = useAgentStats(user?.id);
  const { data, isLoading, isError } = useTickets({ agentId: user?.id }, 0, 50);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Agent Dashboard</h1>
        <Link to="/agent/tickets" className="text-sm text-blue-600 hover:underline">
          All My Tickets →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Assigned" value={stats.data?.assignedCount ?? 0} color="text-blue-600" />
        <StatCard label="Resolved Today" value={stats.data?.resolvedCount ?? 0} color="text-green-600" />
        <StatCard label="SLA Breached" value={stats.data?.slaBreachedCount ?? 0} color="text-red-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Assigned Tickets (by SLA urgency)</h2>
        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load tickets.</p>}
        {data && (
          <TicketTable
            tickets={[...data.content].sort((a, b) => {
              const pctA = a.slaTargetSeconds > 0 ? a.slaConsumedSeconds / a.slaTargetSeconds : 1;
              const pctB = b.slaTargetSeconds > 0 ? b.slaConsumedSeconds / b.slaTargetSeconds : 1;
              return pctB - pctA;
            })}
            detailBasePath="/agent/ticket"
          />
        )}
      </div>
    </div>
  );
}
