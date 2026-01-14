
import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { useStore } from '../store/useStore';
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
  Edit3,
  Brain,
  FileText,
  Image,
  Upload,
  Video
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
// import { getAIInsights } from '../services/gemini';
import { apiService } from '../services/apiService';
import { JobStatus } from '../types';
import MobileMoneyTest from '../components/MobileMoneyTest';

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
  <Card className="hover:shadow-md transition-shadow">
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
  </Card>
);

const DashboardPage: React.FC = () => {
  const { jobs, inventory, customers, invoices, loadAllData } = useStore();
  const [insights, setInsights] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [databaseStatus, setDatabaseStatus] = useState<any>(null);

  const fetchInsights = async () => {
    setIsRefreshing(true);
    try {
      // Try to get AI insights from backend first
      const aiResponse = await apiService.testAIDiagnosis({
        complaint: `Business insights needed: Revenue up 15%, ${jobs.length} active jobs, ${inventory.filter(i => i.stock < i.reorderLevel).length} items low on stock. Thursday is the busiest day.`
      });
      
      if (aiResponse.success) {
        setInsights([
          aiResponse.data.diagnosis,
          `Estimated repair time: ${aiResponse.data.repairTime}`,
          `Confidence level: ${(aiResponse.data.confidence * 100).toFixed(0)}%`
        ]);
      } else {
        // Fallback to local AI
        const summary = `Revenue up 15%, ${jobs.length} active jobs, ${inventory.filter(i => i.stock < i.reorderLevel).length} items low on stock. Thursday is the busiest day.`;
        const newInsights = await getAIInsights(summary);
        setInsights(newInsights);
      }
    } catch (error) {
      console.log('Backend AI unavailable, using local AI');
      const summary = `Revenue up 15%, ${jobs.length} active jobs, ${inventory.filter(i => i.stock < i.reorderLevel).length} items low on stock. Thursday is the busiest day.`;
      const newInsights = await getAIInsights(summary);
      setInsights(newInsights);
    }
    setIsRefreshing(false);
  };

  const checkBackendStatus = async () => {
    try {
      const status = await apiService.getStatus();
      setBackendStatus(status);
    } catch (error) {
      console.log('Backend not available');
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const status = await apiService.getDatabaseStatus();
      setDatabaseStatus(status);
      console.log('📊 Database status:', status);
    } catch (error) {
      console.log('Database status check failed');
      setDatabaseStatus({ success: false, data: { status: 'disconnected' } });
    }
  };

  useEffect(() => {
    fetchInsights();
    checkBackendStatus();
    checkDatabaseStatus();
    
    // Load all data when dashboard mounts
    console.log('📊 Dashboard mounted - loading all data...');
    loadAllData();
  }, []);

  useEffect(() => {
    console.log('📈 Dashboard data state:', { 
      customersCount: customers.length, 
      jobsCount: jobs.length, 
      inventoryCount: inventory.length, 
      invoicesCount: invoices.length 
    });
  }, [customers, jobs, inventory, invoices]);

  const pendingJobs = jobs.filter(j => j.status === JobStatus.PENDING);
  const inProgressJobs = jobs.filter(j => j.status === JobStatus.IN_PROGRESS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workshop Overview</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              V4.0 AI Features Active! 🚀🤖
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {backendStatus && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">API Connected</span>
                <span className="text-xs text-gray-400">• Services Ready</span>
              </div>
            )}
            
            {databaseStatus && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  databaseStatus.success && databaseStatus.data.status === 'connected' 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
                <span className={`text-xs font-medium ${
                  databaseStatus.success && databaseStatus.data.status === 'connected'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  Database {databaseStatus.data.status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
                {databaseStatus.success && databaseStatus.data.responseTime && (
                  <span className="text-xs text-gray-400">• {databaseStatus.data.responseTime}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border">
          <Button variant="ghost" size="sm" className="bg-gray-100">Today</Button>
          <Button variant="ghost" size="sm">This Week</Button>
          <Button variant="ghost" size="sm">This Month</Button>
        </div>
      </div>

      {/* AI Assistant Section - Prominent for Non-Tech Users */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 p-8 rounded-2xl text-white shadow-xl border border-purple-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <Sparkles size={32} className="text-yellow-300" />
            🚀 V4 AI Assistant - Let AI Help Your Business!
            <Sparkles size={32} className="text-yellow-300" />
          </h2>
          <p className="text-purple-100 text-lg">Perfect for non-technical users - Just click and AI does the work!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Button 
            className="h-20 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/blog'}
          >
            <div className="text-center">
              <Edit3 size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">✨ Create Title</div>
              <div className="text-xs opacity-90">AI writes titles</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/blog'}
          >
            <div className="text-center">
              <Brain size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">🧠 Create Summary</div>
              <div className="text-xs opacity-90">AI writes excerpts</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/blog'}
          >
            <div className="text-center">
              <FileText size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">📝 Write Article</div>
              <div className="text-xs opacity-90">AI writes full posts</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/blog'}
          >
            <div className="text-center">
              <Image size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">🖼️ Create Image</div>
              <div className="text-xs opacity-90">AI generates photos</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/blog'}
          >
            <div className="text-center">
              <Upload size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">📷 Upload Image</div>
              <div className="text-xs opacity-90">Add your photos</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={() => window.location.href = '/blog'}
          >
            <div className="text-center">
              <Video size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">🎥 Upload Video</div>
              <div className="text-xs opacity-90">Add your videos</div>
            </div>
          </Button>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-purple-100 text-sm">
            💡 <strong>No technical skills needed!</strong> Just click any button above and AI will help you create amazing content for your auto shop.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="₵12,450" change="+15%" icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Cars Serviced" value="28" change="+8" icon={Car} color="bg-blue-500" />
        <StatCard title="Pending Payments" value="₵890" icon={CreditCard} color="bg-amber-500" />
        <StatCard title="Active Jobs" value={inProgressJobs.length} icon={Activity} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Revenue Trend" className="lg:col-span-2">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="🤖 AI Shop Insights" className="relative">
          <button 
            onClick={fetchInsights}
            className="absolute top-4 right-4 p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            disabled={isRefreshing}
          >
            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          
          <div className="mt-4 space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 leading-tight">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Recent Activity">
          <div className="space-y-4">
            {[...jobs].reverse().slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${job.status === JobStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {job.status === JobStatus.COMPLETED ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{job.customerName}</p>
                    <p className="text-xs text-gray-500">{job.vehicleInfo} • {job.issueDescription}</p>
                  </div>
                </div>
                <Badge variant={job.status === JobStatus.COMPLETED ? 'success' : 'warning'}>{job.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Inventory Alerts">
          <div className="space-y-4">
            {inventory.filter(i => i.stock < i.reorderLevel).map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-500">Current Stock: {item.stock} / Reorder: {item.reorderLevel}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600">Reorder</Button>
              </div>
            ))}
            {inventory.every(i => i.stock >= i.reorderLevel) && (
              <p className="text-center text-gray-400 text-sm py-8">All stock levels look healthy! ✅</p>
            )}
          </div>
        </Card>

        <MobileMoneyTest />
      </div>
    </div>
  );
};

export default DashboardPage;
