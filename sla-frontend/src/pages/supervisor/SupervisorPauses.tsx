import { useState } from 'react';
import { useAuth } from '../../store/auth';
import {
  usePauses,
  useApprovePause,
  useRejectPause,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

export default function SupervisorPauses() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('REQUESTED');
  const { data, isLoading, isError } = usePauses(filter || undefined);

  const approveMutation = useApprovePause();
  const rejectMutation = useRejectPause();

  const handleApprove = async (id: number) => {
    if (!user) return;
    try {
      await approveMutation.mutateAsync({ id, supervisorId: user.id });
    } catch {
      alert('Failed to approve pause request');
    }
  };

  const handleReject = async (id: number) => {
    if (!user) return;
    try {
      await rejectMutation.mutateAsync({ id, supervisorId: user.id });
    } catch {
      alert('Failed to reject pause request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">SLA Pause Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and action pending SLA clock pause requests</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="REQUESTED">Requested (Pending)</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="RESUMED">Resumed</option>
          <option value="">All Statuses</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load pause requests.</p>}

        {data && (
          <div className="overflow-x-auto">
            {data.content.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No pause requests found.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4 font-medium">Ticket ID</th>
                    <th className="pb-2 pr-4 font-medium">Reason</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Requested By</th>
                    <th className="pb-2 pr-4 font-medium">Supervisor</th>
                    <th className="pb-2 pr-4 font-medium">Requested At</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.content.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-xs text-blue-600">
                        #{p.ticketId}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-800 max-w-xs">{p.reason}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge value={p.decisionStatus} />
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600">{p.requestedByUsername ?? `User #${p.requestedById}`}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{p.approvedByUsername ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-gray-500 text-xs">
                        {new Date(p.requestedAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        {p.decisionStatus === 'REQUESTED' ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleApprove(p.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(p.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 capitalize">{p.decisionStatus.toLowerCase()}</span>
                        )}
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
