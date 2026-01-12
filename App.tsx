
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPageFixed from './pages/DashboardPageFixed';
import JobsPageFixed from './pages/JobsPageFixed';
import InventoryPageFixed from './pages/InventoryPageFixed';
import CustomersPage from './pages/CustomersPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportsPageFixed from './pages/ReportsPageFixed';
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
      <Routes>
        {/* Login route */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        
        {/* Protected admin dashboard routes */}
        <Route path="/dashboard" element={
          user ? (
            <Layout>
              <DashboardPageFixed />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/jobs" element={
          user ? (
            <Layout>
              <JobsPageFixed />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/customers" element={
          user ? (
            <Layout>
              <CustomersPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/inventory" element={
          user ? (
            <Layout>
              <InventoryPageFixed />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/invoices" element={
          user ? (
            <Layout>
              <InvoicesPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/reports" element={
          user ? (
            <Layout>
              <ReportsPageFixed />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/admin" element={
          user?.role === 'ADMIN' ? (
            <Layout>
              <AdminPage />
            </Layout>
          ) : (
            <Navigate to="/dashboard" />
          )
        } />
        <Route path="/settings" element={
          user ? (
            <Layout>
              <SettingsPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        {/* Default redirect */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
