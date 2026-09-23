import React, { useState } from 'react';
import {
  MessageSquare,
  CircleDot,
  Phone,
  Settings as SettingsIcon,
  Search,
  Plus,
  Star,
  Check,
  CheckCheck,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Mic,
  Camera,
  UserPlus,
} from 'lucide-react';
import { Contact, Message, StatusItem, CallRecord, UserProfile } from '../types';

interface SidebarProps {
  activeTab: 'chats' | 'status' | 'calls' | 'starred';
  onTabChange: (tab: 'chats' | 'status' | 'calls' | 'starred') => void;
  contacts: Contact[];
  messages: Message[];
  statuses: StatusItem[];
  calls: CallRecord[];
  userProfile: UserProfile;
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onOpenNewChat: () => void;
  onOpenSettings: () => void;
  onOpenStatusViewer: (statusId: string | null) => void;
  onStartCall: (contact: Contact, type: 'voice' | 'video') => void;
  onDeleteContact?: (contactId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  contacts,
  messages,
  statuses,
  calls,
  userProfile,
  selectedContactId,
  onSelectContact,
  onOpenNewChat,
  onOpenSettings,
  onOpenStatusViewer,
  onStartCall,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'favorites' | 'groups'>('all');

  // Find last message for a contact
  const getLastMessage = (contactId: string) => {
    const chatMsgs = messages.filter((m) => m.chatId === contactId);
    return chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : null;
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'unread') return (c.unreadCount ?? 0) > 0;
    if (filterType === 'favorites') return !!c.isFavorite;
    if (filterType === 'groups') return !!c.isGroup;
    return true;
  });

  // Starred messages
  const starredMessages = messages.filter((m) => m.isStarred);

  return (
    <div className="w-full md:w-[380px] lg:w-[420px] h-full flex flex-col bg-white dark:bg-[#111b21] border-r border-slate-200 dark:border-slate-800 shrink-0 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-[#202c33] border-b border-slate-200 dark:border-white/5">
        {/* Left: User profile & App Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenSettings}
            className="relative cursor-pointer group"
            title="Profile & Settings"
          >
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-white/20"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-white dark:border-[#202c33]" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>ERROREN CHATS</span>
              <span className="w-2 h-2 rounded-full bg-[#00a884]" />
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
              {userProfile.about}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('chats')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'chats'
                ? 'bg-slate-200 dark:bg-white/10 text-[#00a884]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={() => onTabChange('status')}
            className={`relative p-2 rounded-full transition-colors ${
              activeTab === 'status'
                ? 'bg-slate-200 dark:bg-white/10 text-[#00a884]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
            title="Status"
          >
            <CircleDot className="w-5 h-5" />
            {statuses.some((s) => !s.isViewed && s.contactId !== 'me') && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a884]" />
            )}
          </button>

          <button
            onClick={() => onTabChange('calls')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'calls'
                ? 'bg-slate-200 dark:bg-white/10 text-[#00a884]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
            title="Calls"
          >
            <Phone className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenNewChat}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'chats' && (
        <>
          {/* Search bar & Filter segmented buttons */}
          <div className="p-2 space-y-2 bg-white dark:bg-[#111b21] border-b border-slate-100 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or start new chat"
                className="w-full bg-slate-100 dark:bg-[#202c33] text-slate-800 dark:text-slate-100 pl-9 pr-4 py-2 text-xs rounded-lg outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 px-1 overflow-x-auto pb-0.5 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-[#00a884]/15 text-[#00a884] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  filterType === 'unread'
                    ? 'bg-[#00a884]/15 text-[#00a884] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterType('favorites')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  filterType === 'favorites'
                    ? 'bg-[#00a884]/15 text-[#00a884] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Favourites
              </button>
              <button
                onClick={() => setFilterType('groups')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  filterType === 'groups'
                    ? 'bg-[#00a884]/15 text-[#00a884] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Groups
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {contacts.length === 0 ? (
              /* Completely clean state: no fake IDs */
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#00a884]/10 text-[#00a884] flex items-center justify-center mb-3">
                  <UserPlus className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  No chats yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-[220px]">
                  All fake accounts removed. Add your real contacts to start chatting.
                </p>
                <button
                  onClick={onOpenNewChat}
                  className="px-4 py-2 bg-[#00a884] hover:bg-[#009374] active:scale-95 text-white text-xs font-semibold rounded-full shadow transition-transform flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add New Contact
                </button>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No chats found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const lastMsg = getLastMessage(contact.id);
                const isSelected = selectedContactId === contact.id;

                return (
                  <div
                    key={contact.id}
                    onClick={() => onSelectContact(contact.id)}
                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-[#2a3942]'
                        : 'hover:bg-slate-50 dark:hover:bg-[#202c33]/60'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-white dark:border-[#111b21]" />
                      )}
                    </div>

                    {/* Middle Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {contact.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {lastMsg ? lastMsg.timestamp : contact.lastSeen}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 truncate max-w-[210px]">
                          {lastMsg?.senderId === 'me' && (
                            <span>
                              {lastMsg.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
                              ) : lastMsg.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                              )}
                            </span>
                          )}
                          {lastMsg?.type === 'audio' && <Mic className="w-3.5 h-3.5 text-[#00a884]" />}
                          {lastMsg?.type === 'image' && <Camera className="w-3.5 h-3.5 text-[#00a884]" />}
                          <span className="truncate">
                            {lastMsg?.type === 'audio'
                              ? 'Voice message'
                              : lastMsg?.type === 'image'
                              ? 'Photo'
                              : lastMsg?.text || contact.about}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {contact.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          {(contact.unreadCount ?? 0) > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[#00a884] text-white text-[10px] font-bold flex items-center justify-center">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Status Tab Panel */}
      {activeTab === 'status' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* User's own status */}
          <div
            onClick={() => onOpenStatusViewer(null)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-white/20"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#00a884] text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                +
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">My Status</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tap to add your real status</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
              Recent Updates
            </p>

            {statuses.filter((s) => s.contactId !== 'me').length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No status updates yet</p>
            ) : (
              <div className="space-y-1">
                {statuses
                  .filter((s) => s.contactId !== 'me')
                  .map((status) => (
                    <div
                      key={status.id}
                      onClick={() => onOpenStatusViewer(status.id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#202c33] cursor-pointer transition-colors"
                    >
                      <div
                        className={`p-0.5 rounded-full ${
                          status.isViewed ? 'border-2 border-slate-400' : 'border-2 border-[#00a884]'
                        }`}
                      >
                        <img
                          src={status.contactAvatar}
                          alt={status.contactName}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {status.contactName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{status.timestamp}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calls Tab Panel */}
      {activeTab === 'calls' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Recent Calls
          </div>

          {calls.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Phone className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-50" />
              No calls yet. You can make voice and video calls to any contact.
            </div>
          ) : (
            calls.map((call) => {
              const matchedContact = contacts.find((c) => c.id === call.contactId);
              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#202c33] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={call.contactAvatar}
                      alt={call.contactName}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {call.contactName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        {call.direction === 'incoming' ? (
                          <PhoneIncoming className="w-3.5 h-3.5 text-[#00a884]" />
                        ) : call.direction === 'outgoing' ? (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span>{call.timestamp}</span>
                        {call.duration && <span>· {call.duration}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {matchedContact && (
                      <>
                        <button
                          onClick={() => onStartCall(matchedContact, 'voice')}
                          className="p-2 text-[#00a884] hover:bg-[#00a884]/15 rounded-full transition-colors"
                          title="Voice Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onStartCall(matchedContact, 'video')}
                          className="p-2 text-[#00a884] hover:bg-[#00a884]/15 rounded-full transition-colors"
                          title="Video Call"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Starred Messages Tab */}
      {activeTab === 'starred' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Starred Messages ({starredMessages.length})
          </div>

          {starredMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Star className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-50" />
              No starred messages yet.
            </div>
          ) : (
            starredMessages.map((msg) => {
              const contact = contacts.find((c) => c.id === msg.chatId);
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    onSelectContact(msg.chatId);
                    onTabChange('chats');
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#202c33] hover:bg-slate-100 dark:hover:bg-[#2a3942] cursor-pointer transition-colors border border-slate-200/50 dark:border-white/5 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#00a884]">{contact?.name || 'Chat'}</span>
                    <span className="text-slate-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                    {msg.text || (msg.type === 'audio' ? 'Voice note' : 'Photo')}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
