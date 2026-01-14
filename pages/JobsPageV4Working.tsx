import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, Clock, Wrench, Sparkles, Camera } from 'lucide-react';
import { JobStatus, Priority, Job } from '../types';

const JobsPageV4Working: React.FC = () => {
  const { jobs, customers, addJob, updateJobStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | JobStatus>('ALL');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Jobs</h1>
          <p className="text-gray-500">Manage ongoing and upcoming repair works.</p>
        </div>
        <button 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-bold shadow-lg"
        >
          <Sparkles size={20} />
          🤖 AI Diagnostic + New Job
        </button>
      </div>

      {/* AI Quick Diagnostic Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 p-8 rounded-2xl text-white shadow-xl border border-blue-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
            <Sparkles size={28} className="text-yellow-300" />
            🔧 AI Car Problem Solver - Perfect for Mechanics!
            <Sparkles size={28} className="text-yellow-300" />
          </h2>
          <p className="text-blue-100 text-lg">Upload photos, describe customer issues, get instant AI diagnosis and solutions!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="h-20 bg-white text-blue-700 hover:bg-gray-100 font-bold shadow-lg border-0 transform hover:scale-105 transition-all rounded-lg">
            <div className="text-center">
              <Camera size={20} className="mx-auto mb-1" />
              <div className="text-sm font-bold">📸 Upload Photo</div>
              <div className="text-xs opacity-70">+ AI Diagnose</div>
            </div>
          </button>
          
          <button className="h-20 bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold shadow-lg border-0 transform hover:scale-105 transition-all rounded-lg">
            <div className="text-center">
              <Sparkles size={20} className="mx-auto mb-1" />
              <div className="text-sm font-bold">📝 Describe Issue</div>
              <div className="text-xs opacity-70">+ AI Help</div>
            </div>
          </button>
          
          <button className="h-20 bg-green-500 text-white hover:bg-green-400 font-bold shadow-lg border-0 transform hover:scale-105 transition-all rounded-lg">
            <div className="text-center">
              <Wrench size={20} className="mx-auto mb-1" />
              <div className="text-sm font-bold">🔧 Get Solution</div>
              <div className="text-xs opacity-90">AI Repair Tips</div>
            </div>
          </button>
          
          <button className="h-20 bg-orange-500 text-white hover:bg-orange-400 font-bold shadow-lg border-0 transform hover:scale-105 transition-all rounded-lg">
            <div className="text-center">
              <Clock size={20} className="mx-auto mb-1" />
              <div className="text-sm font-bold">⏱️ Time Estimate</div>
              <div className="text-xs opacity-90">AI Timing</div>
            </div>
          </button>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-blue-100 text-sm">
            💡 <strong>For every job!</strong> Use AI to diagnose customer problems faster and more accurately. Upload photos of the issue for best results.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">#{job.id}</span>
                <span className={getStatusBadge(job.status)}>{job.status}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{job.customerName}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Wrench size={14} /> {job.vehicleInfo}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-700 italic">"{job.issueDescription}"</p>
              
              {/* AI Diagnostic for this job */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded hover:from-blue-600 hover:to-purple-600">
                    <Sparkles size={12} className="inline mr-1" />
                    🤖 AI Diagnose
                  </button>
                  <button className="px-3 py-2 text-green-600 border border-green-300 hover:bg-green-50 text-xs font-bold rounded">
                    <Camera size={12} className="inline mr-1" />
                    📸 Photo
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm mb-4">
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={16} />
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="font-bold text-blue-600">
                ₵{job.estimatedCost}
              </div>
            </div>

            <div className="flex gap-2">
              {job.status === JobStatus.PENDING && (
                <button 
                  onClick={() => updateJobStatus(job.id, JobStatus.IN_PROGRESS)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                >
                  Start Job
                </button>
              )}
              {job.status === JobStatus.IN_PROGRESS && (
                <button 
                  onClick={() => updateJobStatus(job.id, JobStatus.COMPLETED)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                >
                  Mark Done
                </button>
              )}
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
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
    </div>
  );
};

export default JobsPageV4Working;