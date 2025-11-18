import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Loader2, MessageSquare, Send } from 'lucide-react';
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
  contextId?: string;
  timeLimitMinutes: number;
  onSessionEnd?: (transcript: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export function AvatarChat({ childInfo, contextId, timeLimitMinutes, onSessionEnd }: AvatarChatProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(timeLimitMinutes * 60);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    initializeSession();

    // Countdown Timer
    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Time's up! Auto-end session
          console.log('⏰ Time limit reached, ending session');
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
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

      // Use dynamic contextId from props (personalized for this child)
      // Fallback to static context_id from .env if not provided
      const dynamicContextId = contextId || import.meta.env.VITE_HEYGEN_SANTA_CONTEXT_ID;

      if (!avatarId || !voiceId) {
        throw new Error('Falta la configuración de API de HeyGen. Por favor revisa tu archivo .env.');
      }

      // Create HeyGen session token via backend
      console.log('=== INITIALIZING AVATAR SESSION ===');
      console.log('Child info:', childInfo);
      console.log('Context ID from props:', contextId || 'NOT PROVIDED');
      console.log('Context ID from .env:', import.meta.env.VITE_HEYGEN_SANTA_CONTEXT_ID || 'NOT SET');
      console.log('Using context_id:', dynamicContextId || 'NONE');
      console.log('Context source:', contextId ? '🎯 DYNAMIC (personalized)' : '⚠️ FALLBACK (.env)');

      const { session_token } = await createHeyGenSession({
        mode: 'FULL',
        avatar_id: avatarId,
        avatar_persona: {
          voice_id: voiceId,
          ...(dynamicContextId && { context_id: dynamicContextId }),
          language: 'es',
        },
      });

      console.log('✅ Session token received');

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

  function toggleChatMode() {
    const newMode = !isChatMode;
    setIsChatMode(newMode);
    console.log('🔄 Toggling chat mode:', newMode ? 'CHAT' : 'VOICE');

    if (sessionRef.current) {
      try {
        if (newMode) {
          // Switching to chat mode - mute voice
          sessionRef.current.voiceChat?.mute();
          console.log('💬 Switched to chat mode');
        } else {
          // Switching to voice mode - unmute if not manually muted
          if (!isMuted) {
            sessionRef.current.voiceChat?.unmute();
          }
          console.log('🎤 Switched to voice mode');
        }
      } catch (error) {
        console.error('Error toggling chat mode:', error);
      }
    }
  }

  function sendChatMessage() {
    if (!chatInput.trim() || !sessionRef.current) return;

    console.log('📤 Sending text message:', chatInput);

    // Send message to avatar using text chat
    sessionRef.current.message(chatInput);

    // Add to transcript
    setTranscript(prev => [...prev, {
      role: 'user',
      text: chatInput,
      timestamp: Date.now()
    }]);

    // Clear input
    setChatInput('');
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
    <div className="fixed inset-0 w-full bg-black overflow-hidden" style={{ height: '100dvh' }}>
      {/* Video element - positioned to show Santa on the right for mobile */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover md:object-center object-[75%_center]"
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

      {/* Countdown Timer - iPhone style top bar */}
      <div className={`absolute top-safe top-4 left-4 md:left-4 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-mono text-sm md:text-lg font-bold ${
        remainingSeconds <= 60 ? 'bg-red-600/90 text-white animate-pulse' :
        remainingSeconds <= 180 ? 'bg-yellow-600/90 text-white' :
        'bg-black/60 text-white'
      }`}>
        ⏱️ {formatTime(remainingSeconds)}
      </div>

      {/* Connection status - iPhone style */}
      <div className={`absolute top-safe top-4 right-4 md:right-4 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold ${
        connectionStatus === 'connected' ? 'bg-green-500' :
        connectionStatus === 'connecting' ? 'bg-yellow-500' :
        'bg-red-500'
      } text-white flex items-center gap-2`}>
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        {connectionStatus === 'connected' ? 'En Vivo' :
         connectionStatus === 'connecting' ? 'Conectando...' :
         'Desconectado'}
      </div>

      {/* Transcript overlay (hidden on mobile) */}
      {transcript.length > 0 && (
        <div className="hidden md:block absolute top-20 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg max-w-md max-h-64 overflow-y-auto">
          <h3 className="font-bold mb-2 text-sm">Conversación:</h3>
          {transcript.map((msg, idx) => (
            <div key={idx} className={`mb-2 text-sm ${msg.role === 'user' ? 'text-blue-300' : 'text-green-300'}`}>
              <strong>{msg.role === 'user' ? 'Niño' : 'Santa'}:</strong> {msg.text}
            </div>
          ))}
        </div>
      )}

      {/* Chat Mode Toggle Button (Desktop only - Bottom Left) */}
      <div className="hidden md:block absolute bottom-8 left-8">
        <button
          onClick={toggleChatMode}
          className="bg-white/90 hover:bg-white backdrop-blur-sm text-gray-900 font-semibold px-6 py-3 rounded-full transition-all duration-200 shadow-lg flex items-center gap-2"
          title={isChatMode ? 'Cambiar a Modo Voz' : 'Cambiar a Modo Chat'}
        >
          {isChatMode ? (
            <>
              <Mic className="w-5 h-5" />
              <span>Modo Voz</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5" />
              <span>Modo Chat</span>
            </>
          )}
        </button>
      </div>

      {/* Chat Bubble */}
      {isChatMode && (
        <div className="absolute bottom-24 right-8 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-christmas-red text-white px-6 py-4">
            <h3 className="font-bold text-lg">💬 Chat con Santa</h3>
            <p className="text-sm text-white/80">Escribe tu mensaje</p>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {transcript.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Escribe un mensaje para empezar</p>
              </div>
            ) : (
              transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg max-w-xs ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 border-2 border-christmas-red'
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {msg.role === 'user' ? childInfo.name : 'Santa 🎅'}
                    </p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t-2 border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
                className="bg-christmas-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls - iPhone style bottom bar */}
      <div className="absolute bottom-safe bottom-8 md:bottom-8 left-0 right-0 flex justify-center items-center gap-4 md:gap-6 px-4">
        {!isChatMode && (
          <button
            onClick={toggleMute}
            className={`rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-all duration-200 shadow-lg ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-white/90 hover:bg-white backdrop-blur-sm'
            }`}
            title={isMuted ? 'Activar Micrófono' : 'Silenciar'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 md:w-7 md:h-7 text-white" />
            ) : (
              <Mic className="w-6 h-6 md:w-7 md:h-7 text-gray-900" />
            )}
          </button>
        )}

        <button
          onClick={handleEndCall}
          className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 shadow-lg"
          title="Terminar Llamada"
        >
          <PhoneOff className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </button>
      </div>

      {/* Instructions overlay - hidden on mobile */}
      {!isChatMode && (
        <div className="hidden md:flex absolute bottom-32 left-0 right-0 justify-center">
          <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm">
            🎤 ¡Habla naturalmente para chatear con Santa!
          </div>
        </div>
      )}
    </div>
  );
}
