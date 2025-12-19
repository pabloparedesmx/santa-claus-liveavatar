import { useState } from 'react';
import { Heart, Clock, Shield, Video, Sparkles } from 'lucide-react';
import { trackInitiateCheckout } from '../lib/metaPixel';

export function Landing() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = async (plan: 'mini' | 'premium' | 'vip') => {
    try {
      setIsProcessing(true);

      // Track InitiateCheckout event
      const planValues = {
        mini: 100,
        premium: 200,
        vip: 400
      };
      trackInitiateCheckout(plan, planValues[plan], 'MXN', 'landing_v1');

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left side - Text */}
            <div className="text-center md:text-left order-2 md:order-1">
              <span className="inline-block text-5xl md:text-6xl mb-3 md:mb-4 animate-bounce">🎅</span>
              <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
                Videollamada EN VIVO
                <br />
                <span className="text-christmas-gold">Con Santa Claus</span>
              </h1>
              <p className="text-lg md:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                <strong className="text-white">Santa conoce a tu hijo por su nombre</strong> y habla de sus deseos en una conversación REAL personalizada
              </p>

              <div className="flex flex-col gap-3 md:gap-4 items-center md:items-start mb-8 md:mb-12">
                <button
                  onClick={() => {
                    const pricingSection = document.getElementById('pricing');
                    pricingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full md:w-auto bg-christmas-green hover:bg-green-700 text-white font-bold text-lg md:text-xl px-8 md:px-12 py-4 md:py-5 rounded-xl transform hover:scale-105 md:hover:scale-110 transition-all shadow-2xl hover:shadow-green-500/50 border-2 border-green-400"
                >
                  Ver Planes - Desde $100 MXN 🎁
                </button>
                <p className="text-white/90 text-base md:text-sm font-semibold">
                  ✅ Pago seguro • ✅ Disponible ahora • ✅ 5, 10 o 20 minutos
                </p>
              </div>

              {/* Trust badges - Simplified for mobile */}
              <div className="hidden md:flex flex-wrap justify-center md:justify-start gap-6 text-white/70 text-sm">
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

            {/* Right side - Demo Image */}
            <div className="order-1 md:order-2">
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30">
                <img
                  src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&auto=format&fit=crop&q=80"
                  alt="Videollamada con Santa Claus - Experiencia mágica personalizada"
                  className="w-full h-auto"
                />

                {/* Live Badge */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  EN VIVO
                </div>

                {/* Example conversation overlay */}
                <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-lg">
                  <p className="text-gray-800 text-xs md:text-sm italic">
                    "¡Hola Sofía! He visto que has sido muy buena este año. Me contaron que ayudas mucho en casa y sacaste buenas calificaciones. ¿Me cuentas qué te gustaría recibir esta Navidad?"
                  </p>
                  <p className="text-gray-600 text-xs mt-1.5 md:mt-2 font-semibold">
                    - Conversación 100% personalizada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3 md:mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-base md:text-xl text-gray-600 text-center mb-10 md:mb-16 max-w-2xl mx-auto">
            Solo 3 pasos para la experiencia más mágica
          </p>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center bg-red-50 p-6 rounded-xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-christmas-red rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl shadow-lg">
                📝
              </div>
              <div className="bg-christmas-red text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                PASO 1
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Elige tu Plan y Paga</h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                Completa el formulario con el nombre de tu hijo, sus deseos y cómo se ha portado. <strong>Toma 2 minutos.</strong>
              </p>
            </div>

            <div className="text-center bg-green-50 p-6 rounded-xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-christmas-green rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl shadow-lg">
                🎥
              </div>
              <div className="bg-christmas-green text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                PASO 2
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Videollamada EN VIVO</h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                Santa llama a tu hijo <strong>por su nombre</strong> y habla de sus deseos. <strong>100% personalizado.</strong>
              </p>
            </div>

            <div className="text-center bg-yellow-50 p-6 rounded-xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-christmas-gold rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl shadow-lg">
                ✨
              </div>
              <div className="bg-christmas-gold text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                PASO 3
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Disfruta la Magia</h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                Ve la carita de tu hijo iluminarse cuando Santa lo llama por su nombre. <strong>Pura emoción navideña.</strong>
              </p>
            </div>
          </div>

          {/* Quick CTA after How It Works */}
          <div className="text-center mt-10 md:mt-12">
            <button
              onClick={() => {
                const pricingSection = document.getElementById('pricing');
                pricingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="bg-christmas-red hover:bg-red-700 text-white font-bold text-base md:text-lg px-8 md:px-10 py-3 md:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Sí, Quiero Esta Experiencia 🎅
            </button>
            <p className="text-gray-600 text-sm mt-3">Desde $100 MXN • Disponible HOY</p>
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
