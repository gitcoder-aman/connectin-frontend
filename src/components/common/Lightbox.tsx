import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

export interface LightboxProps {
  src: string | null;
  onClose: () => void;
  alt?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({ src, onClose, alt = 'Enlarged photo' }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && src) {
        onClose();
      }
    };
    if (src) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Top action buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image container */}
      <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};
