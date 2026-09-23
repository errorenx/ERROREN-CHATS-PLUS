import React, { useState, useEffect } from 'react';
import {
  Contact,
  Message,
  StatusItem,
  CallRecord,
  UserProfile,
  AppSettings,
} from './types';
import {
  getStoredData,
  saveStoredData,
  generateContactReply,
  INITIAL_CONTACTS,
  INITIAL_MESSAGES,
  INITIAL_STATUSES,
  INITIAL_CALLS,
} from './utils/storage';
import { soundFX } from './utils/audio';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { EmptyChatState } from './components/EmptyChatState';
import { CallModal } from './components/CallModal';
import { StatusViewer } from './components/StatusViewer';
import { SettingsModal } from './components/SettingsModal';
import { NewChatModal } from './components/NewChatModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { LockScreen } from './components/LockScreen';

export default function App() {
  // Load initial persistent storage
  const [data] = useState(getStoredData);
  const [contacts, setContacts] = useState<Contact[]>(data.contacts);
  const [messages, setMessages] = useState<Message[]>(data.messages);
  const [statuses, setStatuses] = useState<StatusItem[]>(data.statuses);
  const [calls, setCalls] = useState<CallRecord[]>(data.calls);
  const [userProfile, setUserProfile] = useState<UserProfile>(data.profile);
  const [settings, setSettings] = useState<AppSettings>(data.settings);

  // App navigation state
  const [selectedContactId, setSelectedContactId] = useState<string | null>(data.contacts[0]?.id || null);
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'status' | 'calls' | 'starred'>('chats');
  const [typingContactIds, setTypingContactIds] = useState<{ [contactId: string]: boolean }>({});

  // Modals state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [statusViewerId, setStatusViewerId] = useState<string | null>(null);
  const [showStatusViewer, setShowStatusViewer] = useState(false);
  const [activeCall, setActiveCall] = useState<{ contact: Contact; type: 'voice' | 'video' } | null>(null);
  const [mediaViewer, setMediaViewer] = useState<{ imageUrl: string; senderName: string; timestamp?: string } | null>(null);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(Boolean(data.settings.pinCode && data.settings.pinCode.length === 4));

  // Sync Dark Theme class to HTML root
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Sync state changes to localStorage
  useEffect(() => {
    saveStoredData('CONTACTS', contacts);
  }, [contacts]);

  useEffect(() => {
    saveStoredData('MESSAGES', messages);
  }, [messages]);

  useEffect(() => {
    saveStoredData('STATUSES', statuses);
  }, [statuses]);

  useEffect(() => {
    saveStoredData('CALLS', calls);
  }, [calls]);

  useEffect(() => {
    saveStoredData('USER_PROFILE', userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveStoredData('SETTINGS', settings);
  }, [settings]);

  // Selected contact object
  const activeContact = contacts.find((c) => c.id === selectedContactId) || null;
  const activeMessages = messages.filter((m) => m.chatId === selectedContactId);

  // Handle Send Message (text, image, audio)
  const handleSendMessage = (
    text: string,
    type: 'text' | 'image' | 'audio' = 'text',
    mediaUrl?: string,
    audioDuration?: number
  ) => {
    if (!selectedContactId) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      chatId: selectedContactId,
      senderId: 'me',
      text: text || undefined,
      type,
      mediaUrl,
      audioDuration,
      timestamp: timeStr,
      status: 'delivered',
    };

    setMessages((prev) => [...prev, newMsg]);

    if (settings.soundEnabled) {
      soundFX.playSent();
    }

    // Reset unread count for active contact
    setContacts((prev) =>
      prev.map((c) => (c.id === selectedContactId ? { ...c, unreadCount: 0 } : c))
    );

    // Trigger Smart Simulated Reply from contact
    const targetContact = activeContact;
    if (targetContact && !targetContact.isGroup) {
      const contactId = targetContact.id;

      // Start typing after short delay
      setTimeout(() => {
        setTypingContactIds((prev) => ({ ...prev, [contactId]: true }));
      }, 700);

      // Reply after 2.4 seconds
      setTimeout(() => {
        setTypingContactIds((prev) => ({ ...prev, [contactId]: false }));

        const replyContent = generateContactReply(targetContact, text || 'Photo/Audio');
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const replyMsg: Message = {
          id: `m_${Date.now()}_reply`,
          chatId: contactId,
          senderId: contactId,
          text: replyContent,
          type: 'text',
          timestamp: replyTime,
          status: 'read',
        };

        setMessages((prev) => {
          // mark user's previous messages as read
          const updated = prev.map((m) =>
            m.chatId === contactId && m.senderId === 'me' ? { ...m, status: 'read' as const } : m
          );
          return [...updated, replyMsg];
        });

        if (settings.soundEnabled) {
          soundFX.playReceived();
        }
      }, 2400);
    }
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Star / Unstar message
  const handleToggleStarMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  // React to message
  const handleReactMessage = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions || [];
        const existing = reactions.find((r) => r.senderId === 'me');
        let newReactions;
        if (existing) {
          newReactions = reactions.map((r) => (r.senderId === 'me' ? { ...r, emoji } : r));
        } else {
          newReactions = [...reactions, { emoji, senderId: 'me' }];
        }
        return { ...m, reactions: newReactions };
      })
    );
  };

  // Clear single chat messages
  const handleClearChat = (contactId: string) => {
    setMessages((prev) => prev.filter((m) => m.chatId !== contactId));
  };

  // Delete entire contact and associated data
  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    setMessages((prev) => prev.filter((m) => m.chatId !== contactId));
    setCalls((prev) => prev.filter((cl) => cl.contactId !== contactId));
    if (selectedContactId === contactId) {
      setSelectedContactId(null);
    }
  };

  // Clear all chats history
  const handleClearAllChats = () => {
    setMessages([]);
  };

  // Start Call
  const handleStartCall = (contact: Contact, type: 'voice' | 'video') => {
    setActiveCall({ contact, type });
  };

  // End Call & record in call log
  const handleEndCall = (durationStr: string) => {
    if (activeCall) {
      const newCallRecord: CallRecord = {
        id: `call_${Date.now()}`,
        contactId: activeCall.contact.id,
        contactName: activeCall.contact.name,
        contactAvatar: activeCall.contact.avatar,
        type: activeCall.type,
        direction: 'outgoing',
        timestamp: 'Just now',
        duration: durationStr || '12s',
      };
      setCalls((prev) => [newCallRecord, ...prev]);
    }
    setActiveCall(null);
  };

  // Create new contact
  const handleCreateContact = (newContact: Contact, initialMessage?: string) => {
    setContacts((prev) => [newContact, ...prev]);
    setSelectedContactId(newContact.id);
    setSidebarTab('chats');

    if (initialMessage) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsg: Message = {
        id: `m_${Date.now()}`,
        chatId: newContact.id,
        senderId: 'me',
        text: initialMessage,
        type: 'text',
        timestamp: timeStr,
        status: 'delivered',
      };
      setMessages((prev) => [...prev, newMsg]);

      // Smart auto-reply for new contact
      setTimeout(() => {
        setTypingContactIds((prev) => ({ ...prev, [newContact.id]: true }));
      }, 800);

      setTimeout(() => {
        setTypingContactIds((prev) => ({ ...prev, [newContact.id]: false }));
        const replyMsg: Message = {
          id: `m_${Date.now()}_reply`,
          chatId: newContact.id,
          senderId: newContact.id,
          text: `Salam ${userProfile.name.split(' ')[0]}! Thanks for adding me to ERROREN CHATS.`,
          type: 'text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        };
        setMessages((prev) => [...prev, replyMsg]);
        if (settings.soundEnabled) soundFX.playReceived();
      }, 2600);
    }
  };

  // Add new status
  const handleAddStatus = (newStatusData: Omit<StatusItem, 'id'>) => {
    const newStatus: StatusItem = {
      ...newStatusData,
      id: `s_${Date.now()}`,
    };
    setStatuses((prev) => [newStatus, ...prev]);
  };

  // Reply from status viewer
  const handleStatusReply = (contactId: string, replyText: string) => {
    setSelectedContactId(contactId);
    setSidebarTab('chats');
    handleSendMessage(replyText, 'text');
  };

  // App Lock
  if (isAppLocked && settings.pinCode) {
    return <LockScreen correctPin={settings.pinCode} onUnlock={() => setIsAppLocked(false)} />;
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-slate-200 dark:bg-[#0c1317]">
      {/* WhatsApp Web Outer Shell / Container */}
      <div className="w-full h-full flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
        {/* Left Sidebar (Chats, Status, Calls, Starred) */}
        <div
          className={`${
            selectedContactId ? 'hidden md:flex' : 'flex'
          } w-full md:w-[380px] lg:w-[420px] h-full flex-col shrink-0`}
        >
          <Sidebar
            activeTab={sidebarTab}
            onTabChange={(tab) => setSidebarTab(tab)}
            contacts={contacts}
            messages={messages}
            statuses={statuses}
            calls={calls}
            userProfile={userProfile}
            selectedContactId={selectedContactId}
            onSelectContact={(id) => {
              setSelectedContactId(id);
              // mark unread as 0
              setContacts((prev) =>
                prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
              );
            }}
            onOpenNewChat={() => setShowNewChatModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenStatusViewer={(id) => {
              setStatusViewerId(id);
              setShowStatusViewer(true);
            }}
            onStartCall={handleStartCall}
            onDeleteContact={handleDeleteContact}
          />
        </div>

        {/* Right Active Chat Window or Empty State */}
        <div
          className={`${
            !selectedContactId ? 'hidden md:flex' : 'flex'
          } flex-1 h-full flex-col overflow-hidden`}
        >
          {activeContact ? (
            <ChatArea
              contact={activeContact}
              messages={activeMessages}
              settings={settings}
              isTyping={Boolean(typingContactIds[activeContact.id])}
              onBack={() => setSelectedContactId(null)}
              onSendMessage={handleSendMessage}
              onStartCall={handleStartCall}
              onDeleteMessage={handleDeleteMessage}
              onToggleStarMessage={handleToggleStarMessage}
              onReactMessage={handleReactMessage}
              onOpenMediaViewer={(imageUrl, senderName, timestamp) =>
                setMediaViewer({ imageUrl, senderName, timestamp })
              }
              onClearChat={handleClearChat}
              onDeleteContact={handleDeleteContact}
            />
          ) : (
            <EmptyChatState onStartNewChat={() => setShowNewChatModal(true)} />
          )}
        </div>
      </div>

      {/* Video / Audio Call Modal */}
      {activeCall && (
        <CallModal
          contact={activeCall.contact}
          type={activeCall.type}
          onEndCall={handleEndCall}
        />
      )}

      {/* Status Viewer / Creator */}
      {showStatusViewer && (
        <StatusViewer
          statuses={statuses}
          userProfile={userProfile}
          activeStatusId={statusViewerId}
          onClose={() => setShowStatusViewer(false)}
          onReply={handleStatusReply}
          onAddStatus={handleAddStatus}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          userProfile={userProfile}
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onUpdateProfile={(updated) => setUserProfile(updated)}
          onUpdateSettings={(updated) => setSettings(updated)}
          onClearAllChats={handleClearAllChats}
          onLockNow={() => {
            setShowSettingsModal(false);
            setIsAppLocked(true);
          }}
        />
      )}

      {/* New Chat / Add Contact Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onCreateContact={handleCreateContact}
        />
      )}

      {/* Media Fullscreen Viewer Modal */}
      {mediaViewer && (
        <MediaViewerModal
          imageUrl={mediaViewer.imageUrl}
          senderName={mediaViewer.senderName}
          timestamp={mediaViewer.timestamp}
          onClose={() => setMediaViewer(null)}
        />
      )}
    </div>
  );
}
