import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from './UI';
import { apiService } from '../services/apiService';
import { Upload, ImageIcon, CheckCircle, XCircle, Loader, Trash2 } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?auto=format&fit=crop&q=80&w=1200';

const LandingHeroUpload: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiService.getLandingSettings().then(res => {
      if (res.success && res.data?.heroImageUrl) setCurrentUrl(res.data.heroImageUrl);
    });
  }, []);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const res = await apiService.uploadHeroImage(file);
      if (res.success) {
        setCurrentUrl(res.data.imageUrl);
        setPreview(null);
        setFile(null);
        setStatus({ type: 'success', msg: 'Hero image updated on the landing page.' });
      } else {
        setStatus({ type: 'error', msg: res.error || 'Upload failed' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Backend unreachable — start the API server.' });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || currentUrl || FALLBACK;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Landing Page — Hero Image</h2>
        <p className="text-sm text-gray-500 mt-1">
          This image fills the large card on the public landing page. Upload a high-quality photo (recommended: 1200×800px).
        </p>
      </div>

      {status && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm border ${
          status.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {status.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          {status.msg}
        </div>
      )}

      {/* Current / preview */}
      <Card className="p-0 overflow-hidden">
        <div className="relative bg-gray-50 flex items-center justify-center min-h-[260px]">
          <img
            src={displayUrl}
            alt="Hero preview"
            className="w-full h-[300px] object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
          />
          {preview && (
            <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Preview — not saved yet
            </span>
          )}
        </div>
      </Card>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
      >
        <ImageIcon className="w-10 h-10 text-gray-300" />
        <div className="text-center">
          <p className="font-medium text-gray-700">Drop an image here or <span className="text-blue-600">browse</span></p>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP — max 10 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {file && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700 truncate">
            <Upload className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">{file.name}</span>
            <span className="text-gray-400 shrink-0">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFile(null); setPreview(null); }}
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <Loader className="w-4 h-4 animate-spin mr-1.5" /> : <Upload className="w-4 h-4 mr-1.5" />}
              {uploading ? 'Uploading…' : 'Save & publish'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingHeroUpload;
