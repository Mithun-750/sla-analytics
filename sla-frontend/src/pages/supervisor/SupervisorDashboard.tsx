import { Link } from 'react-router-dom';
import { useStats, useEscalations } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

export default function SupervisorDashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useStats();
  const { data: escalations, isLoading: escLoading, isError: escError } = useEscalations({
    status: 'OPEN',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Supervisor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of team escalations and SLA status</p>
        </div>
      </div>

      {statsLoading && <Spinner />}
      {statsError && <p className="text-red-500 text-sm">Failed to load system statistics.</p>}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Tickets</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalTickets}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">SLA Breached</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.slaBreachedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Open Escalations</p>
              <Link to="/supervisor/escalations" className="text-xs text-blue-600 hover:underline">
                View
              </Link>
            </div>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.openEscalationsCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Pending Pauses</p>
              <Link to="/supervisor/pauses" className="text-xs text-blue-600 hover:underline">
                View
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-bold text-blue-600">{stats.pendingPausesCount}</p>
              {stats.pendingPausesCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  Action needed
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Open Escalations List */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Open Escalations</h2>
          <Link to="/supervisor/escalations" className="text-xs text-blue-600 hover:underline">
            Manage Escalations →
          </Link>
        </div>

        {escLoading && <Spinner />}
        {escError && <p className="text-red-500 text-sm">Failed to load escalations.</p>}

        {escalations && (
          <div className="overflow-x-auto">
            {escalations.content.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">No open escalations.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4 font-medium">Ticket #</th>
                    <th className="pb-2 pr-4 font-medium">Reason</th>
                    <th className="pb-2 pr-4 font-medium">Created By</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {escalations.content.slice(0, 5).map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-xs text-blue-600">
                        {e.ticketNumber ?? `#${e.ticketId}`}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-800 max-w-xs truncate">{e.reason}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{e.createdByUsername ?? '—'}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge value={e.status} />
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
