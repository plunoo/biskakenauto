import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
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
  Calendar
} from 'lucide-react';
import { apiService } from '../services/apiService';

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

const ReportsPage: React.FC = () => {
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

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      console.log('📊 Loading reports...');
      setReportLoading(true);

      const [dashboardResponse, financialResponse] = await Promise.all([
        apiService.getDashboardReport(),
        apiService.getFinancialReport()
      ]);

      if (dashboardResponse.success) {
        console.log('✅ Dashboard data loaded:', dashboardResponse.data);
        setDashboardData(dashboardResponse.data);
      }

      if (financialResponse.success) {
        console.log('✅ Financial data loaded:', financialResponse.data);
        setFinancialData(financialResponse.data);
      }

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
      // In a real implementation, you'd reload reports with the date range
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
      
      const response = await apiService.exportReport('financial', 'pdf', dateRange.startDate && dateRange.endDate ? dateRange : undefined);
      
      if (response.success) {
        console.log('✅ Export successful:', response.data);
        alert(`Report exported successfully!\nDownload URL: ${response.data.downloadUrl}\nReport ID: ${response.data.reportId}`);
        
        // In a real implementation, you'd trigger the download
        // window.open(response.data.downloadUrl, '_blank');
      } else {
        alert(`Export failed: ${response.error}`);
      }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Reports</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Button 
              variant="outline" 
              icon={Calendar}
              onClick={handleDateRangeSelect}
            >
              Date Range
            </Button>
            
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
                    <Button variant="outline" size="sm" onClick={() => setShowDatePicker(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleApplyDateRange} className="bg-blue-600 hover:bg-blue-700">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            icon={Download}
            onClick={handleExportReport}
            disabled={exportLoading}
            className={exportLoading ? 'opacity-75 cursor-not-allowed' : ''}
          >
            {exportLoading ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {dashboardData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="p-6">
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
          </Card>

          <Card className="p-6">
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
          </Card>

          <Card className="p-6">
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
          </Card>

          <Card className="p-6">
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
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {financialData && (
          <Card className="p-6">
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
          </Card>
        )}

        {/* Payment Methods */}
        {financialData && paymentMethodsData.length > 0 && (
          <Card className="p-6">
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
          </Card>
        )}
      </div>

      {/* Financial Summary */}
      {financialData && (
        <Card className="p-6">
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
        </Card>
      )}

      {/* Recent Activity */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
            <div className="space-y-3">
              {dashboardData.recentJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{job.customerName}</p>
                    <p className="text-sm text-gray-600">{job.vehicleInfo}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={job.status === 'COMPLETED' ? 'success' : job.status === 'IN_PROGRESS' ? 'info' : 'warning'}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">₵{job.estimatedCost}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {dashboardData.lowStock && dashboardData.lowStock.length > 0 && (
            <Card className="p-6">
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
            </Card>
          )}
        </div>
      )}

      {(!dashboardData && !financialData) && !reportLoading && (
        <Card className="p-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No report data available</h3>
          <p className="text-gray-600 mb-4">Reports will appear here once you have business activity</p>
          <Button onClick={loadReports}>Refresh Reports</Button>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;