import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/auth';
import Layout from './components/Layout';

import Login from './pages/Login';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateTicket from './pages/customer/CreateTicket';
import TicketDetail from './pages/customer/TicketDetail';

import AgentDashboard from './pages/agent/AgentDashboard';
import AgentTickets from './pages/agent/AgentTickets';
import AgentTicketDetail from './pages/agent/AgentTicketDetail';

import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import SupervisorEscalations from './pages/supervisor/SupervisorEscalations';
import SupervisorPauses from './pages/supervisor/SupervisorPauses';
import SupervisorTickets from './pages/supervisor/SupervisorTickets';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSkills from './pages/admin/AdminSkills';
import AdminTickets from './pages/admin/AdminTickets';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Customer Routes */}
            <Route
              path="/customer"
              element={
                <Layout>
                  <CustomerDashboard />
                </Layout>
              }
            />
            <Route
              path="/customer/create"
              element={
                <Layout>
                  <CreateTicket />
                </Layout>
              }
            />
            <Route
              path="/customer/ticket/:id"
              element={
                <Layout>
                  <TicketDetail />
                </Layout>
              }
            />

            {/* Agent Routes */}
            <Route
              path="/agent"
              element={
                <Layout>
                  <AgentDashboard />
                </Layout>
              }
            />
            <Route
              path="/agent/tickets"
              element={
                <Layout>
                  <AgentTickets />
                </Layout>
              }
            />
            <Route
              path="/agent/ticket/:id"
              element={
                <Layout>
                  <AgentTicketDetail />
                </Layout>
              }
            />

            {/* Supervisor Routes */}
            <Route
              path="/supervisor"
              element={
                <Layout>
                  <SupervisorDashboard />
                </Layout>
              }
            />
            <Route
              path="/supervisor/escalations"
              element={
                <Layout>
                  <SupervisorEscalations />
                </Layout>
              }
            />
            <Route
              path="/supervisor/pauses"
              element={
                <Layout>
                  <SupervisorPauses />
                </Layout>
              }
            />
            <Route
              path="/supervisor/tickets"
              element={
                <Layout>
                  <SupervisorTickets />
                </Layout>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <Layout>
                  <AdminDashboard />
                </Layout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Layout>
                  <AdminUsers />
                </Layout>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <Layout>
                  <AdminCustomers />
                </Layout>
              }
            />
            <Route
              path="/admin/skills"
              element={
                <Layout>
                  <AdminSkills />
                </Layout>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <Layout>
                  <AdminTickets />
                </Layout>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
