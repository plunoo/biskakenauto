import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../components/UI';
import { useStore } from '../store/useStore';
import { apiService } from '../services/apiService';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Monitor, 
  Shield, 
  Users,
  Rss,
  Save,
  Store,
  Phone,
  MapPin,
  Mail,
  Wrench,
  Package,
  FileText,
  BarChart3,
  Brain,
  Sparkles,
  Stethoscope,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user, updateCustomer } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // User form state
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'STAFF' as 'ADMIN' | 'SUB_ADMIN' | 'STAFF',
    permissions: [] as string[]
  });

  // AI Diagnostic state
  const [aiDiagnostic, setAiDiagnostic] = useState<{
    running: boolean;
    results: any[];
    status: 'idle' | 'running' | 'success' | 'error';
  }>({
    running: false,
    results: [],
    status: 'idle'
  });

  // Database status state
  const [databaseStatus, setDatabaseStatus] = useState<any>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });

  // Shop settings state
  const [shopData, setShopData] = useState({
    shopName: 'Biskaken Auto Services',
    address: 'Accra, Ghana',
    phone: '+233 XX XXX XXXX',
    email: 'info@biskaken.com',
    currency: 'GHS',
    timezone: 'GMT+0',
    businessHours: '8:00 AM - 6:00 PM',
    taxRate: '12.5'
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'shop', name: 'Shop Settings', icon: Store },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: Monitor },
    { id: 'security', name: 'Security', icon: Shield },
    ...(user?.role === 'ADMIN' ? [
      { id: 'users', name: 'User Management', icon: Users },
      { id: 'blog', name: 'Blog Management', icon: Rss }
    ] : [])
  ];

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleShopChange = (field: string, value: string) => {
    setShopData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const checkDatabaseStatus = async () => {
    try {
      const status = await apiService.getDatabaseStatus();
      setDatabaseStatus(status);
      console.log('📊 Settings Database status:', status);
    } catch (error) {
      console.log('Settings Database status check failed');
      setDatabaseStatus({ success: false, data: { status: 'disconnected' } });
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const handleSaveChanges = () => {
    // In production, this would call API to save changes
    console.log('Saving changes...', { profileData, shopData });
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <Input
              value={profileData.fullName}
              onChange={(e) => handleProfileChange('fullName', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <Input
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              placeholder="+233 XX XXX XXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <Input
              value={profileData.address}
              onChange={(e) => handleProfileChange('address', e.target.value)}
              placeholder="Enter your address"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Role Information</h3>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Current Role</p>
              <p className="text-lg font-bold text-blue-900">{user?.role}</p>
            </div>
            <Badge variant={
              user?.role === 'ADMIN' ? 'danger' :
              user?.role === 'SUB_ADMIN' ? 'warning' : 'outline'
            }>
              {user?.role?.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Contact your administrator to change your role
          </p>
        </div>
      </div>
    </div>
  );

  const renderShopTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
            <Input
              value={shopData.shopName}
              onChange={(e) => handleShopChange('shopName', e.target.value)}
              placeholder="Enter shop name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
            <Input
              value={shopData.phone}
              onChange={(e) => handleShopChange('phone', e.target.value)}
              placeholder="+233 XX XXX XXXX"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
            <Input
              value={shopData.address}
              onChange={(e) => handleShopChange('address', e.target.value)}
              placeholder="Enter business address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
            <Input
              type="email"
              value={shopData.email}
              onChange={(e) => handleShopChange('email', e.target.value)}
              placeholder="business@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={shopData.currency}
              onChange={(e) => handleShopChange('currency', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="GHS">Ghana Cedi (₵)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={shopData.timezone}
              onChange={(e) => handleShopChange('timezone', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="GMT+0">GMT+0 (Ghana)</option>
              <option value="GMT+1">GMT+1 (West Africa)</option>
              <option value="GMT-5">GMT-5 (Eastern Time)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
            <Input
              value={shopData.businessHours}
              onChange={(e) => handleShopChange('businessHours', e.target.value)}
              placeholder="8:00 AM - 6:00 PM"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <Input
              type="number"
              step="0.1"
              value={shopData.taxRate}
              onChange={(e) => handleShopChange('taxRate', e.target.value)}
              placeholder="12.5"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <Mail size={20} className="text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
          </div>
          <div className="relative inline-flex items-center h-6 w-11 bg-blue-600 rounded-full transition-colors">
            <div className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform translate-x-6"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <Phone size={20} className="text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Sms Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
          </div>
          <div className="relative inline-flex items-center h-6 w-11 bg-gray-300 rounded-full transition-colors">
            <div className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform translate-x-1"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <Package size={20} className="text-orange-600" />
            <div>
              <h3 className="font-medium text-gray-900">Low Stock Alerts</h3>
              <p className="text-sm text-gray-500">Get notified when inventory is low</p>
            </div>
          </div>
          <div className="relative inline-flex items-center h-6 w-11 bg-blue-600 rounded-full transition-colors">
            <div className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform translate-x-6"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <Wrench size={20} className="text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Job Status Updates</h3>
              <p className="text-sm text-gray-500">Updates when job status changes</p>
            </div>
          </div>
          <div className="relative inline-flex items-center h-6 w-11 bg-blue-600 rounded-full transition-colors">
            <div className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform translate-x-6"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <FileText size={20} className="text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Payment Reminders</h3>
              <p className="text-sm text-gray-500">Reminders for overdue payments</p>
            </div>
          </div>
          <div className="relative inline-flex items-center h-6 w-11 bg-blue-600 rounded-full transition-colors">
            <div className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform translate-x-6"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <BarChart3 size={20} className="text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Weekly Reports</h3>
              <p className="text-sm text-gray-500">Weekly business summary reports</p>
            </div>
          </div>
          <div className="relative inline-flex items-center h-6 w-11 bg-gray-300 rounded-full transition-colors">
            <div className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform translate-x-1"></div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Phone size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Customer SMS Notifications</span>
          </div>
          <p className="text-xs text-blue-600 mb-3">
            Automatically notify customers via SMS about job status updates, invoices, and payments. 
            Production SMS API will be integrated during deployment.
          </p>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-3 text-sm text-gray-700">Send job creation confirmations</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-3 text-sm text-gray-700">Send job status updates to customers</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-3 text-sm text-gray-700">Send job completion notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-3 text-sm text-gray-700">Send payment confirmations</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-3 text-sm text-gray-700">Send invoice notifications</span>
            </label>
          </div>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="font-medium text-green-800 mb-2">SMS Templates Preview</h4>
            <div className="text-xs text-green-700 space-y-2">
              <div><strong>Job Created:</strong> "Hello {'{customer}'}, we've received your vehicle ({'{vehicle}'}) for repair. Job ID: {'{jobId}'}. We'll keep you updated. - Biskaken Auto"</div>
              <div><strong>Job Started:</strong> "Hello {'{customer}'}, your vehicle repair has started. Job ID: {'{jobId}'}. We'll update you when it's ready. - Biskaken Auto"</div>
              <div><strong>Job Completed:</strong> "Good news {'{customer}'}! Your vehicle is ready for pickup. Job ID: {'{jobId}'}. Please visit us at your convenience. - Biskaken Auto"</div>
              <div><strong>Invoice Ready:</strong> "Hi {'{customer}'}, your invoice #{'{invoiceId}'} for ₵{'{amount}'} is ready. You can pay via Mobile Money or Cash. - Biskaken Auto"</div>
              <div><strong>Payment Received:</strong> "Thank you {'{customer}'}! Payment of ₵{'{amount}'} received via {'{method}'}. Your receipt has been generated. - Biskaken Auto"</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-200">
            <span className="text-xs text-blue-600">
              💡 Current Status: Development Mode (SMS logs to console)
            </span>
            <div className="text-xs text-blue-500 mt-1">
              📱 SMS API will be integrated when provided in environment variables
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Frequency</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="radio" name="frequency" value="instant" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
            <span className="ml-3 text-sm font-medium text-gray-700">Instant notifications</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="frequency" value="hourly" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
            <span className="ml-3 text-sm font-medium text-gray-700">Hourly digest</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="frequency" value="daily" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
            <span className="ml-3 text-sm font-medium text-gray-700">Daily digest</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Application Version</h3>
            <Monitor size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">v3.0.0</p>
          <p className="text-xs text-gray-500 mt-1">AI-Powered Release with Blog Management</p>
        </div>
        
        <div className={`p-6 border border-gray-200 rounded-lg ${
          databaseStatus?.success && databaseStatus?.data?.status === 'connected'
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Database Status</h3>
            <div className={`w-3 h-3 rounded-full ${
              databaseStatus?.success && databaseStatus?.data?.status === 'connected'
                ? 'bg-green-500 animate-pulse'
                : 'bg-red-500'
            }`}></div>
          </div>
          {databaseStatus ? (
            <>
              <Badge variant={databaseStatus.success && databaseStatus.data.status === 'connected' ? 'success' : 'danger'}>
                {databaseStatus.data.status === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
              <p className="text-xs text-gray-500 mt-2">
                {databaseStatus.data.mode || 'PostgreSQL'} - {databaseStatus.data.responseTime || 'Response time: N/A'}
              </p>
            </>
          ) : (
            <>
              <Badge variant="warning">Checking...</Badge>
              <p className="text-xs text-gray-500 mt-2">Verifying database connection...</p>
            </>
          )}
        </div>
        
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Last Backup</h3>
            <Shield size={20} className="text-purple-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Today, 12:00 AM</p>
          <div className="mt-3">
            <Button variant="outline" size="sm">Create Backup Now</Button>
          </div>
        </div>
        
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Storage Usage</h3>
            <div className="text-orange-600">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700">2.5 GB / 10 GB</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{width: '25%'}}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">25% used</p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Active Users</h3>
            <Users size={20} className="text-indigo-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700">8 Online</p>
          <p className="text-xs text-gray-500 mt-1">12 Total Users</p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">System Uptime</h3>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <p className="text-lg font-semibold text-gray-700">15 days, 4 hours</p>
          <p className="text-xs text-gray-500 mt-1">99.9% uptime</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Maintenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center justify-center space-x-2">
            <Shield size={16} />
            <span>Run Diagnostics</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2">
            <Package size={16} />
            <span>Clear Cache</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2">
            <Monitor size={16} />
            <span>System Logs</span>
          </Button>
        </div>
      </div>
      
      {/* AI Diagnostic Section */}
      <div className="col-span-full mt-8">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                <Brain className="text-purple-600" size={24} />
                🤖 AI System Diagnostic
              </h3>
              <p className="text-purple-600 mt-1">Test all AI features and troubleshoot any problems</p>
            </div>
            <Button
              onClick={runAIDiagnostic}
              disabled={aiDiagnostic.running}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              icon={aiDiagnostic.running ? Stethoscope : Brain}
            >
              {aiDiagnostic.running ? 'Running Tests...' : '🔍 Run AI Diagnostic'}
            </Button>
          </div>
          
          {aiDiagnostic.results.length > 0 && (
            <div className="space-y-3">
              {aiDiagnostic.results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <span className="text-sm">{result.message}</span>
                </div>
              ))}
              
              {aiDiagnostic.status !== 'running' && (
                <div className={`mt-4 p-4 rounded-lg text-center font-bold ${
                  aiDiagnostic.status === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {aiDiagnostic.status === 'success' 
                    ? '✅ All AI systems are working correctly!' 
                    : '❌ Some AI features need attention. Check the issues above.'}
                </div>
              )}
            </div>
          )}
          
          {aiDiagnostic.results.length === 0 && !aiDiagnostic.running && (
            <div className="text-center py-6 text-purple-600">
              <Sparkles size={48} className="mx-auto mb-3 opacity-60" />
              <p>Click "Run AI Diagnostic" to test all AI features and troubleshoot any problems.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleChangePassword = async () => {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Enter your new password (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    try {
      const result = await apiService.changePassword(currentPassword, newPassword);
      if (result.success) {
        alert('Password changed successfully!');
        console.log('Password changed');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please check your current password.');
    }
  };

  const handleViewLoginHistory = async () => {
    try {
      const result = await apiService.getLoginHistory();
      if (result.success) {
        console.log('Login history:', result.data);
        alert(`Found ${result.data.length} login records. Check console for details.`);
      }
    } catch (error) {
      console.error('Failed to fetch login history:', error);
      alert('Failed to fetch login history');
    }
  };

  const handleManageSessions = async () => {
    try {
      const result = await apiService.getActiveSessions();
      if (result.success) {
        console.log('Active sessions:', result.data);
        alert(`Found ${result.data.length} active sessions. Check console for details.`);
      }
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
      alert('Failed to fetch active sessions');
    }
  };

  const handleEnable2FA = async () => {
    if (confirm('Do you want to enable Two-Factor Authentication?')) {
      try {
        const result = await apiService.enable2FA();
        if (result.success) {
          console.log('2FA setup:', result.data);
          alert('2FA setup initiated! Check console for QR code and backup codes.');
        }
      } catch (error) {
        console.error('Failed to enable 2FA:', error);
        alert('Failed to enable 2FA');
      }
    }
  };

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
      
      <div className="space-y-6">
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Shield size={24} className="text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Change Password</h3>
                <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                <p className="text-xs text-gray-400 mt-1">Last changed: 2 weeks ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangePassword}>Change Password</Button>
          </div>
        </div>
        
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Phone size={24} className="text-orange-600" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                <Badge variant="warning" className="mt-2">Not Enabled</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleEnable2FA}>Enable 2FA</Button>
          </div>
        </div>
        
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Monitor size={24} className="text-green-600" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Login History</h3>
                <p className="text-sm text-gray-500">View recent login activity and device management</p>
                <p className="text-xs text-gray-400 mt-1">Last login: Today, 9:15 AM from Chrome/Desktop</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewLoginHistory}>View History</Button>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Users size={24} className="text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Active Sessions</h3>
                <p className="text-sm text-gray-500">Manage your active login sessions</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">2 active sessions</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleManageSessions}>Manage Sessions</Button>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={24} className="text-red-600" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Security Alerts</h3>
                <p className="text-sm text-gray-500">Get notified of suspicious account activity</p>
                <div className="flex items-center space-x-2 mt-2">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="text-xs text-gray-600">Email alerts enabled</span>
                </div>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Shield size={16} className="text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Enable Two-Factor Authentication</p>
              <p className="text-xs text-yellow-600">Secure your account with an additional verification step</p>
            </div>
            <Button variant="outline" size="sm" className="ml-4" onClick={handleEnable2FA}>Enable Now</Button>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Strong Password Active</p>
              <p className="text-xs text-green-600">Your current password meets security requirements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleUserManagementClick = () => {
    window.location.href = '#/admin';
  };

  const handleBlogManagementClick = () => {
    window.location.href = '#/admin';
  };

  // AI Diagnostic function
  const runAIDiagnostic = async () => {
    setAiDiagnostic(prev => ({ ...prev, running: true, status: 'running', results: [] }));
    
    const tests = [
      {
        name: 'Gemini API Connection',
        test: async () => {
          try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) return { success: false, message: 'No Gemini API key found in environment' };
            
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: 'Test connection' }] }],
                  generationConfig: { maxOutputTokens: 10 }
                })
              }
            );
            
            if (response.ok) {
              return { success: true, message: 'Gemini API connection successful' };
            } else {
              return { success: false, message: `API returned status: ${response.status}` };
            }
          } catch (error) {
            return { success: false, message: `Connection failed: ${error.message}` };
          }
        }
      },
      {
        name: 'Backend API Status',
        test: async () => {
          try {
            const response = await apiService.testBlogAPI();
            return response.success 
              ? { success: true, message: 'Backend API is responding correctly' }
              : { success: false, message: `API test failed: ${response.error}` };
          } catch (error) {
            return { success: false, message: `Backend connection failed: ${error.message}` };
          }
        }
      },
      {
        name: 'Blog Form Components',
        test: async () => {
          try {
            // Test if blog management page exists
            const blogExists = document.querySelector('[href="/blog"]') !== null;
            if (!blogExists) {
              return { success: false, message: 'Blog management navigation not found' };
            }
            
            return { success: true, message: 'Blog management components are available' };
          } catch (error) {
            return { success: false, message: `Component check failed: ${error.message}` };
          }
        }
      },
      {
        name: 'Local Storage & Auth',
        test: async () => {
          try {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            if (!token) {
              return { success: false, message: 'No authentication token found' };
            }
            
            const user = localStorage.getItem('user');
            if (!user) {
              return { success: false, message: 'No user data found in local storage' };
            }
            
            return { success: true, message: 'Authentication state is valid' };
          } catch (error) {
            return { success: false, message: `Auth check failed: ${error.message}` };
          }
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({ ...test, ...result });
      } catch (error) {
        results.push({ 
          ...test, 
          success: false, 
          message: `Test execution failed: ${error.message}` 
        });
      }
      
      // Update results in real-time
      setAiDiagnostic(prev => ({ ...prev, results: [...results] }));
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const allPassed = results.every(r => r.success);
    setAiDiagnostic(prev => ({ 
      ...prev, 
      running: false, 
      status: allPassed ? 'success' : 'error',
      results 
    }));
  };

  const sampleUsers = [
    {
      id: '1',
      name: 'Kwame Asante',
      email: 'kwame@biskaken.com',
      role: 'ADMIN',
      status: 'Active',
      lastLogin: 'Today, 9:15 AM',
      joinDate: 'January 15, 2024',
      avatar: 'KA'
    },
    {
      id: '2',
      name: 'Akosua Mensah',
      email: 'akosua@biskaken.com',
      role: 'SUB_ADMIN',
      status: 'Active',
      lastLogin: '2 hours ago',
      joinDate: 'February 3, 2024',
      avatar: 'AM'
    },
    {
      id: '3',
      name: 'Kofi Osei',
      email: 'kofi@biskaken.com',
      role: 'STAFF',
      status: 'Active',
      lastLogin: 'Yesterday, 6:30 PM',
      joinDate: 'March 12, 2024',
      avatar: 'KO'
    },
    {
      id: '4',
      name: 'Ama Darko',
      email: 'ama@biskaken.com',
      role: 'STAFF',
      status: 'Inactive',
      lastLogin: '5 days ago',
      joinDate: 'April 20, 2024',
      avatar: 'AD'
    },
    {
      id: '5',
      name: 'Yaw Boateng',
      email: 'yaw@biskaken.com',
      role: 'STAFF',
      status: 'Active',
      lastLogin: '1 hour ago',
      joinDate: 'May 8, 2024',
      avatar: 'YB'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'SUB_ADMIN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'STAFF': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  const handleCreateUser = () => {
    setUserFormData({
      name: '',
      email: '',
      role: 'STAFF',
      permissions: ['dashboard', 'customers', 'jobs']
    });
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleSubmitUser = async () => {
    if (!userFormData.name || !userFormData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setModalLoading(true);
    try {
      const result = await apiService.createUser(userFormData);
      console.log('API Response:', result);
      
      if (result.success) {
        alert('User created successfully!');
        setShowUserModal(false);
        // In a real app, you'd refresh the user list here
      } else {
        alert(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Network error: Failed to create user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditUser = (userToEdit: any) => {
    setUserFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      permissions: userToEdit.permissions || []
    });
    setSelectedUser(userToEdit);
    setShowEditModal(true);
  };

  const handleSubmitEditUser = async () => {
    if (!userFormData.name || !userFormData.email || !selectedUser) {
      alert('Please fill in all required fields');
      return;
    }

    setModalLoading(true);
    try {
      const result = await apiService.updateUser(selectedUser.id, userFormData);
      console.log('API Response:', result);
      
      if (result.success) {
        alert('User updated successfully!');
        setShowEditModal(false);
        // In a real app, you'd refresh the user list here
      } else {
        alert(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Network error: Failed to update user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (confirm('Are you sure you want to reset this user\'s password?')) {
      try {
        const result = await apiService.resetUserPassword(userId);
        if (result.success) {
          alert(`Password reset successfully! Temporary password: ${result.data.newPassword}`);
          console.log('Password reset:', result.data);
        }
      } catch (error) {
        console.error('Failed to reset password:', error);
        alert('Failed to reset password');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'suspend';
    
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        const result = await apiService.updateUserStatus(userId, newStatus);
        console.log('API Response:', result);
        
        if (result.success) {
          alert(`User ${action}d successfully!`);
          // In a real app, you'd update the user list here
        } else {
          alert(result.error || `Failed to ${action} user`);
        }
      } catch (error) {
        console.error(`Failed to ${action} user:`, error);
        alert(`Network error: Failed to ${action} user`);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const result = await apiService.deleteUser(userId);
        if (result.success) {
          alert('User deleted successfully!');
          console.log('Deleted user:', userId);
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const renderUserManagementTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <Button 
          onClick={handleCreateUser}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
        >
          <span className="text-lg">+</span>
          <span>New User</span>
        </Button>
      </div>

      <div className="space-y-4">
        {sampleUsers.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {user.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Last login: {user.lastLogin}</span>
                    <span>•</span>
                    <span>Joined: {user.joinDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditUser(user)}
                  className="flex items-center space-x-1"
                >
                  <span>✏️</span>
                  <span>Edit</span>
                </Button>
                {user.role !== 'ADMIN' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleResetPassword(user.id)}
                    className="flex items-center space-x-1"
                  >
                    <span>🔄</span>
                    <span>Reset Password</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleUserStatus(user.id, user.status)}
                  className={`flex items-center space-x-1 ${
                    user.status === 'Active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  <span>{user.status === 'Active' ? '⏸️' : '✅'}</span>
                  <span>{user.status === 'Active' ? 'Suspend' : 'Activate'}</span>
                </Button>
                {user.role !== 'ADMIN' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:bg-red-50 flex items-center space-x-1"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{sampleUsers.length}</div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{sampleUsers.filter(u => u.status === 'Active').length}</div>
            <div className="text-sm text-green-700">Active Users</div>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{sampleUsers.filter(u => u.role === 'ADMIN').length}</div>
            <div className="text-sm text-red-700">Administrators</div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-purple-700">Online Now</div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Roles & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <h4 className="font-medium text-gray-900">Administrator</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Full system access</li>
              <li>• User management</li>
              <li>• Blog management</li>
              <li>• System settings</li>
            </ul>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <h4 className="font-medium text-gray-900">Sub Administrator</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Inventory management</li>
              <li>• Reports access</li>
              <li>• Customer management</li>
              <li>• Job management</li>
            </ul>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <h4 className="font-medium text-gray-900">Staff</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Dashboard access</li>
              <li>• Customer management</li>
              <li>• Job management</li>
              <li>• Invoice creation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const sampleBlogPosts = [
    {
      id: '1',
      title: 'How AI is Changing Auto Repair in Ghana\'s Local Workshops',
      excerpt: 'Discover how AI technology is transforming traditional auto repair shops across Ghana.',
      author: 'Kwame Asante',
      date: 'May 22, 2024',
      category: 'Technology',
      readTime: '4 min read',
      status: 'Published'
    },
    {
      id: '2',
      title: 'Top 5 Brake Maintenance Tips for Ghana\'s Pothole-Heavy Roads',
      excerpt: 'Essential brake care tips tailored for Ghana\'s unique road conditions.',
      author: 'Akosua Mensah',
      date: 'May 18, 2024',
      category: 'Maintenance',
      readTime: '3 min read',
      status: 'Published'
    },
    {
      id: '3',
      title: 'Mobile Money vs. Cash: Why Digital Tracking Wins Every Time',
      excerpt: 'Compare digital payment tracking with traditional cash methods in auto repair businesses.',
      author: 'Kofi Osei',
      date: 'May 12, 2024',
      category: 'Business',
      readTime: '5 min read',
      status: 'Published'
    },
    {
      id: '4',
      title: 'Understanding Your Car\'s AC System in Tropical Weather',
      excerpt: 'Complete guide to maintaining air conditioning systems in Ghana\'s hot climate.',
      author: 'Ama Darko',
      date: 'May 8, 2024',
      category: 'Technical',
      readTime: '6 min read',
      status: 'Draft'
    }
  ];

  const handleCreateBlogPost = async () => {
    try {
      const newPost = {
        title: 'New Blog Post',
        excerpt: 'Enter your blog excerpt here...',
        content: 'Enter your blog content here...',
        category: 'General'
      };
      
      const result = await apiService.createBlogPost(newPost);
      if (result.success) {
        alert('Blog post created successfully!');
        console.log('Created post:', result.data);
      }
    } catch (error) {
      console.error('Failed to create blog post:', error);
      alert('Failed to create blog post');
    }
  };

  const handleTogglePostStatus = async (postId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Published' ? 'draft' : 'published';
      const result = await apiService.updateBlogPostStatus(postId, newStatus);
      
      if (result.success) {
        alert(`Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
        console.log('Status updated:', result.data);
      }
    } catch (error) {
      console.error('Failed to update post status:', error);
      alert('Failed to update post status');
    }
  };

  const handleDeleteBlogPost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        const result = await apiService.deleteBlogPost(postId);
        if (result.success) {
          alert('Blog post deleted successfully!');
          console.log('Deleted post:', postId);
        }
      } catch (error) {
        console.error('Failed to delete blog post:', error);
        alert('Failed to delete blog post');
      }
    }
  };

  const renderBlogManagementTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Blog Management</h2>
        <Button 
          onClick={handleCreateBlogPost}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
        >
          <span className="text-lg">+</span>
          <span>New Blog Post</span>
        </Button>
      </div>

      <div className="space-y-4">
        {sampleBlogPosts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                  <Badge variant={post.status === 'Published' ? 'success' : 'outline'}>
                    {post.status}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-3 leading-relaxed">{post.excerpt}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {post.author}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{post.category}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleTogglePostStatus(post.id, post.status)}
                  className="flex items-center space-x-1"
                >
                  <span>📝</span>
                  <span>{post.status === 'Published' ? 'Unpublish' : 'Publish'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteBlogPost(post.id)}
                  className="text-red-600 hover:bg-red-50 flex items-center space-x-1"
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{sampleBlogPosts.length}</div>
            <div className="text-sm text-blue-700">Total Posts</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{sampleBlogPosts.filter(p => p.status === 'Published').length}</div>
            <div className="text-sm text-green-700">Published</div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{sampleBlogPosts.filter(p => p.status === 'Draft').length}</div>
            <div className="text-sm text-orange-700">Drafts</div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">1.2K</div>
            <div className="text-sm text-purple-700">Views This Month</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'shop': return renderShopTab();
      case 'notifications': return renderNotificationsTab();
      case 'system': return renderSystemTab();
      case 'security': return renderSecurityTab();
      case 'users': return renderUserManagementTab();
      case 'blog': return renderBlogManagementTab();
      default: return renderProfileTab();
    }
  };

  const renderUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New User</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <Input
              value={userFormData.name}
              onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <Input
              type="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={userFormData.role}
              onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="STAFF">Staff</option>
              <option value="SUB_ADMIN">Sub Admin</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowUserModal(false)}
            disabled={modalLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitUser}
            disabled={modalLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {modalLoading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <Input
              value={userFormData.name}
              onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <Input
              type="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={userFormData.role}
              onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="STAFF">Staff</option>
              <option value="SUB_ADMIN">Sub Admin</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowEditModal(false)}
            disabled={modalLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitEditUser}
            disabled={modalLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {modalLoading ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showUserModal && renderUserModal()}
      {showEditModal && renderEditModal()}
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your account and application preferences</p>
        </div>
        
        <nav className="px-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} className="mr-3" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
            </div>
            
            {hasChanges && (
              <Button 
                onClick={handleSaveChanges}
                className="bg-blue-600 hover:bg-blue-700"
                icon={Save}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;