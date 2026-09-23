import React, { useState } from 'react';
import { X, UserPlus, Phone, User, FileText, Camera } from 'lucide-react';
import { Contact } from '../types';

interface NewChatModalProps {
  onClose: () => void;
  onCreateContact: (newContact: Contact, initialMessage?: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onCreateContact }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('Hey there! I am using ERROREN CHATS.');
  const [initialMessage, setInitialMessage] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
  ];

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newContact: Contact = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '',
      avatar,
      about: about.trim() || 'Available on ERROREN CHATS',
      isOnline: true,
      lastSeen: 'online',
      unreadCount: 0,
    };

    onCreateContact(newContact, initialMessage.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#202c33] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#00a884] text-white">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-semibold text-base">New Contact / Start Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar selector */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="relative group">
              <img
                src={avatar}
                alt="Selected Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#00a884] shadow"
              />
              <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                <Camera className="w-6 h-6" />
                <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose avatar or upload photo</p>
            <div className="flex items-center gap-2 mt-1">
              {avatarOptions.map((opt, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setAvatar(opt)}
                  className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform ${
                    avatar === opt ? 'border-[#00a884] scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={opt} alt="Choice" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00a884]" /> Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Asad Ullah"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111b21] text-slate-900 dark:text-white outline-none focus:border-[#00a884]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#00a884]" /> Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +92 300 1234567"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111b21] text-slate-900 dark:text-white outline-none focus:border-[#00a884]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#00a884]" /> About / Status
            </label>
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Status message"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111b21] text-slate-900 dark:text-white outline-none focus:border-[#00a884]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              First Message (Optional)
            </label>
            <input
              type="text"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Say hello to start the chat..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111b21] text-slate-900 dark:text-white outline-none focus:border-[#00a884]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#00a884] hover:bg-[#009374] disabled:opacity-50 rounded-lg shadow transition-colors"
            >
              Start Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
