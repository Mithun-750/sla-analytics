import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { useTickets } from '../../api/hooks';
import TicketTable from '../../components/TicketTable';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, isError } = useTickets(
    {
      customerId: user?.id,
      search: search || undefined,
      status: status || undefined,
    },
    page,
    10,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Welcome, {user?.username}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your support tickets</p>
        </div>
        <a
          href="/customer/create"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Create Ticket
        </a>
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
            placeholder="Search by ticket #, subject or description..."
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
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load tickets.</p>}
        {data && (
          <div>
            <TicketTable tickets={data.content} detailBasePath="/customer/ticket" />
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
    </div>
  );
}
