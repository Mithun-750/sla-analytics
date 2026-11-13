import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import InfiniteSelect from '../components/InfiniteSelect';
import client from '../api/client';

type RoleOption = 'Customer' | 'Agent' | 'Supervisor' | 'Admin';
const ROLE_OPTIONS: RoleOption[] = ['Customer', 'Agent', 'Supervisor', 'Admin'];

interface SelectableEntity {
  id: number;
  name?: string;
  username?: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleOption>('Agent');
  const [selected, setSelected] = useState<SelectableEntity | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(
    async (search: string, page: number) => {
      if (role === 'Customer') {
        const res = await client.get('/customers', {
          params: { search, page, size: 20 },
        });
        const data = res.data;
        return {
          items: data.content as SelectableEntity[],
          hasMore: page < data.totalPages - 1,
        };
      } else {
        const apiRole =
          role === 'Agent' ? 'AGENT' : role === 'Supervisor' ? 'SUPERVISOR' : 'ADMIN';
        const res = await client.get('/users', {
          params: { role: apiRole, search, page, size: 20 },
        });
        const data = res.data;
        return {
          items: data.content as SelectableEntity[],
          hasMore: page < data.totalPages - 1,
        };
      }
    },
    [role],
  );

  const getLabel = (item: SelectableEntity) =>
    item.username ?? item.name ?? String(item.id);

  const handleLogin = async () => {
    if (!selected) {
      setError('Please select a user');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const type = role === 'Customer' ? 'customer' : 'user';
      const authUser = await login(type, selected.id);
      if (type === 'customer') {
        navigate('/customer');
      } else if (authUser.role === 'AGENT') {
        navigate('/agent');
      } else if (authUser.role === 'SUPERVISOR') {
        navigate('/supervisor');
      } else if (authUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-6">SLA Platform</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as RoleOption);
                setSelected(null);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {role === 'Customer' ? 'Customer' : 'Username'}
            </label>
            <InfiniteSelect<SelectableEntity>
              key={role}
              fetchPage={fetchPage}
              value={selected}
              onChange={setSelected}
              getLabel={getLabel}
              getKey={(item) => item.id}
              placeholder={`Search ${role.toLowerCase()}…`}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading || !selected}
            className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
