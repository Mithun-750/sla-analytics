import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { useTickets } from '../../api/hooks';
import TicketTable from '../../components/TicketTable';
import Spinner from '../../components/Spinner';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useTickets(
    { customerId: user?.id },
    0,
    50,
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Welcome, {user?.username}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your support tickets</p>
        </div>
        <Link
          to="/customer/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Create Ticket
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">My Tickets</h2>
        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load tickets.</p>}
        {data && (
          <TicketTable tickets={data.content} detailBasePath="/customer/ticket" />
        )}
      </div>
    </div>
  );
}
