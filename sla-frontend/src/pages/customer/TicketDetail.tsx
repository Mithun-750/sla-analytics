import { useParams, Link } from 'react-router-dom';
import { useTicket } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import SlaBar from '../../components/SlaBar';
import Spinner from '../../components/Spinner';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading, isError } = useTicket(id ? Number(id) : undefined);

  if (isLoading) return <Spinner />;
  if (isError || !ticket) return <p className="text-red-500 text-sm">Failed to load ticket.</p>;

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link to="/customer" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

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
          <div>
            <span className="text-gray-500">Priority:</span>{' '}
            <StatusBadge value={ticket.priority} />
          </div>
          <div>
            <span className="text-gray-500">Urgency:</span>{' '}
            <StatusBadge value={ticket.urgency} />
          </div>
          <div>
            <span className="text-gray-500">SLA Clock:</span>{' '}
            <StatusBadge value={ticket.slaClockStatus} />
          </div>
          <div>
            <span className="text-gray-500">Agent:</span>{' '}
            <span className="text-gray-800">{ticket.assignedAgentUsername ?? '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>{' '}
            <span className="text-gray-800">{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
          {ticket.slaDeadlineAt && (
            <div>
              <span className="text-gray-500">SLA Deadline:</span>{' '}
              <span className="text-gray-800">{new Date(ticket.slaDeadlineAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Event Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Event Timeline</h2>
        {ticket.events && ticket.events.length > 0 ? (
          <ol className="relative border-l border-gray-200 space-y-4 ml-3">
            {ticket.events.map((ev) => (
              <li key={ev.id} className="ml-4">
                <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
                <p className="text-xs text-gray-500">{new Date(ev.createdAt).toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-800">
                  {ev.eventType.replace(/_/g, ' ')}
                </p>
                {ev.fromState && ev.toState && (
                  <p className="text-xs text-gray-500">
                    {ev.fromState} → {ev.toState}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-400">No events yet.</p>
        )}
      </div>
    </div>
  );
}
