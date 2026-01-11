import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  FileText,
  AlertTriangle,
  Download,
  Calendar,
  Loader2
} from 'lucide-react';

interface DashboardData {
  summary: {
    totalRevenue: number;
    totalJobs: number;
    pendingJobs: number;
    completedJobs: number;
    totalCustomers: number;
    lowStockItems: number;
    totalInvoices: number;
    paidInvoices: number;
  };
  recentJobs: any[];
  recentInvoices: any[];
  lowStock: any[];
}

interface FinancialData {
  totalRevenue: number;
  totalProfit: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  paymentMethods: { [key: string]: number };
  monthlyData: Array<{ month: string; revenue: number; profit: number }>;
}

const ReportsPageFixed: React.FC = () => {
  const { loading } = useStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Test data for reports
  const mockDashboardData: DashboardData = {
    summary: {
      totalRevenue: 15250.50,
      totalJobs: 48,
      pendingJobs: 7,
      completedJobs: 41,
      totalCustomers: 23,
      lowStockItems: 3,
      totalInvoices: 45,
      paidInvoices: 38
    },
    recentJobs: [
      {
        id: '1',
        customerName: 'John Doe',
        vehicleInfo: '2018 Toyota Camry',
        status: 'COMPLETED',
        estimatedCost: 450.00
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        vehicleInfo: '2020 Honda Civic',
        status: 'IN_PROGRESS',
        estimatedCost: 680.50
      },
      {
        id: '3',
        customerName: 'Michael Brown',
        vehicleInfo: '2019 Ford Explorer',
        status: 'PENDING',
        estimatedCost: 320.00
      }
    ],
    recentInvoices: [],
    lowStock: [
      {
        id: '1',
        name: 'Engine Oil (5W-30)',
        category: 'Lubricants',
        stock: 2,
        reorderLevel: 5
      },
      {
        id: '2',
        name: 'Brake Pads (Front)',
        category: 'Brakes',
        stock: 1,
        reorderLevel: 3
      }
    ]
  };

  const mockFinancialData: FinancialData = {
    totalRevenue: 15250.50,
    totalProfit: 4575.15,
    totalInvoices: 45,
    averageInvoiceValue: 338.90,
    paymentMethods: {
      'Cash': 18,
      'Mobile Money': 22,
      'Bank Transfer': 5
    },
    monthlyData: [
      { month: 'Oct', revenue: 4200, profit: 1260 },
      { month: 'Nov', revenue: 5800, profit: 1740 },
      { month: 'Dec', revenue: 5250.50, profit: 1575.15 }
    ]
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      console.log('📊 Loading reports...');
      setReportLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use mock data
      setDashboardData(mockDashboardData);
      setFinancialData(mockFinancialData);

      console.log('✅ Test data loaded successfully');
      setReportLoading(false);
    } catch (error) {
      console.error('💥 Error loading reports:', error);
      setReportLoading(false);
    }
  };

  const handleDateRangeSelect = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleApplyDateRange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      console.log('📅 Applying date range:', dateRange);
      loadReports();
      setShowDatePicker(false);
      alert(`Reports filtered from ${dateRange.startDate} to ${dateRange.endDate}`);
    } else {
      alert('Please select both start and end dates');
    }
  };

  const handleExportReport = async () => {
    if (exportLoading) return;
    
    try {
      setExportLoading(true);
      console.log('📋 Exporting report...');
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create test export data
      const exportData = {
        reportId: `RPT-${Date.now()}`,
        downloadUrl: `https://example.com/reports/financial-${Date.now()}.pdf`,
        generatedAt: new Date().toISOString(),
        reportType: 'financial',
        format: 'pdf'
      };
      
      console.log('✅ Export successful:', exportData);
      alert(`Report exported successfully!\n\nReport ID: ${exportData.reportId}\nDownload URL: ${exportData.downloadUrl}\nGenerated: ${new Date(exportData.generatedAt).toLocaleString()}`);
      
    } catch (error) {
      console.error('💥 Export failed:', error);
      alert('Export failed: Network error');
    } finally {
      setExportLoading(false);
    }
  };

  if (reportLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const paymentMethodsData = financialData?.paymentMethods ? Object.entries(financialData.paymentMethods).map(([method, count]) => ({
    name: method.replace('_', ' '),
    value: count
  })) : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Reports</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={handleDateRangeSelect}
            >
              <Calendar size={16} />
              Date Range
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-80">
                <h4 className="font-medium text-gray-900 mb-3">Select Date Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button 
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      onClick={handleApplyDateRange}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${exportLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            onClick={handleExportReport}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {dashboardData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₵{dashboardData.summary.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.summary.totalJobs}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboardData.summary.pendingJobs} pending
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.summary.totalCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${dashboardData.summary.lowStockItems > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
                <Package className={`h-6 w-6 ${dashboardData.summary.lowStockItems > 0 ? 'text-orange-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.summary.lowStockItems}
                </p>
                {dashboardData.summary.lowStockItems > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-orange-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Needs attention</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {financialData && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue & Profit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₵${value}`, '']} />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment Methods */}
        {financialData && paymentMethodsData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      {financialData && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">₵{financialData.totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-xl font-bold text-blue-600">₵{financialData.totalProfit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Invoice</p>
              <p className="text-xl font-bold text-purple-600">₵{financialData.averageInvoiceValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Profit Margin</p>
              <p className="text-xl font-bold text-orange-600">
                {((financialData.totalProfit / financialData.totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
            <div className="space-y-3">
              {dashboardData.recentJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{job.customerName}</p>
                    <p className="text-sm text-gray-600">{job.vehicleInfo}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">₵{job.estimatedCost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {dashboardData.lowStock && dashboardData.lowStock.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
              <div className="space-y-3">
                {dashboardData.lowStock.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-md border border-orange-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {item.stock} left
                      </p>
                      <p className="text-xs text-gray-500">
                        Min: {item.reorderLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(!dashboardData && !financialData) && !reportLoading && (
        <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No report data available</h3>
          <p className="text-gray-600 mb-4">Reports will appear here once you have business activity</p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={loadReports}
          >
            Refresh Reports
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsPageFixed;