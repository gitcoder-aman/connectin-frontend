import React, { useState, useRef } from 'react';
import { Image, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/formatters';

interface CreatePostCardProps {
  onSubmit: (data: { content: string; file?: File | null }) => Promise<unknown>;
  isLoading: boolean;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({ onSubmit, isLoading }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    try {
      await onSubmit({
        content: content.trim(),
        file: selectedFile,
      });
      setContent('');
      handleRemoveImage();
    } catch {
      // Handled by mutation
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 mb-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
          {getInitials(user?.name)}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'professional'}? Share an update...`}
            rows={3}
            className="w-full resize-none border-none p-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 leading-relaxed"
          />

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative mt-2 mb-3 rounded-lg overflow-hidden border border-slate-200 max-h-60 bg-slate-50 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="max-h-60 w-auto object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Footer toolbar */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="post-image-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <Image className="w-4 h-4 text-emerald-600" />
                <span>Media</span>
              </button>

              <span className="text-[11px] text-slate-400 hidden sm:inline-block ml-2">
                <Sparkles className="w-3 h-3 inline text-amber-500 mr-1" />
                Images processed via Cloudinary
              </span>
            </div>

            <Button
              type="submit"
              size="sm"
              isLoading={isLoading}
              disabled={!content.trim() && !selectedFile}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
