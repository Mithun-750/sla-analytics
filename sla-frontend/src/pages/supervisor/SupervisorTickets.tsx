import { useState, useCallback } from 'react';
import { useTickets, useAssignTicket } from '../../api/hooks';
import client from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import SlaBar from '../../components/SlaBar';
import Spinner from '../../components/Spinner';
import InfiniteSelect from '../../components/InfiniteSelect';
import Pagination from '../../components/Pagination';
import type { TicketSummary, User } from '../../api/types';

export default function SupervisorTickets() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data, isLoading, isError } = useTickets(
    {
      search: search || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    },
    page,
    15,
  );

  const assignMutation = useAssignTicket();
  const [selectedTicket, setSelectedTicket] = useState<TicketSummary | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAgents = useCallback(async (q: string, p: number) => {
    const res = await client.get('/users', {
      params: { role: 'AGENT', search: q, page: p, size: 20 },
    });
    return {
      items: res.data.content as User[],
      hasMore: p < res.data.totalPages - 1,
    };
  }, []);

  const handleAssign = async () => {
    if (!selectedTicket || !selectedAgent) return;
    try {
      await assignMutation.mutateAsync({
        id: selectedTicket.id,
        agentId: selectedAgent.id,
      });
      setSelectedTicket(null);
      setSelectedAgent(null);
      setErrorMsg('');
    } catch {
      setErrorMsg('Failed to reassign agent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Support Ticket Routing</h1>
          <p className="text-sm text-gray-500 mt-1">Review active queue and reassign tickets</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by ticket #, subject..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(0);
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load tickets.</p>}

        {data && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4 font-medium">Ticket #</th>
                    <th className="pb-2 pr-4 font-medium">Subject</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Priority</th>
                    <th className="pb-2 pr-4 font-medium">Customer</th>
                    <th className="pb-2 pr-4 font-medium">Agent</th>
                    <th className="pb-2 pr-4 font-medium w-36">SLA</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.content.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-xs text-blue-600">
                        {t.ticketNumber}
                      </td>
                      <td className="py-2.5 pr-4 max-w-xs truncate text-gray-800">{t.subject}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge value={t.status} />
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge value={t.priority} />
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600">{t.customerName}</td>
                      <td className="py-2.5 pr-4 text-gray-600">
                        {t.assignedAgentUsername ?? (
                          <span className="text-amber-600 text-xs font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 w-36">
                        <SlaBar consumed={t.slaConsumedSeconds} target={t.slaTargetSeconds} />
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setSelectedAgent(null);
                            setErrorMsg('');
                          }}
                          className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          {t.assignedAgentId ? 'Reassign' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={setPage}
              entityName="tickets"
            />
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-gray-800">
              Assign Agent to {selectedTicket.ticketNumber}
            </h3>
            <p className="text-xs text-gray-500">
              Select an available support agent to handle this ticket.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Agent</label>
                <InfiniteSelect<User>
                  fetchPage={fetchAgents}
                  value={selectedAgent}
                  onChange={setSelectedAgent}
                  getLabel={(u) => `${u.username} (${u.available ? 'Available' : 'Busy'})`}
                  getKey={(u) => u.id}
                  placeholder="Search agents..."
                />
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={!selectedAgent || assignMutation.isPending}
                  className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {assignMutation.isPending ? 'Assigning…' : 'Assign Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
