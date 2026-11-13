import { useState } from 'react';
import { useCustomers, useCreateCustomer } from '../../api/hooks';
import Spinner from '../../components/Spinner';

import type { CustomerTier } from '../../api/types';

export default function AdminCustomers() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useCustomers(search || undefined, page, 20);
  const createCustomerMutation = useCreateCustomer();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<'STANDARD' | 'PREMIUM' | 'ENTERPRISE'>('STANDARD');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required');
      return;
    }
    try {
      await createCustomerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        tier,
      });
      setShowModal(false);
      setName('');
      setEmail('');
      setTier('STANDARD');
      setErrorMsg('');
    } catch {
      setErrorMsg('Failed to create customer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Directory of registered customer organizations and tiers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Customer
        </button>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by customer name..."
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
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
                    <th className="pb-2 pr-4 font-medium">Tier</th>
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
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            c.tier === 'ENTERPRISE'
                              ? 'bg-purple-100 text-purple-700'
                              : c.tier === 'PREMIUM'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 text-xs text-gray-500">
              <span>
                Page {data.page + 1} of {Math.max(1, data.totalPages)} ({data.totalElements} customers)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={data.page === 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.page >= data.totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4"
          >
            <h3 className="text-base font-semibold text-gray-800">Add New Customer</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Acme Corp"
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
                placeholder="support@acme.com"
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

            {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
