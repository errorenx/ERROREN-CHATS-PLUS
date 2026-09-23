import { Contact, Message, StatusItem, CallRecord, UserProfile, AppSettings } from '../types';

const STORAGE_KEYS = {
  CONTACTS: 'erroren_chats_contacts_v2',
  MESSAGES: 'erroren_chats_messages_v2',
  STATUSES: 'erroren_chats_statuses_v2',
  CALLS: 'erroren_chats_calls_v2',
  USER_PROFILE: 'erroren_chats_profile_v2',
  SETTINGS: 'erroren_chats_settings_v2',
};

// All fake IDs and dummy contacts removed - Clean production baseline
export const INITIAL_CONTACTS: Contact[] = [];

export const INITIAL_MESSAGES: Message[] = [];

export const INITIAL_STATUSES: StatusItem[] = [];

export const INITIAL_CALLS: CallRecord[] = [];

// Clean User Profile
export const INITIAL_USER: UserProfile = {
  name: 'Islamabad Sector',
  phone: '',
  about: 'Available on ERROREN CHATS 💬',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
};

// Default Settings
export const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  soundEnabled: true,
  notificationsEnabled: true,
  wallpaper: 'default',
  isLocked: false,
  pinCode: '',
  enterIsSend: true,
};

// Storage helper functions
export const getStoredData = () => {
  try {
    // Clear legacy v1 storage if present to eliminate any previous fake IDs
    const legacyKeys = [
      'erroren_chats_contacts_v1',
      'erroren_chats_messages_v1',
      'erroren_chats_statuses_v1',
      'erroren_chats_calls_v1',
      'erroren_chats_profile_v1',
      'erroren_chats_settings_v1',
    ];
    legacyKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });

    const contacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    const messages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const statuses = localStorage.getItem(STORAGE_KEYS.STATUSES);
    const calls = localStorage.getItem(STORAGE_KEYS.CALLS);
    const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    // If contacts existed in v2, verify no fake 'c1'-'c6' items exist
    let parsedContacts: Contact[] = contacts ? JSON.parse(contacts) : INITIAL_CONTACTS;
    if (Array.isArray(parsedContacts)) {
      parsedContacts = parsedContacts.filter((c) => !['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].includes(c.id));
    } else {
      parsedContacts = [];
    }

    let parsedMessages: Message[] = messages ? JSON.parse(messages) : INITIAL_MESSAGES;
    if (Array.isArray(parsedMessages)) {
      parsedMessages = parsedMessages.filter(
        (m) => !['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].includes(m.chatId) &&
               !['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10'].includes(m.id)
      );
    } else {
      parsedMessages = [];
    }

    return {
      contacts: parsedContacts,
      messages: parsedMessages,
      statuses: statuses ? JSON.parse(statuses) : INITIAL_STATUSES,
      calls: calls ? JSON.parse(calls) : INITIAL_CALLS,
      profile: profile ? JSON.parse(profile) : INITIAL_USER,
      settings: settings ? JSON.parse(settings) : INITIAL_SETTINGS,
    };
  } catch (err) {
    console.error('Failed reading storage, resetting to clean defaults', err);
    return {
      contacts: INITIAL_CONTACTS,
      messages: INITIAL_MESSAGES,
      statuses: INITIAL_STATUSES,
      calls: INITIAL_CALLS,
      profile: INITIAL_USER,
      settings: INITIAL_SETTINGS,
    };
  }
};

export const saveStoredData = (key: keyof typeof STORAGE_KEYS, data: unknown) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (err) {
    console.error(`Failed saving ${key} to storage`, err);
  }
};

// Natural response helper for when communicating with active contacts
export const generateContactReply = (contact: Contact, userMessage: string): string => {
  const lower = userMessage.toLowerCase().trim();

  if (lower.includes('salam') || lower.includes('slaam') || lower.includes('asalam')) {
    return `Walaikum Assalam! Kaise ho aap?`;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! How are you doing?`;
  }
  if (lower.includes('kaise') || lower.includes('kese') || lower.includes('how are you')) {
    return `Alhamdulillah theek thak! Aap sunayein?`;
  }
  if (lower.includes('call') || lower.includes('audio') || lower.includes('video')) {
    return `Sure, call me whenever you are free!`;
  }
  if (lower.includes('theek') || lower.includes('ok') || lower.includes('acha') || lower.includes('done')) {
    return `Great! Let me know if you need anything else 👍`;
  }

  const genericReplies = [
    `Received your message! 👍`,
    `Got it, let's connect shortly.`,
    `Understood! Everything looks good.`,
    `Thanks for the update.`,
  ];

  return genericReplies[Math.floor(Math.random() * genericReplies.length)];
};
