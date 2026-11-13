import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import {
  useTicket,
  useUpdateTicketStatus,
  useRequestPause,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import SlaBar from '../../components/SlaBar';
import Spinner from '../../components/Spinner';
import type { TicketStatus } from '../../api/types';

const STATUS_OPTIONS: TicketStatus[] = [
  'NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED',
];

export default function AgentTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const ticketId = id ? Number(id) : undefined;
  const { data: ticket, isLoading, isError } = useTicket(ticketId);
  const updateStatus = useUpdateTicketStatus();
  const requestPause = useRequestPause();

  const [newStatus, setNewStatus] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [pauseMsg, setPauseMsg] = useState('');

  if (isLoading) return <Spinner />;
  if (isError || !ticket) return <p className="text-red-500 text-sm">Failed to load ticket.</p>;

  const handleUpdateStatus = async () => {
    if (!newStatus || !ticketId) return;
    try {
      await updateStatus.mutateAsync({ id: ticketId, status: newStatus });
      setStatusMsg('Status updated!');
      setNewStatus('');
    } catch {
      setStatusMsg('Failed to update status.');
    }
  };

  const handlePauseRequest = async () => {
    if (!pauseReason.trim() || !ticketId || !user) return;
    try {
      await requestPause.mutateAsync({ ticketId, reason: pauseReason, agentId: user.id });
      setPauseMsg('Pause requested!');
      setShowPauseModal(false);
      setPauseReason('');
    } catch {
      setPauseMsg('Failed to request pause.');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link to="/agent/tickets" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

      {/* Ticket info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
            <h1 className="text-lg font-bold text-gray-800 mt-1">{ticket.subject}</h1>
          </div>
          <StatusBadge value={ticket.status} />
        </div>
        {ticket.description && (
          <p className="text-sm text-gray-600 mt-2 mb-4">{ticket.description}</p>
        )}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">SLA</p>
          <SlaBar consumed={ticket.slaConsumedSeconds} target={ticket.slaTargetSeconds} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Priority:</span> <StatusBadge value={ticket.priority} /></div>
          <div><span className="text-gray-500">Customer:</span> <span className="text-gray-800">{ticket.customerName}</span></div>
          <div><span className="text-gray-500">SLA Clock:</span> <StatusBadge value={ticket.slaClockStatus} /></div>
          <div><span className="text-gray-500">Created:</span> <span className="text-gray-800">{new Date(ticket.createdAt).toLocaleString()}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Actions</h2>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select status…</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={!newStatus || updateStatus.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Update Status
          </button>
          <button
            onClick={() => setShowPauseModal(true)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Request SLA Pause
          </button>
        </div>
        {statusMsg && <p className="text-sm text-green-600 mt-2">{statusMsg}</p>}
        {pauseMsg && <p className="text-sm text-green-600 mt-2">{pauseMsg}</p>}
      </div>

      {/* Assignment History */}
      {ticket.assignments && ticket.assignments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Assignment History</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="pb-2 pr-4 text-left font-medium">Agent</th>
                <th className="pb-2 pr-4 text-left font-medium">Assigned At</th>
                <th className="pb-2 text-left font-medium">Unassigned At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ticket.assignments.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 pr-4">{a.agentUsername}</td>
                  <td className="py-2 pr-4 text-gray-500">{new Date(a.assignedAt).toLocaleString()}</td>
                  <td className="py-2 text-gray-500">{a.unassignedAt ? new Date(a.unassignedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Event Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Event Timeline</h2>
        {ticket.events && ticket.events.length > 0 ? (
          <ol className="relative border-l border-gray-200 space-y-4 ml-3">
            {ticket.events.map((ev) => (
              <li key={ev.id} className="ml-4">
                <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
                <p className="text-xs text-gray-500">{new Date(ev.createdAt).toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-800">{ev.eventType.replace(/_/g, ' ')}</p>
                {ev.fromState && ev.toState && (
                  <p className="text-xs text-gray-500">{ev.fromState} → {ev.toState}</p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-400">No events yet.</p>
        )}
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Request SLA Pause</h3>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              rows={3}
              placeholder="Reason for pause…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handlePauseRequest}
                disabled={!pauseReason.trim() || requestPause.isPending}
                className="flex-1 bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {requestPause.isPending ? 'Requesting…' : 'Submit'}
              </button>
              <button
                onClick={() => { setShowPauseModal(false); setPauseReason(''); }}
                className="flex-1 border border-gray-300 text-gray-700 rounded-md py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
