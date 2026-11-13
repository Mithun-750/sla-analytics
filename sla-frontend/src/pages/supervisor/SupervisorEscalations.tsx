import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { useEscalations, useClaimEscalation, useResolveEscalation } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';

export default function SupervisorEscalations() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('OPEN');

  const { data, isLoading, isError } = useEscalations(
    {
      search: search || undefined,
      status: status || undefined,
    },
    page,
    15,
  );

  const claimMutation = useClaimEscalation();
  const resolveMutation = useResolveEscalation();

  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveError, setResolveError] = useState('');

  const handleClaim = async (id: number) => {
    if (!user) return;
    try {
      await claimMutation.mutateAsync({ id, supervisorId: user.id });
    } catch {
      alert('Failed to claim escalation');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingId) return;
    if (!resolutionNotes.trim()) {
      setResolveError('Resolution notes are required');
      return;
    }
    try {
      await resolveMutation.mutateAsync({ id: resolvingId, resolutionNotes: resolutionNotes.trim() });
      setResolvingId(null);
      setResolutionNotes('');
      setResolveError('');
    } catch {
      setResolveError('Failed to resolve escalation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Ticket Escalations</h1>
          <p className="text-sm text-gray-500 mt-1">Review, claim, and resolve escalated customer issues</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search escalations by ticket #, reason or description..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLAIMED">Claimed</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load escalations.</p>}

        {data && (
          <div>
            <div className="overflow-x-auto">
              {data.content.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No escalations found.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-2 pr-4 font-medium">Ticket #</th>
                      <th className="pb-2 pr-4 font-medium">Reason</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
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
                        <td className="py-2.5 pr-4 text-gray-600">
                          {esc.ownerSupervisorUsername ?? 'Unclaimed'}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-500 text-xs">
                          {new Date(esc.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <div className="inline-flex gap-2">
                            {esc.status === 'OPEN' && (
                              <button
                                onClick={() => handleClaim(esc.id)}
                                disabled={claimMutation.isPending}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                Claim
                              </button>
                            )}
                            {esc.status === 'CLAIMED' && (
                              <button
                                onClick={() => {
                                  setResolvingId(esc.id);
                                  setResolutionNotes('');
                                  setResolveError('');
                                }}
                                className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded text-xs font-medium transition-colors"
                              >
                                Resolve
                              </button>
                            )}
                            {esc.status === 'RESOLVED' && (
                              <span className="text-xs text-gray-400">Resolved</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={setPage}
              entityName="escalations"
            />
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolvingId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleResolve}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4"
          >
            <h3 className="text-base font-semibold text-gray-800">Resolve Escalation</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Resolution Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Explain the steps taken to resolve this escalation…"
              />
            </div>
            {resolveError && <p className="text-xs text-red-600">{resolveError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setResolvingId(null)}
                className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resolveMutation.isPending}
                className="bg-green-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {resolveMutation.isPending ? 'Saving…' : 'Mark Resolved'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
