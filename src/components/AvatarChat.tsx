import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';
import { LiveAvatarSession, SessionState, SessionEvent, AgentEventsEnum, VoiceChatEvent } from '@heygen/liveavatar-web-sdk';
import { createHeyGenSession } from '../lib/heygen';

interface AvatarChatProps {
  childInfo: {
    name: string;
    age?: number | null;
    location?: string;
    wishList?: string;
    behaviorNotes?: string;
  };
  onSessionEnd?: (transcript: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export function AvatarChat({ childInfo, onSessionEnd }: AvatarChatProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    initializeSession();

    // Timer
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (sessionRef.current) {
        try {
          sessionRef.current.stop();
          sessionRef.current.removeAllListeners();
        } catch (e) {
          console.error('Error cleaning up session:', e);
        }
      }
    };
  }, []);

  async function initializeSession() {
    try {
      setConnectionStatus('connecting');
      setError(null);

      // Get environment variables
      const avatarId = import.meta.env.VITE_HEYGEN_SANTA_AVATAR_ID;
      const voiceId = import.meta.env.VITE_HEYGEN_SANTA_VOICE_ID;
      const contextId = import.meta.env.VITE_HEYGEN_SANTA_CONTEXT_ID;

      if (!avatarId || !voiceId) {
        throw new Error('Falta la configuración de API de HeyGen. Por favor revisa tu archivo .env.');
      }

      // Create HeyGen session token via backend
      console.log('Creating HeyGen session via backend...');
      console.log('Child info:', childInfo);
      console.log('Using context_id:', contextId);

      const { session_token } = await createHeyGenSession({
        mode: 'FULL',
        avatar_id: avatarId,
        avatar_persona: {
          voice_id: voiceId,
          ...(contextId && { context_id: contextId }),
          language: 'en',
        },
      });

      console.log('Session token received, initializing LiveAvatar...');

      // Initialize LiveAvatar session
      const session = new LiveAvatarSession(session_token, {
        voiceChat: true,
        apiUrl: 'https://api.liveavatar.com',
      });

      sessionRef.current = session;

      // Set up event listeners
      session.on(SessionEvent.SESSION_STATE_CHANGED, (state: SessionState) => {
        console.log('Session state changed:', state);
        if (state === SessionState.CONNECTED) {
          setConnectionStatus('connected');
          setIsConnecting(false);
        } else if (state === SessionState.DISCONNECTED) {
          setConnectionStatus('disconnected');
        }
      });

      session.on(SessionEvent.SESSION_STREAM_READY, () => {
        console.log('Stream ready, attaching video element');
        if (videoRef.current) {
          session.attach(videoRef.current);
        }
      });

      session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        console.log('🎅 Santa started speaking');
      });

      session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, (data: any) => {
        console.log('🎅 Santa stopped speaking:', data);
        if (data?.text) {
          console.log('💬 Santa said:', data.text);
          setTranscript(prev => [...prev, {
            role: 'assistant',
            text: data.text,
            timestamp: Date.now()
          }]);
        }
      });

      session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => {
        console.log('👤 User started speaking');
      });

      session.on(AgentEventsEnum.USER_SPEAK_ENDED, (data: any) => {
        console.log('👤 User stopped speaking:', data);
        if (data?.text) {
          console.log('📝 User said:', data.text);
          setTranscript(prev => [...prev, {
            role: 'user',
            text: data.text,
            timestamp: Date.now()
          }]);
        }
      });

      session.voiceChat.on(VoiceChatEvent.MUTED, () => {
        console.log('🔇 Microphone muted');
        setIsMuted(true);
      });

      session.voiceChat.on(VoiceChatEvent.UNMUTED, () => {
        console.log('🎤 Microphone unmuted');
        setIsMuted(false);
      });

      session.voiceChat.on(VoiceChatEvent.STATE_CHANGED, (state: any) => {
        console.log('🎤 Voice chat state changed:', state);
      });

      // Start the session
      console.log('Starting session...');
      await session.start();

      // Start voice chat automatically
      console.log('Starting voice chat...');
      await session.voiceChat.start();
      console.log('✅ Voice chat started successfully');

    } catch (err) {
      console.error('Session initialization error:', err);
      const errorMessage = err instanceof Error ? err.message : 'No se pudo conectar con Santa';
      setError(errorMessage);
      setIsConnecting(false);
      setConnectionStatus('disconnected');
    }
  }

  function toggleMute() {
    if (sessionRef.current) {
      if (isMuted) {
        sessionRef.current.voiceChat.unmute();
      } else {
        sessionRef.current.voiceChat.mute();
      }
    }
  }

  async function handleEndCall() {
    if (confirm('¿Estás seguro que quieres terminar la llamada con Santa?')) {
      const fullTranscript = transcript.map(m => `${m.role === 'user' ? 'Niño' : 'Santa'}: ${m.text}`).join('\n');

      if (sessionRef.current) {
        try {
          await sessionRef.current.stop();
        } catch (e) {
          console.error('Error stopping session:', e);
        }
      }

      setConnectionStatus('disconnected');
      onSessionEnd?.(fullTranscript);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Conexión</h2>
          <p className="text-lg text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="christmas-button"
          >
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect fill='%23DC2626' width='800' height='600'/%3E%3Ctext x='400' y='300' text-anchor='middle' font-size='64' fill='white' font-family='Arial'%3E🎅%3C/text%3E%3C/svg%3E"
      />

      {/* Connecting overlay */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-christmas-red to-red-800">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-6" />
            <h2 className="text-white text-3xl font-bold mb-2">Conectando con Santa...</h2>
            <p className="text-white/80 text-lg">🎄 Preparando el Polo Norte 🎄</p>
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-mono text-lg">
        {formatTime(elapsedTime)}
      </div>

      {/* Connection status */}
      <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold ${
        connectionStatus === 'connected' ? 'bg-green-500' :
        connectionStatus === 'connecting' ? 'bg-yellow-500' :
        'bg-red-500'
      } text-white flex items-center gap-2`}>
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        {connectionStatus === 'connected' ? 'En Vivo' :
         connectionStatus === 'connecting' ? 'Conectando...' :
         'Desconectado'}
      </div>

      {/* Transcript overlay (for development/testing) */}
      {transcript.length > 0 && (
        <div className="absolute top-20 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg max-w-md max-h-64 overflow-y-auto">
          <h3 className="font-bold mb-2 text-sm">Conversación:</h3>
          {transcript.map((msg, idx) => (
            <div key={idx} className={`mb-2 text-sm ${msg.role === 'user' ? 'text-blue-300' : 'text-green-300'}`}>
              <strong>{msg.role === 'user' ? 'Niño' : 'Santa'}:</strong> {msg.text}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
        <button
          onClick={toggleMute}
          className={`rounded-full w-16 h-16 flex items-center justify-center transition-all duration-200 ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-white/90 hover:bg-white backdrop-blur-sm'
          }`}
          title={isMuted ? 'Activar Micrófono' : 'Silenciar'}
        >
          {isMuted ? (
            <MicOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-gray-900" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200"
          title="Terminar Llamada"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center">
        <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm">
          🎤 ¡Habla naturalmente para chatear con Santa!
        </div>
      </div>
    </div>
  );
}
