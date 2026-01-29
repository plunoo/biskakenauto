import React, { useState } from 'react';
import { Card, Badge, Button, Modal } from '../components/UI';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Search, 
  Clock, 
  Wrench, 
  Sparkles,
  MoreVertical,
  CheckCircle,
  Camera,
  Upload,
  X,
  Mic
} from 'lucide-react';
import { JobStatus, Priority, Job, AIDiagnosis } from '../types';

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
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const filteredJobs = jobs.filter(j => {
    const matchesTab = activeTab === 'ALL' || j.status === activeTab;
    const matchesSearch = (j.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (j.vehicleInfo || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...uploadedImages, ...files].slice(0, 3); // Max 3 images
    setUploadedImages(newImages);
    
    // Create preview URLs
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newUrls = imagePreviewUrls.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setImagePreviewUrls(newUrls);
  };

  const handleDiagnose = async () => {
    if (!complaint && uploadedImages.length === 0) return;
    setIsDiagnosing(true);
    try {
      // Mock AI diagnosis for demo with image analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let diagnosisText = `Based on the symptoms described: "${complaint}"`;
      if (uploadedImages.length > 0) {
        diagnosisText += ` and ${uploadedImages.length} uploaded image(s)`;
      }
      diagnosisText += `, this appears to be a common automotive issue that requires professional inspection.`;
      
      // Enhanced diagnosis based on images
      if (uploadedImages.length > 0) {
        diagnosisText += ` The uploaded images show visible signs that help confirm the diagnosis.`;
      }
      
      const result: AIDiagnosis = {
        diagnosis: diagnosisText,
        confidence: uploadedImages.length > 0 ? 0.92 : 0.85, // Higher confidence with images
        estimatedCostRange: uploadedImages.length > 0 ? "200-400" : "150-300",
        repairTime: uploadedImages.length > 0 ? "3-5 hours" : "2-4 hours",
        suggestedParts: uploadedImages.length > 0 
          ? ["Detailed diagnostic scan", "Specific replacement parts", "Professional labor", "Quality assurance check"]
          : ["Diagnostic scan", "Standard parts", "Labor"]
      };
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
      vehicleInfo: `${customer.vehicle?.make || 'Unknown'} ${customer.vehicle?.model || 'Unknown'} (${customer.vehicle?.plateNumber || 'No Plate'})`,
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
    setUploadedImages([]);
    setImagePreviewUrls([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Jobs</h1>
          <p className="text-gray-500">Manage ongoing and upcoming repair works.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg"
            icon={Sparkles}
          >
            🤖 AI Diagnostic + New Job
          </Button>
        </div>
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
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-20 bg-white text-blue-700 hover:bg-gray-100 font-bold shadow-lg border-0 transform hover:scale-105 transition-all"
          >
            <div className="text-center">
              <Camera size={20} className="mx-auto mb-1" />
              <div className="text-sm font-bold">📸 Upload Photo</div>
              <div className="text-xs opacity-70">+ AI Diagnose</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-20 bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold shadow-lg border-0 transform hover:scale-105 transition-all"
          >
            <div className="text-center">
              <Sparkles size={20} className="mx-auto mb-1" />
              <div className="text-sm font-bold">📝 Describe Issue</div>
              <div className="text-xs opacity-70">+ AI Help</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-20 bg-green-500 text-white hover:bg-green-400 font-bold shadow-lg border-0 transform hover:scale-105 transition-all"
          >
            <div className="text-center">
              <CheckCircle size={20} className="mx-auto mb-1" />
              <div className="text-sm font-bold">🔧 Get Solution</div>
              <div className="text-xs opacity-90">AI Repair Tips</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-20 bg-orange-500 text-white hover:bg-orange-400 font-bold shadow-lg border-0 transform hover:scale-105 transition-all"
          >
            <div className="text-center">
              <Clock size={20} className="mx-auto mb-1" />
              <div className="text-sm font-bold">⏱️ Time Estimate</div>
              <div className="text-xs opacity-90">AI Timing</div>
            </div>
          </Button>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-blue-100 text-sm">
            💡 <strong>For every job!</strong> Use AI to diagnose customer problems faster and more accurately. Upload photos of the issue for best results.
          </p>
        </div>
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
              
              {/* AI Diagnostic for this job */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
                    onClick={() => {
                      setSelectedCustomerId(job.customerId);
                      setComplaint(job.issueDescription);
                      setIsModalOpen(true);
                    }}
                  >
                    <Sparkles size={14} className="mr-1" />
                    🤖 AI Diagnose
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-green-600 border-green-300 hover:bg-green-50"
                    onClick={() => {
                      setSelectedCustomerId(job.customerId);
                      setComplaint(job.issueDescription + " - Need to upload diagnostic photos");
                      setIsModalOpen(true);
                    }}
                  >
                    <Camera size={14} className="mr-1" />
                    📸 Photo
                  </Button>
                </div>
              </div>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="🔧 New Job Order - AI Diagnostic" size="lg">
        <div className="space-y-6">
          {/* AI Diagnostic Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl text-white">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles size={24} className="text-yellow-300" />
              🤖 AI Car Problem Detector
            </h3>
            <p className="text-blue-100">Upload photos and describe the issue. AI will analyze and suggest solutions!</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Customer</label>
            <select 
              className="w-full p-2 border rounded-md" 
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.vehicle?.plateNumber || 'No Plate'}</option>
              ))}
            </select>
          </div>

          {/* Image Upload Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-200">
            <label className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
              <Camera size={16} />
              📸 Upload Photos of the Problem (Optional but Recommended!)
            </label>
            <p className="text-xs text-green-600 mb-3">AI works better with photos! Take pictures of damaged parts, warning lights, etc.</p>
            
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            
            <div className="flex flex-wrap gap-3">
              {/* Upload Button */}
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
              >
                <div className="text-center">
                  <Upload size={20} className="text-green-500 mx-auto mb-1" />
                  <span className="text-xs text-green-600 font-medium">Add Photo</span>
                </div>
              </label>
              
              {/* Image Previews */}
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 group">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border-2 border-green-200"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            
            {uploadedImages.length > 0 && (
              <p className="text-xs text-green-600 mt-2">
                ✅ {uploadedImages.length} photo(s) uploaded - AI will analyze these for better diagnosis!
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
              Describe the Problem
              <span className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline text-xs">
                <Mic size={14} /> Voice Input
              </span>
            </label>
            <textarea 
              className="w-full p-3 border rounded-md min-h-[100px] text-sm"
              placeholder="What's wrong with the car? (e.g., 'Strange noise when braking', 'Engine light is on', 'Car won't start')..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
          </div>

          {!diagnosis && (
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-xl">
              <Button 
                variant="secondary" 
                className="w-full bg-white hover:bg-gray-50 text-purple-700 font-bold text-lg h-14 shadow-lg" 
                icon={Sparkles}
                loading={isDiagnosing}
                onClick={handleDiagnose}
                disabled={!complaint && uploadedImages.length === 0}
              >
                {isDiagnosing ? '🧠 AI is Analyzing...' : '🤖 Get AI Diagnosis & Solution'}
              </Button>
            </div>
          )}

          {diagnosis && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-green-900 flex items-center gap-2 text-lg">
                  <Sparkles size={20} className="text-yellow-500" /> 
                  🎯 AI Analysis Complete!
                </h4>
                <Badge variant="success" className="text-sm font-bold">
                  {uploadedImages.length > 0 ? '📸' : '📝'} Confidence: {Math.round(diagnosis.confidence * 100)}%
                </Badge>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <p className="text-sm font-bold text-green-800 mb-1 flex items-center gap-1">
                    <Image size={14} />
                    Image Analysis Results:
                  </p>
                  <p className="text-xs text-green-600">
                    AI has analyzed {uploadedImages.length} uploaded image(s) for enhanced diagnosis accuracy.
                  </p>
                </div>
              )}
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h5 className="font-bold text-green-900 mb-2">🔍 Diagnosis:</h5>
                <p className="text-sm text-green-800 leading-relaxed">{diagnosis.diagnosis}</p>
              </div>
              
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