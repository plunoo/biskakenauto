
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import CustomersPage from './pages/CustomersPage';
import InventoryPage from './pages/InventoryPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import { useStore } from './store/useStore';

// Placeholder Pages for Demonstration
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl">
    <h2 className="text-xl font-bold text-gray-400">{title} Module</h2>
    <p className="text-gray-400">Coming soon in next iteration...</p>
  </div>
);

const App: React.FC = () => {
  const { user } = useStore();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/jobs" element={user ? <JobsPage /> : <Navigate to="/login" />} />
          
          <Route path="/customers" element={user ? <CustomersPage /> : <Navigate to="/login" />} />
          <Route path="/inventory" element={user ? <InventoryPage /> : <Navigate to="/login" />} />
          <Route path="/invoices" element={user ? <InvoicesPage /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <ReportsPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/dashboard" />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
