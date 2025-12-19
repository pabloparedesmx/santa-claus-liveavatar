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
    additionalInfo?: string;
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
  const sessionTokenRef = useRef<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(timeLimitMinutes * 60);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [triggeredCheckpoints, setTriggeredCheckpoints] = useState<Set<number>>(new Set());

  useEffect(() => {
    initializeSession();

    // Countdown Timer
    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
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

  // Function to send guided prompt to Santa
  async function sendGuidedPrompt(promptText: string, checkpointName: string) {
    if (!sessionRef.current) {
      console.warn('⚠️ No session available to send prompt');
      return;
    }

    try {
      console.log(`📍 Checkpoint: ${checkpointName} - Sending guided prompt...`);

      // Send command event to LiveKit room topic "agent-control"
      // Using avatar.speak_response to let the LLM generate a natural response
      const commandEvent = {
        event_type: 'avatar.speak_response',
        text: promptText
      };

      // Publish to agent-control topic
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(commandEvent));

      // Access the LiveKit room (room property is private, so we need to cast)
      const session = sessionRef.current as any;
      if (session.room?.localParticipant) {
        await session.room.localParticipant.publishData(
          data,
          { topic: 'agent-control', reliable: true }
        );
        console.log(`✅ ${checkpointName} prompt sent successfully`);
      } else {
        console.warn('⚠️ Room or local participant not available');
      }
    } catch (error) {
      console.error(`❌ Error sending ${checkpointName} prompt:`, error);
    }
  }

  // Generate checkpoint prompts based on child info
  function getCheckpointPrompts() {
    const totalSeconds = timeLimitMinutes * 60;

    return [
      {
        // Checkpoint 1: Behavior discussion (2 minutes in = 180s elapsed, 120s remaining for 5min call)
        triggerAt: Math.floor(totalSeconds * 0.4), // 40% through the call
        name: 'Comportamiento',
        prompt: `Si aún no lo has hecho, busca una transición natural en la conversación para preguntarle a ${childInfo.name} cómo se ha portado este año. ${
          childInfo.behaviorNotes
            ? `Recuerda que sabes esto: "${childInfo.behaviorNotes}". Menciona estos detalles de forma positiva y orgullosa, como si realmente lo hubieras observado desde el Polo Norte.`
            : 'Pregúntale cómo se ha portado con su familia y en la escuela, mostrando curiosidad genuina.'
        } Haz que la transición se sienta como parte natural de tu conversación con él/ella.`
      },
      {
        // Checkpoint 2: Wish list (3 minutes in = 240s elapsed, 60s remaining for 5min call)
        triggerAt: Math.floor(totalSeconds * 0.6), // 60% through the call
        name: 'Deseos Navideños',
        prompt: `De manera fluida y natural, guía la conversación hacia lo que ${childInfo.name} desea para Navidad. ${
          childInfo.wishList
            ? `Ya sabes que quiere: "${childInfo.wishList}". Menciona estos deseos específicos como si los hubieras visto en tu lista mágica, y pregúntale con emoción por qué son especiales para él/ella.`
            : 'Pregúntale con entusiasmo qué le gustaría recibir esta Navidad y escucha con atención.'
        } Mantén el tono cálido y mágico mientras haces la transición.`
      },
      {
        // Checkpoint 3: Additional topics (4 minutes in = 240s elapsed, 60s remaining for 5min call)
        triggerAt: Math.floor(totalSeconds * 0.75), // 75% through the call
        name: 'Temas Adicionales',
        prompt: `Cuando sea apropiado, menciona de forma conversacional otros aspectos de la vida de ${childInfo.name}. ${
          childInfo.additionalInfo
            ? `Tienes información especial: "${childInfo.additionalInfo}". Incorpora naturalmente los temas más relevantes (mascotas, escuela, hobbies, amigos, etc.) como si los conocieras por tu magia navideña.`
            : childInfo.location
              ? `Habla sobre su ciudad ${childInfo.location} y pregúntale qué le gusta hacer allí.`
              : 'Pregúntale sobre sus pasatiempos favoritos y cosas que disfruta.'
        } Haz que se sienta como una conversación fluida, no como un cambio de tema abrupto.`
      },
      {
        // Checkpoint 4: Goodbye (35 seconds remaining)
        triggerAt: 35,
        name: 'Despedida',
        prompt: `Nuestro tiempo juntos está por terminar. Comienza tu despedida de manera cálida y emotiva. DEBES usar frases explícitas de despedida como "me tengo que ir", "debo regresar al Polo Norte", "nos vemos pronto", o "adiós". Recuérdale a ${childInfo.name} lo especial que es y desea una feliz Navidad. ${
          childInfo.wishList ? `Menciona que has anotado sus deseos: "${childInfo.wishList}" en tu lista especial.` : ''
        } Haz que ${childInfo.name} sepa claramente que te estás despidiendo y que la llamada está terminando.`
      }
    ];
  }

  // Function to stop session via backend API
  async function stopSessionViaAPI() {
    if (!sessionTokenRef.current) {
      console.warn('⚠️ No session token available to stop session');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      console.log('🛑 Calling backend to stop HeyGen session...');

      const response = await fetch(`${apiUrl}/stop-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: sessionTokenRef.current
        }),
      });

      if (response.ok) {
        console.log('✅ HeyGen session stopped via backend API');
      } else {
        console.error('❌ Failed to stop session via backend:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error calling stop-session API:', error);
    }
  }

  // Auto-trigger conversation checkpoints
  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    const checkpoints = getCheckpointPrompts();

    // Check each checkpoint
    checkpoints.forEach((checkpoint, index) => {
      // Check if we've reached this checkpoint time and haven't triggered it yet
      if (remainingSeconds === checkpoint.triggerAt && !triggeredCheckpoints.has(index)) {
        console.log(`⏰ Checkpoint ${index + 1}/${checkpoints.length}: ${checkpoint.name} (${remainingSeconds}s remaining)`);
        sendGuidedPrompt(checkpoint.prompt, checkpoint.name);

        // Mark this checkpoint as triggered
        setTriggeredCheckpoints(prev => new Set(prev).add(index));
      }
    });
  }, [remainingSeconds, connectionStatus, triggeredCheckpoints, childInfo, timeLimitMinutes]);

  // Auto-end session when time runs out
  useEffect(() => {
    if (remainingSeconds === 0 && connectionStatus === 'connected') {
      console.log('⏰ Time limit reached, ending session');
      const fullTranscript = transcript.map(m => `${m.role === 'user' ? 'Niño' : 'Santa'}: ${m.text}`).join('\n');

      // Stop client-side session
      if (sessionRef.current) {
        sessionRef.current.stop().catch(e => console.error('Error stopping client session:', e));
      }

      // Stop server-side session via API to ensure credits stop
      stopSessionViaAPI();

      setConnectionStatus('disconnected');
      onSessionEnd?.(fullTranscript);
    }
  }, [remainingSeconds, connectionStatus, transcript, onSessionEnd]);

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

      // Store session token for later use in stopping session
      sessionTokenRef.current = session_token;

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

          // Ensure video is playing with audio on mobile when connected
          if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play().catch(e => {
              console.warn('Autoplay policy prevented audio, user interaction may be needed:', e);
            });
          }
        } else if (state === SessionState.DISCONNECTED) {
          setConnectionStatus('disconnected');
        }
      });

      session.on(SessionEvent.SESSION_STREAM_READY, () => {
        console.log('Stream ready, attaching video element');
        if (videoRef.current) {
          session.attach(videoRef.current);

          // Ensure audio is unmuted and playing on mobile devices
          videoRef.current.muted = false;
          videoRef.current.play().catch(e => {
            console.warn('Autoplay failed, will retry on user interaction:', e);
          });
        }
      });

      session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        console.log('🎅 Santa started speaking');
      });

      session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, (data: any) => {
        console.log('🎅 Santa stopped speaking:', data);
      });

      session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => {
        console.log('👤 User started speaking');
      });

      session.on(AgentEventsEnum.USER_SPEAK_ENDED, (data: any) => {
        console.log('👤 User stopped speaking:', data);
      });

      // Server events for capturing accurate transcriptions
      (session as any).on('user.transcription_ended', (data: any) => {
        console.log('📝 USER TRANSCRIPT:', data);
        if (data?.text) {
          console.log('👤 User said:', data.text);
          setTranscript(prev => [...prev, {
            role: 'user',
            text: data.text,
            timestamp: Date.now()
          }]);
        }
      });

      (session as any).on('avatar.transcription_ended', (data: any) => {
        console.log('📝 AVATAR TRANSCRIPT:', data);
        if (data?.text) {
          console.log('🎅 Santa said:', data.text);
          setTranscript(prev => [...prev, {
            role: 'assistant',
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

      // Stop client-side session
      if (sessionRef.current) {
        try {
          await sessionRef.current.stop();
        } catch (e) {
          console.error('Error stopping client session:', e);
        }
      }

      // Stop server-side session via API to ensure credits stop
      await stopSessionViaAPI();

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
        muted={false}
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

      {/* Controls - iPhone style bottom bar */}
      <div className="absolute bottom-safe bottom-8 md:bottom-8 left-0 right-0 flex justify-center items-center gap-4 md:gap-6 px-4">
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

        <button
          onClick={handleEndCall}
          className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 shadow-lg"
          title="Terminar Llamada"
        >
          <PhoneOff className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </button>
      </div>

      {/* Instructions overlay - hidden on mobile */}
      <div className="hidden md:flex absolute bottom-32 left-0 right-0 justify-center">
        <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm">
          🎤 ¡Habla naturalmente para chatear con Santa!
        </div>
      </div>
    </div>
  );
}
