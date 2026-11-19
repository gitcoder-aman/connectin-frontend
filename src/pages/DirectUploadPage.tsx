import React, { useState, useRef } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/common/Button';
import { useToast } from '@/context/ToastContext';
import { UploadCloud, Image, CheckCircle2, AlertCircle, Copy, Info, X } from 'lucide-react';
import { uploaderApi } from '@/api/uploaderApi';
import { postsApi } from '@/api/postsApi';

export const DirectUploadPage: React.FC = () => {
  const { success, error: toastError, info } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toastError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    setSelectedFile(file);
    setUploadedUrl(null);
    setUploadError(null);
    setUploadProgress(0);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadedUrl(null);
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      // First try direct uploader service if configured
      let resultUrl = '';
      try {
        resultUrl = await uploaderApi.uploadDirect(selectedFile, (progress) => {
          setUploadProgress(progress);
        });
      } catch {
        // If standalone direct endpoint is not directly exposed on GKE Ingress,
        // use post-service's internal Feign Cloudinary integration!
        setUploadProgress(50);
        const post = await postsApi.createPost(
          `Media Upload: ${selectedFile.name}`,
          selectedFile
        );
        resultUrl = post.imageUrl || '';
        setUploadProgress(100);
      }

      if (resultUrl && resultUrl.startsWith('http')) {
        setUploadedUrl(resultUrl);
        success('Image successfully uploaded to Cloudinary!');
      } else {
        throw new Error('Upload completed but no Cloudinary URL was returned.');
      }
    } catch (err: any) {
      setUploadError(
        err.message ||
          'Failed to upload file. Cloudinary credentials or uploader-service is currently unavailable.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (uploadedUrl) {
      navigator.clipboard?.writeText(uploadedUrl);
      info('Cloudinary URL copied to clipboard!');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 sm:p-5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-600" />
            Media & File Uploader
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload images and photos directly to ConnectIn's Cloudinary storage via the backend uploader service.
          </p>
        </div>

        {/* Architecture Note */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-slate-900">Uploader Microservice Pipeline</div>
            <p className="leading-relaxed text-slate-600">
              In production GKE, <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">uploader-service</code> connects directly to Cloudinary cloud infrastructure with encrypted secrets. Post media uploaded through the feed automatically passes through this service.
            </p>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
            >
              <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Image className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Choose a file or drag & drop here
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Supports JPG, PNG, GIF, WebP (up to 10MB)
              </p>
              <Button size="sm" variant="outline" type="button">
                Browse Files
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Image className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 truncate max-w-xs">
                      {selectedFile?.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                  title="Remove selected file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Preview Box */}
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-50 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-72 w-auto object-contain"
                />
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Uploading to Cloudinary...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>{uploadError}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleReset} disabled={isUploading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpload}
                  isLoading={isUploading}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                >
                  Upload Image
                </Button>
              </div>
            </div>
          )}

          {/* Upload Success Box */}
          {uploadedUrl && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Hosted Cloudinary Asset URL:
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={uploadedUrl}
                  className="flex-1 text-xs font-mono bg-white border border-emerald-300 rounded-lg px-3 py-2 text-slate-800"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  leftIcon={<Copy className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
