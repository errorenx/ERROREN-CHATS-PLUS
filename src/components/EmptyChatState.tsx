import React from 'react';
import { ShieldCheck, MessageSquare, Lock, Laptop } from 'lucide-react';

interface EmptyChatStateProps {
  onStartNewChat: () => void;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onStartNewChat }) => {
  return (
    <div className="hidden md:flex flex-1 h-full flex-col items-center justify-center p-8 bg-slate-100 dark:bg-[#222e35] text-center select-none border-b-8 border-[#00a884]">
      <div className="max-w-md flex flex-col items-center space-y-4">
        {/* Modern Icon graphic */}
        <div className="w-24 h-24 rounded-full bg-[#00a884]/15 dark:bg-[#00a884]/20 flex items-center justify-center text-[#00a884] mb-2 shadow-inner">
          <Laptop className="w-12 h-12" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          ERROREN CHATS for Web
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Send and receive messages, record voice notes, share photos, and place voice or video calls seamlessly with high-speed performance.
        </p>

        <button
          onClick={onStartNewChat}
          className="mt-2 px-6 py-2.5 bg-[#00a884] hover:bg-[#009374] active:scale-95 text-white font-semibold text-sm rounded-full shadow-lg transition-transform flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" /> Start a Conversation
        </button>

        <div className="pt-10 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Lock className="w-3.5 h-3.5" />
          <span>End-to-end encrypted · Private & Secure</span>
        </div>
      </div>
    </div>
  );
};
