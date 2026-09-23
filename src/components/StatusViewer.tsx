import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Plus, Camera, Type } from 'lucide-react';
import { StatusItem, UserProfile } from '../types';

interface StatusViewerProps {
  statuses: StatusItem[];
  userProfile: UserProfile;
  activeStatusId: string | null;
  onClose: () => void;
  onReply: (contactId: string, replyText: string) => void;
  onAddStatus: (newStatus: Omit<StatusItem, 'id'>) => void;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  statuses,
  userProfile,
  activeStatusId,
  onClose,
  onReply,
  onAddStatus,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = statuses.findIndex((s) => s.id === activeStatusId);
    return idx >= 0 ? idx : 0;
  });
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Status creator state
  const [statusType, setStatusType] = useState<'text' | 'image'>('text');
  const [newText, setNewText] = useState('');
  const [newBgColor, setNewBgColor] = useState('#00a884');
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  const currentStatus = statuses[currentIndex];

  // Story progression timer (5 seconds per status)
  useEffect(() => {
    if (!currentStatus || isPaused || showAddModal) return;

    const interval = 50; // ms
    const step = (interval / 5000) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next status
          if (currentIndex < statuses.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            // End of stories
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, showAddModal, statuses.length, currentStatus, onClose]);

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStatus) return;
    onReply(currentStatus.contactId, `Replied to status: "${replyText}"`);
    setReplyText('');
    onClose();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewImagePreview(reader.result as string);
        setStatusType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStatus = () => {
    if (statusType === 'text' && !newText.trim()) return;
    if (statusType === 'image' && !newImagePreview) return;

    onAddStatus({
      contactId: 'me',
      contactName: userProfile.name,
      contactAvatar: userProfile.avatar,
      text: newText.trim(),
      mediaUrl: statusType === 'image' ? newImagePreview || undefined : undefined,
      bgColor: statusType === 'text' ? newBgColor : undefined,
      timestamp: 'Just now',
      isViewed: true,
    });

    setShowAddModal(false);
    setNewText('');
    setNewImagePreview(null);
  };

  // Color palette for text statuses
  const bgColors = ['#00a884', '#075e54', '#128c7e', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#64748b'];

  if (showAddModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 text-white">
        <div className="w-full max-w-md bg-[#202c33] rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <h3 className="font-semibold text-lg">Add to ERROREN Status</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setStatusType('text')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-colors ${
                statusType === 'text' ? 'bg-[#00a884] text-white border-transparent' : 'border-white/20 text-slate-300'
              }`}
            >
              <Type className="w-4 h-4" /> Text Status
            </button>
            <label
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                statusType === 'image' ? 'bg-[#00a884] text-white border-transparent' : 'border-white/20 text-slate-300'
              }`}
            >
              <Camera className="w-4 h-4" /> Photo Status
              <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
            </label>
          </div>

          {statusType === 'text' ? (
            <div className="flex flex-col gap-3">
              <div
                style={{ backgroundColor: newBgColor }}
                className="w-full h-44 rounded-xl flex items-center justify-center p-4 transition-colors shadow-inner"
              >
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Type a status..."
                  rows={4}
                  className="w-full bg-transparent text-white text-center text-lg font-medium placeholder-white/60 outline-none resize-none"
                  autoFocus
                />
              </div>

              {/* Color swatches */}
              <div className="flex items-center justify-center gap-2 py-2">
                {bgColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewBgColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      newBgColor === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="w-full h-44 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                {newImagePreview ? (
                  <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-sm text-slate-400">Click &quot;Photo Status&quot; to choose an image</p>
                )}
              </div>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Add a caption..."
                className="w-full bg-[#111b21] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-[#00a884]"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-white/10">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateStatus}
              className="px-5 py-2 text-sm font-medium bg-[#00a884] hover:bg-[#009374] text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Share to Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none text-white">
      {/* Container simulating phone/story view */}
      <div
        className="relative w-full max-w-md h-[95vh] rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl bg-black"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 pt-4 flex gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
          {statuses.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Bar with Contact Info & Controls */}
        <div className="relative z-30 flex items-center justify-between px-4 pt-8 pb-3 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <img
              src={currentStatus.contactAvatar}
              alt={currentStatus.contactName}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
            <div>
              <p className="font-semibold text-sm leading-tight">{currentStatus.contactName}</p>
              <p className="text-xs text-white/70">{currentStatus.timestamp}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1 text-xs bg-white/10"
              title="Add status"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Story Body */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Navigation Tap Zones */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer flex items-center justify-start pl-2 opacity-0 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-white/60 drop-shadow" />
          </div>
          <div
            onClick={handleNext}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer flex items-center justify-end pr-2 opacity-0 hover:opacity-80 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white/60 drop-shadow" />
          </div>

          {currentStatus.mediaUrl ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src={currentStatus.mediaUrl}
                alt="Status content"
                className="w-full h-full object-contain"
              />
              {currentStatus.text && (
                <div className="absolute bottom-20 inset-x-0 p-4 text-center bg-black/50 backdrop-blur-sm">
                  <p className="text-base font-medium">{currentStatus.text}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{ backgroundColor: currentStatus.bgColor || '#128c7e' }}
              className="w-full h-full flex items-center justify-center p-8 text-center"
            >
              <p className="text-2xl font-bold leading-relaxed">{currentStatus.text}</p>
            </div>
          )}
        </div>

        {/* Reply Footer */}
        {currentStatus.contactId !== 'me' ? (
          <form
            onSubmit={handleSendReply}
            className="relative z-30 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center gap-2"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to status..."
              className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2.5 bg-[#00a884] hover:bg-[#009374] disabled:opacity-50 text-white rounded-full transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="relative z-30 p-4 text-center text-xs text-white/70 bg-black/40">
            Your status update · Visible to your contacts
          </div>
        )}
      </div>
    </div>
  );
};
