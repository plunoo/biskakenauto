
import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '../components/UI';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Wrench, 
  Sparkles,
  MoreVertical,
  CheckCircle,
  Mic,
  ArrowRight
} from 'lucide-react';
import { JobStatus, Priority, Job, AIDiagnosis } from '../types';
// import { getAIDiagnosis } from '../services/gemini';

const StatusBadge = ({ status }: { status: JobStatus }) => {
  const config = {
    [JobStatus.PENDING]: { variant: 'warning' as const, label: 'Pending' },
    [JobStatus.IN_PROGRESS]: { variant: 'info' as const, label: 'In Progress' },
    [JobStatus.COMPLETED]: { variant: 'success' as const, label: 'Completed' },
    [JobStatus.CANCELLED]: { variant: 'danger' as const, label: 'Cancelled' },
  };
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};

const JobsPage: React.FC = () => {
  const { jobs, customers, addJob, updateJobStatus } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | JobStatus>('ALL');
  
  // Form State
  const [complaint, setComplaint] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosis | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const filteredJobs = jobs.filter(j => {
    const matchesTab = activeTab === 'ALL' || j.status === activeTab;
    const matchesSearch = j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         j.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleDiagnose = async () => {
    if (!complaint) return;
    setIsDiagnosing(true);
    try {
      const result = await getAIDiagnosis(complaint);
      setDiagnosis(result);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCreateJob = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const newJob: Job = {
      id: `J${Math.floor(Math.random() * 1000)}`,
      customerId: customer.id,
      customerName: customer.name,
      vehicleInfo: `${customer.vehicle.make} ${customer.vehicle.model} (${customer.vehicle.plateNumber})`,
      issueDescription: complaint,
      status: JobStatus.PENDING,
      priority: Priority.MEDIUM,
      estimatedCost: diagnosis ? parseInt(diagnosis.estimatedCostRange.split('-')[0].replace(/\D/g, '')) : 0,
      parts: [],
      laborHours: 0,
      laborRate: 50,
      createdAt: new Date().toISOString()
    };
    
    addJob(newJob);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setComplaint('');
    setDiagnosis(null);
    setSelectedCustomerId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Jobs</h1>
          <p className="text-gray-500">Manage ongoing and upcoming repair works.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>New Job Order</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1 rounded-lg border w-full md:w-auto">
          {(['ALL', JobStatus.PENDING, JobStatus.IN_PROGRESS, JobStatus.COMPLETED] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 md:flex-none ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search jobs..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <Card key={job.id} className="relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">#{job.id}</span>
                <StatusBadge status={job.status} />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{job.customerName}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Wrench size={14} /> {job.vehicleInfo}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-700 italic line-clamp-2">"{job.issueDescription}"</p>
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
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => updateJobStatus(job.id, JobStatus.IN_PROGRESS)}>Start Job</Button>
              )}
              {job.status === JobStatus.IN_PROGRESS && (
                <Button variant="primary" size="sm" className="flex-1" onClick={() => updateJobStatus(job.id, JobStatus.COMPLETED)}>Mark Done</Button>
              )}
              <Button variant="ghost" size="sm" className="flex-1">View Detail</Button>
            </div>
          </Card>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Job Order" size="md">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Customer</label>
            <select 
              className="w-full p-2 border rounded-md" 
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.vehicle.plateNumber}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
              Issue Description
              <span className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline text-xs">
                <Mic size={14} /> Voice Input
              </span>
            </label>
            <textarea 
              className="w-full p-3 border rounded-md min-h-[100px] text-sm"
              placeholder="Describe the vehicle problem..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
          </div>

          {!diagnosis && (
            <Button 
              variant="secondary" 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              icon={Sparkles}
              loading={isDiagnosing}
              onClick={handleDiagnose}
              disabled={!complaint}
            >
              Get AI Diagnosis
            </Button>
          )}

          {diagnosis && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                  <Sparkles size={18} /> AI Analysis Results
                </h4>
                <Badge variant="success">Confidence: {Math.round(diagnosis.confidence * 100)}%</Badge>
              </div>
              <p className="text-sm text-indigo-800 leading-relaxed">{diagnosis.diagnosis}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Estimated Cost</p>
                  <p className="text-sm font-bold text-indigo-900">₵{diagnosis.estimatedCostRange}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Suggested Time</p>
                  <p className="text-sm font-bold text-indigo-900">{diagnosis.repairTime}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1">Required Parts</p>
                <div className="flex flex-wrap gap-2">
                  {diagnosis.suggestedParts.map((p, i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded text-xs text-indigo-700 border border-indigo-200">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-indigo-600" onClick={() => setDiagnosis(null)}>
                Redo Analysis
              </Button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreateJob} disabled={!selectedCustomerId || !complaint}>
              Save Job Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobsPage;
