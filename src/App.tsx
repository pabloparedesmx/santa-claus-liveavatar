import { useState, useEffect } from 'react';
import { AvatarChat } from './components/AvatarChat';
import { Landing } from './components/Landing';

interface ChildInfo {
  name: string;
  age: number | null;
  location: string;
  wishList: string;
  behaviorNotes: string;
}

type AppState = 'landing' | 'form' | 'waiting' | 'chat' | 'completed';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [childInfo, setChildInfo] = useState<ChildInfo>({
    name: '',
    age: null,
    location: '',
    wishList: '',
    behaviorNotes: ''
  });
  const [sessionTranscript, setSessionTranscript] = useState('');
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [heygenContextId, setHeygenContextId] = useState<string>('');

  // Check for session_id in URL (redirect from Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      setStripeSessionId(sessionId);
      setAppState('form');
      loadSessionData(sessionId);
    }
  }, []);

  const loadSessionData = async (sessionId: string) => {
    try {
      setIsLoadingSession(true);

      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/session/${sessionId}`);

      if (!response.ok) {
        throw new Error('Failed to load session');
      }

      const data = await response.json();

      // If child info already exists (shouldn't happen in new flow, but just in case)
      if (data.child_info?.name) {
        setChildInfo({
          name: data.child_info.name,
          age: data.child_info.age,
          location: data.child_info.location,
          wishList: data.child_info.wishList,
          behaviorNotes: data.child_info.behaviorNotes,
        });
      }

      setIsLoadingSession(false);

    } catch (error) {
      console.error('Error loading session:', error);
      alert('Error al cargar la sesión. Por favor contacta a soporte.');
      setIsLoadingSession(false);
      setAppState('landing');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!childInfo.name) {
      alert('Por favor ingresa el nombre del niño/niña');
      return;
    }

    // If no stripe session, user didn't pay - redirect to landing
    if (!stripeSessionId) {
      alert('Por favor selecciona un plan y completa el pago primero');
      setAppState('landing');
      return;
    }

    try {
      setIsLoadingSession(true);

      // Update session with child information
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/session/${stripeSessionId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child_name: childInfo.name,
          child_age: childInfo.age,
          child_location: childInfo.location,
          wish_list: childInfo.wishList,
          behavior_notes: childInfo.behaviorNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      const data = await response.json();
      console.log('✅ Child info saved');

      // Store the context_id if available
      if (data.context_id) {
        setHeygenContextId(data.context_id);
        console.log('✅ Context ID received:', data.context_id);
      }

      // Show waiting screen
      setAppState('waiting');

      // Transition to chat after short delay
      setTimeout(() => {
        setAppState('chat');
        setIsLoadingSession(false);
      }, 3000);

    } catch (error) {
      console.error('Error updating session:', error);
      alert('Error al guardar la información. Por favor intenta de nuevo.');
      setIsLoadingSession(false);
    }
  };

  const handleSessionEnd = (transcript: string) => {
    setSessionTranscript(transcript);
    setAppState('completed');
  };

  // Landing Page State
  if (appState === 'landing') {
    return <Landing />;
  }

  // Form State
  if (appState === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-christmas-red via-red-700 to-christmas-green flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">🎅</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ¡Conoce a Santa Claus en Vivo!
            </h1>
            <p className="text-lg text-gray-600">
              Cuéntanos sobre tu hijo para una experiencia personalizada
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-center font-semibold">
                ✅ ¡Pago completado exitosamente!
              </p>
              <p className="text-green-700 text-sm text-center mt-1">
                Ahora cuéntanos sobre tu hijo para personalizar la experiencia
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del niño/niña <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={childInfo.name}
                onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
                placeholder="María"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Edad (opcional)
              </label>
              <select
                value={childInfo.age || ''}
                onChange={(e) => setChildInfo({ ...childInfo, age: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
              >
                <option value="">Selecciona la edad...</option>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                  <option key={age} value={age}>{age} años</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ubicación/Ciudad (opcional)
              </label>
              <input
                type="text"
                value={childInfo.location}
                onChange={(e) => setChildInfo({ ...childInfo, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
                placeholder="Ciudad de México"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ¿Qué desea {childInfo.name || 'tu hijo'} para esta Navidad? (opcional)
              </label>
              <textarea
                value={childInfo.wishList}
                onChange={(e) => setChildInfo({ ...childInfo, wishList: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
                rows={3}
                placeholder="Una muñeca, libros, juguetes..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ¿Cómo se ha portado {childInfo.name || 'tu hijo'} este año? (opcional)
              </label>
              <textarea
                value={childInfo.behaviorNotes}
                onChange={(e) => setChildInfo({ ...childInfo, behaviorNotes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
                rows={3}
                placeholder="Muy amable con sus hermanos, le encanta ayudar en casa..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingSession}
              className="w-full bg-christmas-red hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingSession ? '⏳ Preparando videollamada...' : '🎄 Iniciar Videollamada con Santa 🎅'}
            </button>
            <p className="text-center text-sm text-gray-600">
              Recibirás la carta personalizada por email después de la llamada
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Waiting Room State
  if (appState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-christmas-red via-red-700 to-christmas-green flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-9xl mb-8 animate-bounce">🎅</div>
          <h2 className="text-5xl font-bold text-white mb-4">
            Santa se está preparando para ti...
          </h2>
          <p className="text-2xl text-white/90 mb-8">
            ¡{childInfo.name}, prepárate para algo mágico!
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Avatar Chat State
  if (appState === 'chat') {
    return <AvatarChat childInfo={childInfo} contextId={heygenContextId} onSessionEnd={handleSessionEnd} />;
  }

  // Completed State
  if (appState === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-christmas-green via-green-700 to-christmas-gold flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-7xl mb-6">🎄</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Qué maravillosa visita con Santa! 🎅
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            ¡Santa está escribiendo la carta personalizada de {childInfo.name} ahora mismo!
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-lg text-gray-700 mb-2">
              📧 Recibirás la carta por email dentro de la próxima hora
            </p>
            <p className="text-sm text-gray-500">
              (Revisa tu carpeta de spam si no la ves)
            </p>
          </div>

          {sessionTranscript && (
            <details className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                Ver Transcripción de la Conversación
              </summary>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {sessionTranscript}
              </pre>
            </details>
          )}

          <button
            onClick={() => {
              setAppState('landing');
              setChildInfo({
                name: '',
                age: null,
                location: '',
                wishList: '',
                behaviorNotes: ''
              });
            }}
            className="christmas-button"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
