import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Check,
  CheckCheck,
  Play,
  Pause,
  Trash2,
  Reply,
  Star,
  ShieldCheck,
  X,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { Contact, Message, AppSettings } from '../types';
import { soundFX, VoiceRecorder } from '../utils/audio';

interface ChatAreaProps {
  contact: Contact;
  messages: Message[];
  settings: AppSettings;
  isTyping: boolean;
  onBack: () => void;
  onSendMessage: (text: string, type?: 'text' | 'image' | 'audio', mediaUrl?: string, audioDuration?: number) => void;
  onStartCall: (contact: Contact, type: 'voice' | 'video') => void;
  onDeleteMessage: (messageId: string) => void;
  onToggleStarMessage: (messageId: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onOpenMediaViewer: (imageUrl: string, senderName: string, timestamp?: string) => void;
  onClearChat: (contactId: string) => void;
  onDeleteContact?: (contactId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  contact,
  messages,
  settings,
  isTyping,
  onBack,
  onSendMessage,
  onStartCall,
  onDeleteMessage,
  onToggleStarMessage,
  onReactMessage,
  onOpenMediaViewer,
  onClearChat,
  onDeleteContact,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Search inside chat
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  // Audio Playback state (one audio playing at a time)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [msgId: string]: number }>({});
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    voiceRecorderRef.current = new VoiceRecorder();
    const started = await voiceRecorderRef.current.start();
    setIsRecording(true);
    if (!started) {
      // Audio recorder will use harmonic fallback audio note
    }
  };

  const handleStopAndSendRecording = async () => {
    if (!voiceRecorderRef.current) return;
    const { audioUrl, duration } = await voiceRecorderRef.current.stop();
    setIsRecording(false);
    onSendMessage('', 'audio', audioUrl, duration);
  };

  const handleCancelRecording = () => {
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.cancel();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Play/Pause voice note
  const handleTogglePlayAudio = (message: Message) => {
    if (!message.mediaUrl) return;

    if (playingAudioId === message.id) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }

    const audio = new Audio(message.mediaUrl);
    activeAudioRef.current = audio;
    setPlayingAudioId(message.id);

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioProgress((prev) => ({
          ...prev,
          [message.id]: (audio.currentTime / audio.duration) * 100,
        }));
      }
    };

    audio.onended = () => {
      setPlayingAudioId(null);
      setAudioProgress((prev) => ({ ...prev, [message.id]: 0 }));
    };

    audio.play().catch((err) => {
      console.warn('Playback error', err);
      setPlayingAudioId(null);
    });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && settings.enterIsSend) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSendMessage('Sent a photo', 'image', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    setShowAttachMenu(false);
  };

  const emojis = ['😀', '😂', '😍', '🔥', '👍', '🙏', '❤️', '👏', '🎉', '💯', '🤔', '😎', '👌', '✨', '☕', '🚀'];
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  // Filter messages if search inside chat is active
  const displayedMessages = chatSearchQuery.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 h-full flex flex-col bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden relative">
      {/* Top Header */}
      <div className="h-16 px-4 flex items-center justify-between bg-slate-50 dark:bg-[#202c33] border-b border-slate-200 dark:border-white/5 z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={onBack}
            className="md:hidden p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Contact Avatar */}
          <div className="relative shrink-0 cursor-pointer">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {contact.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] rounded-full border-2 border-white dark:border-[#202c33]" />
            )}
          </div>

          {/* Contact Details */}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
              {contact.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {isTyping ? (
                <span className="text-[#00a884] font-semibold animate-pulse">typing...</span>
              ) : contact.isOnline ? (
                'online'
              ) : (
                contact.lastSeen
              )}
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Voice Call */}
          <button
            onClick={() => onStartCall(contact, 'voice')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
            title="Voice Call"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => onStartCall(contact, 'video')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Search inside chat */}
          <button
            onClick={() => setIsSearchingInChat((prev) => !prev)}
            className={`p-2 rounded-full transition-colors ${
              isSearchingInChat
                ? 'bg-[#00a884]/20 text-[#00a884]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
            title="Search in Chat"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
              title="Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#233138] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-1.5 z-50 text-xs">
                <button
                  onClick={() => {
                    onClearChat(contact.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" /> Clear Messages
                </button>
                {onDeleteContact && (
                  <button
                    onClick={() => {
                      onDeleteContact(contact.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 text-red-600 dark:text-red-400 flex items-center gap-2 border-t border-slate-100 dark:border-white/5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete Contact
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-chat search bar */}
      {isSearchingInChat && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-[#182229] border-b border-slate-200 dark:border-white/10 flex items-center gap-2 z-20">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            placeholder="Search messages in this conversation..."
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              setIsSearchingInChat(false);
              setChatSearchQuery('');
            }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Messages Stream Container with Selected Wallpaper */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 wallpaper-${settings.wallpaper}`}>
        {/* End-to-End Encryption Notice Badge */}
        <div className="flex justify-center my-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100/80 dark:bg-[#182229]/90 border border-amber-300/40 dark:border-amber-400/20 text-[11px] text-amber-900 dark:text-amber-200 text-center shadow-sm max-w-sm">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Messages and calls in ERROREN CHATS are end-to-end encrypted.</span>
          </div>
        </div>

        {/* Date divider */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 rounded-md bg-white/80 dark:bg-[#182229]/80 text-[11px] text-slate-600 dark:text-slate-300 font-medium shadow-sm backdrop-blur-sm">
            Today
          </span>
        </div>

        {/* Render Messages */}
        {displayedMessages.map((msg) => {
          const isMe = msg.senderId === 'me';

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-xl px-3 py-2 shadow-sm ${
                  isMe
                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 bubble-sent'
                    : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 bubble-received'
                }`}
              >
                {/* Reply To Quote Header */}
                {msg.replyTo && (
                  <div className="mb-1.5 p-1.5 rounded-md bg-black/5 dark:bg-black/20 border-l-4 border-[#00a884] text-xs">
                    <p className="font-semibold text-[11px] text-[#00a884]">{msg.replyTo.senderName}</p>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-1">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* Media Image Message */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div
                    onClick={() => onOpenMediaViewer(msg.mediaUrl!, isMe ? 'You' : contact.name, msg.timestamp)}
                    className="cursor-pointer overflow-hidden rounded-lg mb-1 group/img relative"
                  >
                    <img
                      src={msg.mediaUrl}
                      alt="Uploaded media"
                      className="max-h-72 w-full object-cover hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                )}

                {/* Voice Note Audio Message */}
                {msg.type === 'audio' && (
                  <div className="flex items-center gap-3 py-1 min-w-[210px]">
                    <button
                      onClick={() => handleTogglePlayAudio(msg)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                        isMe ? 'bg-[#00a884] text-white' : 'bg-[#00a884] text-white'
                      }`}
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 flex flex-col justify-center">
                      {/* Animated audio wave bars */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[40, 75, 55, 90, 30, 85, 60, 45, 95, 50, 70, 40].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full transition-all ${
                              playingAudioId === msg.id
                                ? 'bg-[#00a884]'
                                : 'bg-slate-400 dark:bg-slate-500'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        <span>
                          {playingAudioId === msg.id
                            ? `${Math.round(((audioProgress[msg.id] || 0) / 100) * (msg.audioDuration || 3))}s`
                            : `0:0${msg.audioDuration || 3}`}
                        </span>
                        <span>Voice Note</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Message */}
                {msg.text && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}

                {/* Timestamp & Ticks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400 select-none">
                  {msg.isStarred && <Star className="w-3 h-3 text-amber-500 fill-amber-500 inline mr-0.5" />}
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Message Reactions Badge */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 bg-white dark:bg-[#1f2c34] border border-slate-200 dark:border-white/10 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow text-xs">
                    {msg.reactions.map((r, i) => (
                      <span key={i}>{r.emoji}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Hover Actions Toolbar */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 mt-1 px-1 transition-opacity">
                {quickReactions.slice(0, 3).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReactMessage(msg.id, emoji)}
                    className="p-1 hover:scale-125 transition-transform text-xs"
                    title={`React ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Reply"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onToggleStarMessage(msg.id)}
                  className="p-1 text-slate-400 hover:text-amber-500"
                  title="Star message"
                >
                  <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
                <button
                  onClick={() => onDeleteMessage(msg.id)}
                  className="p-1 text-slate-400 hover:text-red-500"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Realistic typing dots */}
        {isTyping && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#202c33] px-3 py-2 rounded-xl w-16 shadow-sm bubble-received">
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Replying Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-[#202c33] border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="border-l-4 border-[#00a884] pl-2 text-xs">
            <p className="font-semibold text-[#00a884]">
              Replying to {replyingTo.senderId === 'me' ? 'yourself' : contact.name}
            </p>
            <p className="text-slate-600 dark:text-slate-300 truncate max-w-md">{replyingTo.text}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-40 bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-3 grid grid-cols-8 gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-xl p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attach Menu Popover */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-12 z-40 bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 flex flex-col gap-1 w-44">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-purple-500" /> Photos & Videos
          </button>
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <Camera className="w-4 h-4 text-pink-500" /> Camera Snapshot
          </button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Bottom Input Toolbar */}
      <div className="p-3 bg-slate-50 dark:bg-[#202c33] border-t border-slate-200 dark:border-white/5 flex items-center gap-2 shrink-0 z-20">
        {isRecording ? (
          /* Live Voice Recording UI */
          <div className="flex-1 flex items-center justify-between bg-white dark:bg-[#111b21] rounded-2xl px-4 py-2 shadow-inner border border-red-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-semibold text-red-500 font-mono">
                {Math.floor(recordingSeconds / 60)}:
                {(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 animate-pulse">
                Recording voice note...
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelRecording}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                title="Cancel Recording"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleStopAndSendRecording}
                className="p-2 bg-[#00a884] hover:bg-[#009374] text-white rounded-full transition-colors shadow"
                title="Send Voice Note"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Regular Message Input */
          <>
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowAttachMenu((prev) => !prev)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
              title="Attach media"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message in ERROREN CHATS..."
                rows={1}
                className="w-full bg-white dark:bg-[#2a3942] text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none resize-none placeholder-slate-400 border border-slate-200 dark:border-transparent focus:border-[#00a884]"
              />
            </div>

            {inputText.trim() ? (
              <button
                onClick={handleSend}
                className="p-2.5 bg-[#00a884] hover:bg-[#009374] text-white rounded-full transition-colors shadow active:scale-95"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className="p-2.5 bg-[#00a884] hover:bg-[#009374] text-white rounded-full transition-colors shadow active:scale-95"
                title="Hold or click to record voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
