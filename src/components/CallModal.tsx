import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { Contact } from '../types';
import { soundFX } from '../utils/audio';

interface CallModalProps {
  contact: Contact;
  type: 'voice' | 'video';
  onEndCall: (durationStr: string) => void;
}

export const CallModal: React.FC<CallModalProps> = ({ contact, type, onEndCall }) => {
  const [status, setStatus] = useState<'calling' | 'ringing' | 'connected'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const stopRingRef = useRef<(() => void) | null>(null);

  // Setup ringing sound & automatic connection transition
  useEffect(() => {
    // 1s calling -> then ringing
    const t1 = setTimeout(() => {
      setStatus('ringing');
      stopRingRef.current = soundFX.startRinging();
    }, 1200);

    // 4s later -> connected!
    const t2 = setTimeout(() => {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
      setStatus('connected');
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (stopRingRef.current) {
        stopRingRef.current();
      }
    };
  }, []);

  // Timer when connected
  useEffect(() => {
    if (status !== 'connected') return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Request video stream if video call
  useEffect(() => {
    let active = true;
    if (type === 'video') {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (!active) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera not available or blocked in sandbox, fallback to avatar
          console.warn('Camera preview not accessible in current context.');
        });
    }

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [type]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    if (stopRingRef.current) {
      stopRingRef.current();
    }
    soundFX.playHangup();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    onEndCall(formatDuration(seconds));
  };

  const toggleVideo = () => {
    setIsVideoOn((prev) => !prev);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleAudio = () => {
    setIsMuted((prev) => !prev);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#111b21] text-white p-6 select-none overflow-hidden">
      {/* Background for Video or Gradient */}
      {type === 'video' && isVideoOn ? (
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
          {/* Simulated contact video feed using avatar or video backdrop */}
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1f2c34] to-[#0c1317]">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-32 h-32 rounded-full border-4 border-[#00a884] shadow-2xl object-cover"
            />
            <div className="absolute bottom-28 left-6 text-left">
              <p className="text-xl font-bold">{contact.name}</p>
              <p className="text-xs text-slate-300">Live Video · 720p HD</p>
            </div>
          </div>

          {/* User's local camera preview in picture-in-picture */}
          <div className="absolute top-20 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 z-10">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <span className="absolute bottom-1 right-2 text-[10px] text-white/80 bg-black/50 px-1 rounded">You</span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#111b21] via-[#1a2730] to-[#0b141a]" />
      )}

      {/* Top Header info */}
      <div className="relative z-10 w-full flex flex-col items-center text-center mt-6">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 text-xs text-[#00a884] mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> End-to-end encrypted
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{contact.name}</h2>
        <p className="text-sm font-medium text-slate-300 mt-1 capitalize">
          {status === 'connected' ? (
            <span className="text-[#00a884] font-semibold tracking-wider font-mono">
              {formatDuration(seconds)}
            </span>
          ) : status === 'ringing' ? (
            'Ringing...'
          ) : (
            'Calling...'
          )}
        </p>
      </div>

      {/* Center Avatar (shown in voice call or when video is toggled off) */}
      {(!isVideoOn || type === 'voice') && (
        <div className="relative z-10 my-auto flex flex-col items-center">
          <div className="relative">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-36 h-36 rounded-full border-4 border-slate-700 shadow-2xl object-cover"
            />
            {status === 'ringing' && (
              <span className="absolute inset-0 rounded-full border-4 border-[#00a884] animate-ping opacity-60" />
            )}
          </div>
          <p className="text-sm text-slate-400 mt-4">{contact.phone}</p>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="relative z-10 w-full max-w-sm mb-6 bg-[#202c33]/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 flex items-center justify-around shadow-2xl">
        {/* Speaker Button */}
        <button
          onClick={() => setIsSpeakerOn((prev) => !prev)}
          className={`p-3 rounded-full transition-colors ${
            isSpeakerOn ? 'bg-white/15 text-white' : 'bg-red-500/20 text-red-400'
          }`}
          title="Speaker"
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* Video Toggle Button */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoOn ? 'bg-white/15 text-white' : 'bg-red-500/20 text-red-400'
          }`}
          title="Toggle Video"
        >
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        {/* Microphone Toggle Button */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            !isMuted ? 'bg-white/15 text-white' : 'bg-red-500/20 text-red-400'
          }`}
          title="Mute Mic"
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEnd}
          className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-lg transition-transform"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
