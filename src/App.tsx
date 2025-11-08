import { useState } from 'react';
import { AvatarChat } from './components/AvatarChat';

interface ChildInfo {
  name: string;
  age: number | null;
  location: string;
  wishList: string;
  behaviorNotes: string;
}

type AppState = 'form' | 'waiting' | 'chat' | 'completed';

function App() {
  const [appState, setAppState] = useState<AppState>('form');
  const [childInfo, setChildInfo] = useState<ChildInfo>({
    name: '',
    age: null,
    location: '',
    wishList: '',
    behaviorNotes: ''
  });
  const [sessionTranscript, setSessionTranscript] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childInfo.name) {
      alert('Please enter the child\'s name');
      return;
    }
    setAppState('waiting');
    // Simulate waiting period
    setTimeout(() => {
      setAppState('chat');
    }, 3000);
  };

  const handleSessionEnd = (transcript: string) => {
    setSessionTranscript(transcript);
    setAppState('completed');
  };

  // Form State
  if (appState === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-christmas-red via-red-700 to-christmas-green flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">🎅</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Meet Santa Claus Live!
            </h1>
            <p className="text-lg text-gray-600">
              Tell us about your child for a personalized experience
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Child's Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={childInfo.name}
                onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
                placeholder="Emma"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Age (optional)
              </label>
              <select
                value={childInfo.age || ''}
                onChange={(e) => setChildInfo({ ...childInfo, age: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
              >
                <option value="">Select age...</option>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                  <option key={age} value={age}>{age} years old</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location/City (optional)
              </label>
              <input
                type="text"
                value={childInfo.location}
                onChange={(e) => setChildInfo({ ...childInfo, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
                placeholder="Denver, Colorado"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What does {childInfo.name || 'your child'} wish for this Christmas? (optional)
              </label>
              <textarea
                value={childInfo.wishList}
                onChange={(e) => setChildInfo({ ...childInfo, wishList: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
                rows={3}
                placeholder="A doll, books, art supplies..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How has {childInfo.name || 'your child'} been this year? (optional)
              </label>
              <textarea
                value={childInfo.behaviorNotes}
                onChange={(e) => setChildInfo({ ...childInfo, behaviorNotes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-christmas-red focus:outline-none text-lg"
                rows={3}
                placeholder="Very kind to siblings, loves to help around the house..."
              />
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-5 h-5 text-christmas-red focus:ring-christmas-red"
                />
                <span className="text-sm text-gray-700">
                  I consent to this session being recorded for the purpose of generating a personalized letter.
                  Session data will be deleted after 72 hours.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-christmas-red hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
            >
              🎄 Meet Santa Now! 🎄
            </button>
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
            Santa is getting ready for you...
          </h2>
          <p className="text-2xl text-white/90 mb-8">
            {childInfo.name}, get ready for something magical!
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
    return <AvatarChat childInfo={childInfo} onSessionEnd={handleSessionEnd} />;
  }

  // Completed State
  if (appState === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-christmas-green via-green-700 to-christmas-gold flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-7xl mb-6">🎄</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What a wonderful visit with Santa! 🎅
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Santa is writing {childInfo.name}'s personalized letter right now!
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-lg text-gray-700 mb-2">
              📧 You'll receive the letter via email within the next hour
            </p>
            <p className="text-sm text-gray-500">
              (Check your spam folder if you don't see it)
            </p>
          </div>

          {sessionTranscript && (
            <details className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                View Conversation Transcript
              </summary>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {sessionTranscript}
              </pre>
            </details>
          )}

          <button
            onClick={() => {
              setAppState('form');
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
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
