
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import InventoryPageFixed from './pages/InventoryPageFixed';
import CustomersPage from './pages/CustomersPage';
import InvoicesPage from './pages/InvoicesPage';
import BlogManagementPage from './pages/BlogManagementPage';
import ReportsPageFixed from './pages/ReportsPageFixed';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
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

  // Admin domains: bisadmin.rpnmore.com or localhost
  // Public domains: biskakenauto.rpnmore.com (landing page)
  const isAdminDomain = () => {
    const hostname = window.location.hostname;
    const ADMIN_DOMAINS = ['bisadmin.rpnmore.com', 'localhost', '127.0.0.1'];
    return ADMIN_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
  };

  return (
    <Router>
      <Routes>
        {/* Landing page for main domain */}
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Customer registration */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Hidden admin login routes */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin-login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        
        {/* Protected admin dashboard routes */}
        <Route path="/dashboard" element={
          user ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/jobs" element={
          user ? (
            <Layout>
              <JobsPage />
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
        <Route path="/blog" element={
          user ? (
            <Layout>
              <BlogManagementPage />
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
        
        {/* Default redirect - route based on domain */}
        <Route path="/" element={
          isAdminDomain() 
            ? (user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />)
            : <Navigate to="/landing" />
        } />
      </Routes>
    </Router>
  );
};

export default App;
