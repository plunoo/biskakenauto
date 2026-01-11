import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, Clock, Wrench, X } from 'lucide-react';
import { JobStatus, Priority, Job } from '../types';

const JobsPageFixed: React.FC = () => {
  const { jobs, customers, addJob, updateJobStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | JobStatus>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  const filteredJobs = jobs.filter(j => {
    const matchesTab = activeTab === 'ALL' || j.status === activeTab;
    const matchesSearch = j.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         j.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: JobStatus) => {
    const styles = {
      [JobStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [JobStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800', 
      [JobStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [JobStatus.CANCELLED]: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`;
  };

  const handleCreateJob = () => {
    if (!selectedCustomerId || !issueDescription) return;
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const newJob: Job = {
      id: `J${Math.floor(Math.random() * 1000)}`,
      customerId: customer.id,
      customerName: customer.name,
      vehicleInfo: `${customer.vehicle?.make || 'N/A'} ${customer.vehicle?.model || 'N/A'} (${customer.vehicle?.plateNumber || 'N/A'})`,
      issueDescription,
      status: JobStatus.PENDING,
      priority: Priority.MEDIUM,
      estimatedCost: 0,
      parts: [],
      laborHours: 0,
      laborRate: 50,
      createdAt: new Date().toISOString()
    };
    
    addJob(newJob);
    setIsModalOpen(false);
    setSelectedCustomerId('');
    setIssueDescription('');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Jobs</h1>
          <p className="text-gray-500">Manage ongoing and upcoming repair works.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          New Job Order
        </button>
      </div>

      <div className="flex gap-4 items-center justify-between">
        <div className="flex bg-white p-1 rounded-lg border">
          {(['ALL', JobStatus.PENDING, JobStatus.IN_PROGRESS, JobStatus.COMPLETED] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search jobs..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">#{job.id}</span>
                <span className={getStatusBadge(job.status)}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-lg text-gray-900">{job.customerName}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Wrench size={14} /> {job.vehicleInfo}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-700 italic">"{job.issueDescription}"</p>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={16} />
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="font-bold text-blue-600">
                ₵{job.estimatedCost}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex gap-2">
              {job.status === JobStatus.PENDING && (
                <button 
                  onClick={() => updateJobStatus(job.id, JobStatus.IN_PROGRESS)}
                  className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                >
                  Start Job
                </button>
              )}
              {job.status === JobStatus.IN_PROGRESS && (
                <button 
                  onClick={() => updateJobStatus(job.id, JobStatus.COMPLETED)}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                >
                  Mark Done
                </button>
              )}
              <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                View Detail
              </button>
            </div>
          </div>
        ))}
        
        {filteredJobs.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {/* New Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">New Job Order</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.vehicle?.plateNumber || 'No plate'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-md min-h-[120px] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the vehicle problem in detail..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateJob}
                  disabled={!selectedCustomerId || !issueDescription}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Job Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPageFixed;