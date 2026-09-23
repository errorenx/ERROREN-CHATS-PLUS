export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type MessageType = 'text' | 'image' | 'audio' | 'system';

export interface Reaction {
  emoji: string;
  senderId: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string; // 'me' or contact.id
  text?: string;
  mediaUrl?: string;
  audioDuration?: number; // in seconds for voice notes
  type: MessageType;
  timestamp: string; // ISO or formatted
  status: MessageStatus;
  isStarred?: boolean;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: Reaction[];
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  about: string;
  isOnline: boolean;
  lastSeen: string;
  isFavorite?: boolean;
  isGroup?: boolean;
  groupMembers?: string[];
  unreadCount?: number;
}

export interface StatusItem {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  mediaUrl?: string;
  text?: string;
  bgColor?: string;
  timestamp: string;
  isViewed: boolean;
}

export interface CallRecord {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  about: string;
  avatar: string;
}

export type ChatWallpaperTheme = 'default' | 'dark' | 'mint' | 'teal' | 'midnight' | 'sunset';

export interface AppSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  wallpaper: ChatWallpaperTheme;
  isLocked: boolean;
  pinCode?: string;
  enterIsSend: boolean;
}
