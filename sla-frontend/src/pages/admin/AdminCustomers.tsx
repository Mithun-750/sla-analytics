import { useState } from 'react';
import { useCustomers, useCreateCustomer } from '../../api/hooks';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import type { CustomerTier } from '../../api/types';

export default function AdminCustomers() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useCustomers(
    search || undefined,
    page,
    15,
  );

  const createCustomerMutation = useCreateCustomer();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<CustomerTier>('STANDARD');
  const [createError, setCreateError] = useState('');

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setCreateError('Name and email are required');
      return;
    }
    try {
      await createCustomerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        tier,
      });
      setShowCreateModal(false);
      setName('');
      setEmail('');
      setTier('STANDARD');
      setCreateError('');
    } catch {
      setCreateError('Failed to create customer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Directory of client organizations and SLA tier levels</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {/* Search */}
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search customers by name or email..."
            className="flex-1 max-w-sm border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load customers.</p>}

        {data && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4 font-medium">ID</th>
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 pr-4 font-medium">SLA Tier</th>
                    <th className="pb-2 font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.content.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 text-xs font-mono text-gray-400">#{c.id}</td>
                      <td className="py-2.5 pr-4 font-medium text-gray-800">{c.name}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{c.email}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            c.tier === 'ENTERPRISE'
                              ? 'bg-purple-100 text-purple-800'
                              : c.tier === 'PREMIUM'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
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
              entityName="customers"
            />
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateCustomer}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4"
          >
            <h3 className="text-base font-semibold text-gray-800">Add New Customer</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="contact@acme.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CustomerTier)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            {createError && <p className="text-xs text-red-600">{createError}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createCustomerMutation.isPending}
                className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {createCustomerMutation.isPending ? 'Creating…' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
