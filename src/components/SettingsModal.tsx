import React, { useState } from 'react';
import {
  X,
  User,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  Trash2,
  Palette,
  Check,
  Camera,
  Smartphone,
  Info,
} from 'lucide-react';
import { UserProfile, AppSettings, ChatWallpaperTheme } from '../types';

interface SettingsModalProps {
  userProfile: UserProfile;
  settings: AppSettings;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onUpdateSettings: (updated: AppSettings) => void;
  onClearAllChats: () => void;
  onLockNow: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  userProfile,
  settings,
  onClose,
  onUpdateProfile,
  onUpdateSettings,
  onClearAllChats,
  onLockNow,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'privacy'>('profile');

  // Profile form state
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [about, setAbout] = useState(userProfile.about);
  const [avatar, setAvatar] = useState(userProfile.avatar);

  // Privacy PIN state
  const [pinInput, setPinInput] = useState(settings.pinCode || '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || userProfile.name,
      phone: phone.trim() || userProfile.phone,
      about: about.trim() || userProfile.about,
      avatar,
    });
  };

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

  const wallpapers: { id: ChatWallpaperTheme; name: string; bgClass: string }[] = [
    { id: 'default', name: 'Classic Doodle', bgClass: 'bg-[#efeae2] border-slate-300' },
    { id: 'dark', name: 'Dark OLED', bgClass: 'bg-[#0c1317] border-slate-700' },
    { id: 'mint', name: 'Mint Green', bgClass: 'bg-[#e5f5ea] border-emerald-300' },
    { id: 'teal', name: 'Deep Teal', bgClass: 'bg-[#075e54] border-teal-700' },
    { id: 'midnight', name: 'Midnight Blue', bgClass: 'bg-[#101a20] border-slate-800' },
    { id: 'sunset', name: 'Sunset Warm', bgClass: 'bg-gradient-to-tr from-[#fad0c4] to-[#ffd1ff] border-pink-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
      <div className="w-full max-w-lg bg-white dark:bg-[#202c33] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#00a884] text-white">
          <h3 className="font-semibold text-lg">Settings · ERROREN CHATS</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#111b21] px-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Profile
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'appearance'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" /> Appearance & Wallpaper
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" /> Privacy & Lock
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer mb-2">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#00a884] shadow"
                  />
                  <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6" />
                    <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Click photo to upload new picture</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111b21] text-slate-900 dark:text-white outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111b21] text-slate-900 dark:text-white outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  About
                </label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111b21] text-slate-900 dark:text-white outline-none focus:border-[#00a884]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00a884] hover:bg-[#009374] text-white font-medium text-sm rounded-lg transition-colors shadow"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Dark mode switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#111b21]">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Dark Theme</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between Light and Dark interface</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, darkMode: !settings.darkMode })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.darkMode ? 'bg-[#00a884] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* Chat Sounds switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#111b21]">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-[#00a884]" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Conversation Sound FX</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sent, received, and calling audio</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.soundEnabled ? 'bg-[#00a884] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* Enter key sends message */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#111b21]">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[#00a884]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Enter is Send</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enter key will send your message</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, enterIsSend: !settings.enterIsSend })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.enterIsSend ? 'bg-[#00a884] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* Wallpaper selection */}
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  Chat Wallpaper Theme
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {wallpapers.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => onUpdateSettings({ ...settings, wallpaper: wp.id })}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 flex flex-col justify-end p-2 transition-all ${wp.bgClass} ${
                        settings.wallpaper === wp.id ? 'ring-2 ring-[#00a884] border-transparent scale-105' : ''
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm self-start">
                        {wp.name}
                      </span>
                      {settings.wallpaper === wp.id && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-[#00a884] text-white rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* PIN Code setup */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#111b21] space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#00a884]" />
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">App Lock PIN</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set a 4-digit PIN code to lock ERROREN CHATS when you step away.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN"
                    className="w-36 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#202c33] text-center tracking-widest text-slate-900 dark:text-white outline-none focus:border-[#00a884]"
                  />
                  <button
                    onClick={() => {
                      if (pinInput.length === 4) {
                        onUpdateSettings({ ...settings, pinCode: pinInput });
                      } else if (pinInput.length === 0) {
                        onUpdateSettings({ ...settings, pinCode: '', isLocked: false });
                      }
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-[#00a884] hover:bg-[#009374] text-white rounded-lg transition-colors"
                  >
                    {pinInput.length === 4 ? 'Save PIN' : 'Remove PIN'}
                  </button>
                </div>

                {settings.pinCode && (
                  <div className="pt-2">
                    <button
                      onClick={onLockNow}
                      className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" /> Lock App Now
                    </button>
                  </div>
                )}
              </div>

              {/* End-to-end encryption info */}
              <div className="p-4 rounded-xl border border-[#00a884]/30 bg-[#00a884]/10 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#00a884]">
                  <Info className="w-4 h-4" /> End-to-End Encryption
                </div>
                <p>
                  Messages and calls in ERROREN CHATS are protected with strict client-level state persistence. No unauthorized third party can read or listen to them.
                </p>
              </div>

              {/* Danger Zone: Clear messages */}
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
                <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Clear All Chat History
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permanently erase all messages across conversations. This action cannot be undone.
                </p>

                {showClearConfirm ? (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        onClearAllChats();
                        setShowClearConfirm(false);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                    >
                      Yes, Clear Everything
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3.5 py-1.5 text-xs font-medium text-red-600 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Clear All Messages
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
