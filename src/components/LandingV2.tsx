import { useState, useEffect, useRef } from 'react';
import { Heart, Clock, Shield, Video, Sparkles } from 'lucide-react';
import { trackInitiateCheckout } from '../lib/metaPixel';
import { CountdownTimer } from './CountdownTimer';

export function LandingV2() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [spacesLeft] = useState(47); // Dynamic number - can be updated from API
  const [familiesCount] = useState(1234); // Dynamic number - can be updated from API
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoQuality, setVideoQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [showVideo, setShowVideo] = useState(false); // Set to true when video files are available
  
  // Target date: next December 24th at 23:59:59 (auto-rolls each year)
  const targetDate = (() => {
    const now = new Date();
    const year = now.getMonth() > 11 || (now.getMonth() === 11 && now.getDate() > 24)
      ? now.getFullYear() + 1
      : now.getFullYear();
    return new Date(`${year}-12-24T23:59:59`);
  })();

  // Auto-detect connection quality
  useEffect(() => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        const effectiveType = conn.effectiveType;
        if (effectiveType === '4g' || effectiveType === '3g') {
          setVideoQuality('high');
        } else if (effectiveType === '2g') {
          setVideoQuality('low');
        }
      }
    }
  }, []);

  // Handle video error - fallback to iframe
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleError = () => {
        setShowVideo(false);
      };
      video.addEventListener('error', handleError);
      return () => video.removeEventListener('error', handleError);
    }
  }, []);

  // Lazy load sections below the fold
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.removeAttribute('data-lazy');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    const lazyElements = document.querySelectorAll('[data-lazy="true"]');
    lazyElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSelectPlan = async (plan: 'mini' | 'premium' | 'vip') => {
    try {
      setIsProcessing(true);

      // Track InitiateCheckout event
      const planValues = {
        mini: 100,
        premium: 150, // Updated to $150 for Plan Navidad
        vip: 400
      };
      trackInitiateCheckout(plan, planValues[plan], 'MXN', 'landing_v2');

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
      {/* Hero Section - NEW DESIGN */}
      <div className="relative overflow-hidden">
        {/* Snowflakes decoration */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="snowflake">❄</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-12 md:pb-16 relative z-10">
          {/* Video Demo - Auto-play muted */}
          <div className="mb-8 md:mb-12">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 bg-black">
              {showVideo ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full"
                  style={{ aspectRatio: '16/9' }}
                  preload="auto"
                >
                  {/* Video sources in 3 qualities - replace with actual video URLs */}
                  <source 
                    src={videoQuality === 'high' ? '/videos/demo-high.mp4' : videoQuality === 'medium' ? '/videos/demo-medium.mp4' : '/videos/demo-low.mp4'} 
                    type="video/mp4" 
                  />
                </video>
              ) : (
                <iframe
                  ref={iframeRef}
                  src="https://embed.liveavatar.com/v1/0a1803c9-d41e-418d-9d63-0df73f26af9b"
                  allow="microphone"
                  title="Demo en vivo - Habla con Santa ahora GRATIS"
                  className="w-full"
                  style={{ aspectRatio: '16/9', border: 'none' }}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6 md:space-y-8">
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg leading-tight">
              🎅 Videollamada REAL con Santa
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-3xl text-white/95 font-semibold">
              Tu hijo habla con Santa por su nombre
            </p>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border-2 border-white/20 max-w-2xl mx-auto">
              <p className="text-white text-lg md:text-xl italic mb-2">
                "Mi hija lloró de emoción"
              </p>
              <p className="text-white/80 text-sm md:text-base">
                - María, CDMX
              </p>
            </div>

            {/* Urgency Banner */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-xl animate-pulse max-w-3xl mx-auto">
              <p className="text-lg md:text-2xl font-bold">
                ⏰ ÚLTIMOS DÍAS - Solo hasta el 22 de diciembre
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="py-4">
              <p className="text-white text-sm md:text-base mb-3 font-semibold">Tiempo restante para que llegue Santa Claus:</p>
              <CountdownTimer targetDate={targetDate} />
            </div>

            {/* Urgency Stats */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-red-600/80 backdrop-blur-sm rounded-lg p-4 border-2 border-white/20">
                <p className="text-white text-2xl md:text-3xl font-bold">{spacesLeft}</p>
                <p className="text-white/90 text-xs md:text-sm">espacios hoy</p>
              </div>
              <div className="bg-green-600/80 backdrop-blur-sm rounded-lg p-4 border-2 border-white/20">
                <p className="text-white text-2xl md:text-3xl font-bold">{familiesCount.toLocaleString()}</p>
                <p className="text-white/90 text-xs md:text-sm">familias confiaron</p>
              </div>
            </div>

            {/* CTA GIGANTE */}
            <div className="pt-4">
              <button
                onClick={() => {
                  const pricingSection = document.getElementById('pricing');
                  pricingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-2xl md:text-3xl px-8 md:px-12 py-5 md:py-6 rounded-2xl transform hover:scale-105 transition-all shadow-2xl hover:shadow-green-500/50 border-4 border-green-400 animate-bounce"
              >
                Hablar Ahora - Desde $100
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-12 md:py-20" data-lazy="true">
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
      <div className="bg-red-50 py-20" data-lazy="true">
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
          {/* Urgency Banner */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-xl max-w-2xl mx-auto mb-8 text-center">
            <p className="text-lg md:text-xl font-bold">
              ⏰ ÚLTIMOS DÍAS - Solo hasta el 22 de diciembre
            </p>
            <div className="mt-4">
              <CountdownTimer targetDate={targetDate} />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Elige Tu Experiencia Mágica
          </h2>
          <p className="text-xl text-white/90 text-center mb-4">
            Plan Navidad - La experiencia perfecta
          </p>
          <p className="text-sm text-white/70 text-center mb-12">
            Solo quedan {spacesLeft} espacios hoy • Ya confiaron en nosotros {familiesCount.toLocaleString()} familias
          </p>

          <div className="max-w-md mx-auto">
            {/* Plan Navidad - ÚNICO */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform border-4 border-christmas-gold relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-christmas-gold text-white px-6 py-2 rounded-full text-sm font-bold">
                PLAN NAVIDAD
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎄</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Navidad</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-christmas-red">$150</span>
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
                  <span className="text-gray-700 text-sm">Santa conoce su nombre</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Conversación personalizada</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Mención de deseos específicos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-christmas-green text-lg">✓</span>
                  <span className="text-gray-700 text-sm">Experiencia mágica garantizada</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan('premium')}
                disabled={isProcessing}
                className="christmas-button w-full py-4 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
              >
                {isProcessing ? '⏳ Procesando...' : 'Hablar Ahora ⭐'}
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

