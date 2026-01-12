import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Car, 
  CreditCard, 
  Activity, 
  Sparkles, 
  RefreshCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Home,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiService } from '../services/apiService';
import { JobStatus } from '../types';
import MobileMoneyTest from '../components/MobileMoneyTest';
import DatabaseStatus from '../components/DatabaseStatus';

const revenueData = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 1900 },
  { name: 'Wed', revenue: 1500 },
  { name: 'Thu', revenue: 2400 },
  { name: 'Fri', revenue: 1800 },
  { name: 'Sat', revenue: 3200 },
  { name: 'Sun', revenue: 900 },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
    <div className="flex justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
        {change && (
          <p className={`text-xs mt-1 font-medium ${change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
            {change} <span className="text-gray-400 ml-1">from last month</span>
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const DashboardPageFixed: React.FC = () => {
  const navigate = useNavigate();
  const { user, jobs, customers, loading } = useStore();
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalCustomers: 0,
    recentJobs: []
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Use local store data for stats
      const pendingJobs = jobs?.filter(job => job.status === JobStatus.PENDING).length || 0;
      const completedJobs = jobs?.filter(job => job.status === JobStatus.COMPLETED).length || 0;
      const totalRevenue = jobs?.reduce((sum, job) => sum + (job.estimatedCost || 0), 0) || 0;
      
      setDashboardStats({
        totalRevenue,
        pendingJobs,
        completedJobs,
        totalCustomers: customers?.length || 0,
        recentJobs: jobs?.slice(0, 3) || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      // Simulate API refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewWork = () => {
    navigate('/jobs');
  };

  const handleGoHome = () => {
    navigate('/landing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with User Info and Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Admin'}!
          </h1>
          <p className="text-gray-500">Here's what's happening at your auto shop today.</p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGoHome}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
          >
            <Home size={16} />
            Go to Homepage
          </button>
          <button
            onClick={handleNewWork}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            New Work Order
          </button>
          <button
            onClick={handleRefreshData}
            disabled={refreshing}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCcw size={16} />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₵${dashboardStats.totalRevenue.toFixed(2)}`}
          change="+12.5%"
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <StatCard
          title="Active Jobs"
          value={dashboardStats.pendingJobs}
          change="+8.2%"
          icon={Car}
          color="bg-blue-500"
        />
        <StatCard
          title="Completed Jobs"
          value={dashboardStats.completedJobs}
          change="+15.3%"
          icon={CheckCircle2}
          color="bg-green-500"
        />
        <StatCard
          title="Total Customers"
          value={dashboardStats.totalCustomers}
          change="+5.7%"
          icon={Activity}
          color="bg-purple-500"
        />
      </div>

      {/* Charts and Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₵${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Work Orders</h3>
            <span className="text-sm text-gray-500">{dashboardStats.recentJobs.length} active</span>
          </div>
          <div className="space-y-3">
            {dashboardStats.recentJobs.length > 0 ? (
              dashboardStats.recentJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      job.status === JobStatus.COMPLETED ? 'bg-green-500' : 
                      job.status === JobStatus.IN_PROGRESS ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{job.customerName}</p>
                      <p className="text-sm text-gray-500">{job.vehicleInfo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === JobStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                      job.status === JobStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">₵{job.estimatedCost}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Car className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p>No recent work orders</p>
                <button 
                  onClick={handleNewWork}
                  className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                >
                  Create your first job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <DatabaseStatus />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Services</span>
              <span className="flex items-center text-green-600">
                <CheckCircle2 size={16} className="mr-1" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mobile Money</span>
              <span className="flex items-center text-yellow-600">
                <Clock size={16} className="mr-1" />
                Testing
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Money Test Component */}
        <div className="lg:col-span-2">
          <MobileMoneyTest />
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Business Insights</h3>
            <p className="text-sm text-gray-600">Powered by advanced analytics</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <p className="text-gray-700">
            📈 Your shop is performing well this week! Revenue is up 12.5% compared to last month. 
            Consider focusing on brake services as they show the highest profit margins. 
            The busy period on Saturday suggests weekend promotions could boost revenue further.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">Last updated: Just now</span>
            <button 
              onClick={handleRefreshData}
              className="text-purple-600 hover:text-purple-700 text-sm"
            >
              Refresh insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageFixed;