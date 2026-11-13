import { useStats } from '../../api/hooks';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Platform performance and system health indicators</p>
      </div>

      {isLoading && <Spinner />}
      {isError && <p className="text-red-500 text-sm">Failed to load system stats.</p>}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Tickets</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalTickets}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">New Tickets</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.newCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">In Progress</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.inProgressCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">SLA Breached</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.slaBreachedCount}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Escalated</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.escalatedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolvedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Closed</p>
            <p className="text-3xl font-bold text-gray-500 mt-1">{stats.closedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Pending Pauses</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.pendingPausesCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
