
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPageFixed from './pages/DashboardPageFixed';
import JobsPage from './pages/JobsPage';
import JobsPageSimple from './pages/JobsPageSimple';
import JobsPageTest from './pages/JobsPageTest';
import JobsPageUITest from './pages/JobsPageUITest';
import JobsPageUIBugTest from './pages/JobsPageUIBugTest';
import JobsPageFixed from './pages/JobsPageFixed';
import InventoryPageFixed from './pages/InventoryPageFixed';
import BlogManagementPageFixed from './pages/BlogManagementPageFixed';
import BlogTestPage from './pages/BlogTestPage';
import CustomersPage from './pages/CustomersPage';
import InventoryPage from './pages/InventoryPage';
import InvoicesPage from './pages/InvoicesPage';
import BlogPage from './pages/BlogPage';
import BlogManagementPage from './pages/BlogManagementPage';
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
        {/* Public routes without Layout */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes with Layout */}
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
          <Layout>
            <JobsPageFixed />
          </Layout>
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
          <Layout>
            <InventoryPageFixed />
          </Layout>
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
          <Layout>
            <BlogManagementPageFixed />
          </Layout>
        } />
        <Route path="/blog-test" element={
          <Layout>
            <BlogTestPage />
          </Layout>
        } />
        <Route path="/reports" element={
          <Layout>
            <ReportsPageFixed />
          </Layout>
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
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/landing" />} />
      </Routes>
    </Router>
  );
};

export default App;
