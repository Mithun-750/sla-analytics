import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';

interface NavItem {
  label: string;
  to: string;
}

function getNavItems(user: ReturnType<typeof useAuth>['user']): NavItem[] {
  if (!user) return [];
  if (user.type === 'customer') {
    return [
      { label: 'Dashboard', to: '/customer' },
      { label: 'Create Ticket', to: '/customer/create' },
    ];
  }
  if (user.role === 'AGENT') {
    return [
      { label: 'Dashboard', to: '/agent' },
      { label: 'My Tickets', to: '/agent/tickets' },
    ];
  }
  if (user.role === 'SUPERVISOR') {
    return [
      { label: 'Dashboard', to: '/supervisor' },
      { label: 'Escalations', to: '/supervisor/escalations' },
      { label: 'Pause Requests', to: '/supervisor/pauses' },
      { label: 'All Tickets', to: '/supervisor/tickets' },
    ];
  }
  if (user.role === 'ADMIN') {
    return [
      { label: 'Dashboard', to: '/admin' },
      { label: 'Users', to: '/admin/users' },
      { label: 'Customers', to: '/admin/customers' },
      { label: 'Skills', to: '/admin/skills' },
      { label: 'Tickets', to: '/admin/tickets' },
    ];
  }
  return [];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItems = getNavItems(user);

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-800 tracking-wide uppercase">
            SLA Platform
          </span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              item.to === location.pathname ||
              (item.to !== '/admin' &&
                item.to !== '/agent' &&
                item.to !== '/supervisor' &&
                item.to !== '/customer' &&
                location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
          {user?.role ?? user?.type}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-sm text-gray-700 font-medium">{user?.username}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
