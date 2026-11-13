import { Link } from 'react-router-dom';
import type { TicketSummary } from '../api/types';
import StatusBadge from './StatusBadge';
import SlaBar from './SlaBar';

interface TicketTableProps {
  tickets: TicketSummary[];
  detailBasePath: string;
}

export default function TicketTable({ tickets, detailBasePath }: TicketTableProps) {
  if (tickets.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No tickets found.</p>;
  }

  return (
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
            <th className="pb-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tickets.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-2 pr-4">
                <Link
                  to={`${detailBasePath}/${t.id}`}
                  className="text-blue-600 hover:underline font-mono text-xs"
                >
                  {t.ticketNumber}
                </Link>
              </td>
              <td className="py-2 pr-4 max-w-xs truncate text-gray-800">{t.subject}</td>
              <td className="py-2 pr-4">
                <StatusBadge value={t.status} />
              </td>
              <td className="py-2 pr-4">
                <StatusBadge value={t.priority} />
              </td>
              <td className="py-2 pr-4 text-gray-600">{t.customerName}</td>
              <td className="py-2 pr-4 text-gray-600">{t.assignedAgentUsername ?? '—'}</td>
              <td className="py-2 pr-4 w-36">
                <SlaBar consumed={t.slaConsumedSeconds} target={t.slaTargetSeconds} />
              </td>
              <td className="py-2 text-gray-500 whitespace-nowrap text-xs">
                {new Date(t.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
