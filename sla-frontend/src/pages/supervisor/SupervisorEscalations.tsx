import { useState } from 'react';
import { useAuth } from '../../store/auth';
import {
  useEscalations,
  useClaimEscalation,
  useResolveEscalation,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import type { TicketEscalation } from '../../api/types';

export default function SupervisorEscalations() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading, isError } = useEscalations({
    status: statusFilter || undefined,
  });

  const claimMutation = useClaimEscalation();
  const resolveMutation = useResolveEscalation();

  const [resolvingItem, setResolvingItem] = useState<TicketEscalation | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleClaim = async (id: number) => {
    if (!user) return;
    try {
      await claimMutation.mutateAsync({ id, supervisorId: user.id });
    } catch {
      alert('Failed to claim escalation');
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolvingItem || !resolutionNote.trim()) {
      setErrorMsg('Resolution note is required');
      return;
    }
    try {
      await resolveMutation.mutateAsync({
        id: resolvingItem.id,
        resolutionNote: resolutionNote.trim(),
      });
      setResolvingItem(null);
      setResolutionNote('');
      setErrorMsg('');
    } catch {
      setErrorMsg('Failed to resolve escalation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Escalations</h1>
          <p className="text-sm text-gray-500 mt-1">Review, claim, and resolve escalated tickets</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLAIMED">Claimed</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load escalations.</p>}

        {data && (
          <div className="overflow-x-auto">
            {data.content.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No escalations found.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4 font-medium">Ticket</th>
                    <th className="pb-2 pr-4 font-medium">Reason</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Created By</th>
                    <th className="pb-2 pr-4 font-medium">Supervisor</th>
                    <th className="pb-2 pr-4 font-medium">Created</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.content.map((esc) => (
                    <tr key={esc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-xs text-blue-600">
                        {esc.ticketNumber ?? `#${esc.ticketId}`}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-800 max-w-xs">{esc.reason}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge value={esc.status} />
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600">{esc.createdByUsername ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{esc.ownerSupervisorUsername ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-gray-500 text-xs">
                        {new Date(esc.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        {esc.status === 'OPEN' && (
                          <button
                            onClick={() => handleClaim(esc.id)}
                            disabled={claimMutation.isPending}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Claim
                          </button>
                        )}
                        {esc.status === 'CLAIMED' && (
                          <button
                            onClick={() => {
                              setResolvingItem(esc);
                              setResolutionNote('');
                              setErrorMsg('');
                            }}
                            className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                        {esc.status === 'RESOLVED' && (
                          <span className="text-xs text-gray-400">Resolved</span>
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

      {/* Resolve Modal */}
      {resolvingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Resolve Escalation #{resolvingItem.id}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Reason: {resolvingItem.reason}
            </p>

            <label className="block text-xs font-medium text-gray-700 mb-1">
              Resolution Note <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
              placeholder="Explain how this escalation was resolved..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4"
            />

            {errorMsg && <p className="text-xs text-red-600 mb-3">{errorMsg}</p>}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setResolvingItem(null)}
                className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={resolveMutation.isPending}
                className="bg-green-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {resolveMutation.isPending ? 'Resolving…' : 'Submit Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
