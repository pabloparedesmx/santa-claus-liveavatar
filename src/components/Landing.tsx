import { useState } from 'react';
import { Heart, Clock, Shield, Video, Sparkles } from 'lucide-react';

export function Landing() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = async (plan: 'mini' | 'premium' | 'vip') => {
    try {
      setIsProcessing(true);

      // Create Stripe checkout session
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: plan,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-christmas-red via-red-700 to-red-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Snowflakes decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="snowflake">❄</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div className="text-center md:text-left">
              <span className="inline-block text-6xl mb-4 animate-bounce">🎅</span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                Una Videollamada Mágica
                <br />
                <span className="text-christmas-gold">Con Santa Claus</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Regala a tu hijo una experiencia navideña inolvidable con una
                conversación personalizada en vivo con Santa.
              </p>

              <div className="flex flex-col gap-4 items-center md:items-start mb-12">
                <button
                  onClick={() => {
                    const pricingSection = document.getElementById('pricing');
                    pricingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-christmas-green hover:bg-green-700 text-white font-bold text-xl px-12 py-5 rounded-xl transform hover:scale-110 transition-all shadow-2xl hover:shadow-green-500/50 border-2 border-green-400"
                >
                  Comienza la Magia ✨
                </button>
                <p className="text-white/80 text-sm">
                  Desde $100 MXN • Videollamada en vivo
                </p>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Pago Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>Miles de Familias Felices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Disponible 24/7</span>
                </div>
              </div>
            </div>

            {/* Right side - Santa Image */}
            <div className="hidden md:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src="/image (2).png"
                  alt="Santa Claus en videollamada"
                  className="w-full h-auto"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ⏱️ En vivo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Tres simples pasos para crear un recuerdo navideño mágico
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-christmas-red rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                📝
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Cuéntanos Sobre Tu Hijo</h3>
              <p className="text-gray-600">
                Comparte el nombre, edad, lista de deseos y cómo se ha portado este año.
                Santa personalizará la conversación especialmente para él.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-christmas-green rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🎥
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Conéctate Con Santa en Vivo</h3>
              <p className="text-gray-600">
                Tu hijo disfruta de una videollamada con Santa.
                ¡Mira cómo sus ojos se iluminan cuando Santa recuerda todo sobre él!
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-christmas-gold rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Crea un Recuerdo Inolvidable</h3>
              <p className="text-gray-600">
                Tu hijo vivirá una experiencia mágica hablando con Santa en persona.
                ¡Un momento que recordará para siempre!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            ¿Qué Hace Esto Especial?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Video className="w-12 h-12 text-christmas-red mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Experiencia de Video en Vivo</h3>
              <p className="text-gray-600">
                Conversación de video interactiva en tiempo real con calidad visual impresionante
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Sparkles className="w-12 h-12 text-christmas-gold mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Totalmente Personalizado</h3>
              <p className="text-gray-600">
                Santa conoce su nombre, deseos y logros de este año
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Heart className="w-12 h-12 text-christmas-red mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Memoria Eterna</h3>
              <p className="text-gray-600">
                Un momento mágico que tu hijo atesorará para siempre
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Clock className="w-12 h-12 text-christmas-red mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Disponible En Cualquier Momento</h3>
              <p className="text-gray-600">
                Agenda tu llamada cuando funcione para tu familia, 24/7
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Shield className="w-12 h-12 text-christmas-green mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Seguro y Protegido</h3>
              <p className="text-gray-600">
                Conversaciones seguras para niños con procesamiento de pago seguro
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Heart className="w-12 h-12 text-christmas-gold mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recuerdo Para Siempre</h3>
              <p className="text-gray-600">
                Crea un recuerdo navideño mágico que tu hijo nunca olvidará
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gradient-to-b from-christmas-red to-red-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Elige Tu Experiencia Mágica
          </h2>
          <p className="text-xl text-white/90 text-center mb-12">
            Planes diseñados para crear memorias inolvidables
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Mini */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎁</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Mini</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-christmas-red">$100</span>
                  <span className="text-gray-600 text-lg"> MXN</span>
                </div>
                <div className="bg-christmas-red/10 rounded-lg py-2 px-4 mb-4">
                  <p className="text-christmas-red font-bold text-2xl">5 minutos</p>
                  <p className="text-gray-600 text-sm">con Santa</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Videollamada de 5 minutos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Conversación personalizada</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Santa conoce sus deseos</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan('mini')}
                disabled={isProcessing}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '⏳ Procesando...' : 'Seleccionar'}
              </button>
            </div>

            {/* Plan Premium - POPULAR */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform scale-105 border-4 border-christmas-gold relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-christmas-gold text-white px-4 py-1 rounded-full text-sm font-bold">
                MÁS POPULAR
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎄</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Premium</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-christmas-red">$200</span>
                  <span className="text-gray-600 text-lg"> MXN</span>
                </div>
                <div className="bg-christmas-red/10 rounded-lg py-2 px-4 mb-4">
                  <p className="text-christmas-red font-bold text-2xl">10 minutos</p>
                  <p className="text-gray-600 text-sm">con Santa</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Videollamada de 10 minutos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Conversación extendida</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Más tiempo para conectar</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Mención de deseos específicos</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan('premium')}
                disabled={isProcessing}
                className="christmas-button w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '⏳ Procesando...' : 'Seleccionar ⭐'}
              </button>
            </div>

            {/* Experiencia VIP */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🧝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Experiencia VIP</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-christmas-red">$400</span>
                  <span className="text-gray-600 text-lg"> MXN</span>
                </div>
                <div className="bg-christmas-red/10 rounded-lg py-2 px-4 mb-4">
                  <p className="text-christmas-red font-bold text-2xl">20 minutos</p>
                  <p className="text-gray-600 text-sm">con Santa</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Videollamada de 20 minutos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Conversación profunda y personalizada</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Experiencia VIP completa</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Más temas y preguntas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">La experiencia más completa</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan('vip')}
                disabled={isProcessing}
                className="w-full bg-christmas-gold hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '⏳ Procesando...' : 'Seleccionar 👑'}
              </button>
            </div>
          </div>

          <p className="text-center text-white/80 text-sm mt-8">
            Pago seguro vía Stripe • Garantía de satisfacción
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            No Dejes Pasar Esta Navidad
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crea un momento mágico que tu hijo recordará para siempre.
            Únete a miles de familias que han hecho la Navidad más especial.
          </p>
          <button
            onClick={() => handleSelectPlan('premium')}
            disabled={isProcessing}
            className="christmas-button text-xl px-12 py-4 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '⏳ Procesando...' : 'Comienza Tu Aventura 🎄'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Llamada Mágica con Santa. Hecho con ❤️ para crear magia navideña.
          </p>
        </div>
      </div>
    </div>
  );
}
