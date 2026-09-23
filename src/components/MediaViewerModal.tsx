import React from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface MediaViewerModalProps {
  imageUrl: string;
  senderName: string;
  timestamp?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  imageUrl,
  senderName,
  timestamp,
  onClose,
}) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `erroren_media_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/10">
        <div>
          <h4 className="font-semibold text-sm">{senderName}</h4>
          {timestamp && <p className="text-xs text-slate-400">{timestamp}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            title="Download"
            className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Shared from ERROREN CHATS', url: imageUrl }).catch(() => {});
              }
            }}
            title="Share"
            className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <img
          src={imageUrl}
          alt="Media Fullscreen"
          className="max-h-[85vh] max-w-full object-contain rounded-md shadow-2xl"
        />
      </div>
    </div>
  );
};
