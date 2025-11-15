import { useState } from 'react';
import { Heart, Clock, Shield, Video, Sparkles, Mail, Star, Gift, Snowflake } from 'lucide-react';

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
    <div className="santa-landing">
      {/* Animated background elements */}
      <div className="snow-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="snowflake-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
              fontSize: `${10 + Math.random() * 20}px`,
              opacity: 0.3 + Math.random() * 0.7
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Snowflake className="w-4 h-4" />
            <span>Magia Navideña Auténtica</span>
            <Snowflake className="w-4 h-4" />
          </div>

          <h1 className="hero-title">
            <span className="title-line-1">Una Llamada</span>
            <span className="title-line-2">con Santa</span>
            <span className="title-line-3">que Nunca Olvidarán</span>
          </h1>

          <p className="hero-subtitle">
            Dale a tu hijo el regalo más mágico: una videollamada personalizada
            con Santa Claus en vivo, donde cada palabra es especial para él.
          </p>

          <div className="hero-cta">
            <button
              onClick={() => handleSelectPlan('premium')}
              disabled={isProcessing}
              className="cta-primary"
            >
              <span className="cta-text">
                {isProcessing ? 'Preparando la Magia...' : 'Crear Momento Mágico'}
              </span>
              <Star className="cta-icon" />
            </button>

            <div className="hero-trust-line">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Miles de familias felices</span>
              <span className="dot">•</span>
              <span>Desde $45 MXN</span>
            </div>
          </div>

          {/* Floating ornaments */}
          <div className="floating-ornaments">
            <div className="ornament ornament-1">🎄</div>
            <div className="ornament ornament-2">⭐</div>
            <div className="ornament ornament-3">🎁</div>
            <div className="ornament ornament-4">🔔</div>
          </div>
        </div>

        <div className="hero-image-container">
          <div className="hero-image-wrapper">
            <div className="image-frame">
              <img
                src="/image (2).png"
                alt="Santa Claus en videollamada"
                className="hero-image"
              />
              <div className="live-badge">
                <div className="live-dot"></div>
                <span>EN VIVO</span>
              </div>
            </div>

            {/* Decorative stamps */}
            <div className="stamp stamp-authentic">
              <div className="stamp-inner">
                <span>100%</span>
                <span>Auténtico</span>
              </div>
            </div>
            <div className="stamp stamp-magic">
              <div className="stamp-inner">
                <span>✨</span>
                <span>Mágico</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">Así Funciona la Magia</h2>
          <p className="section-subtitle">Tres pasos sencillos para crear un recuerdo inolvidable</p>
        </div>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3 className="step-title">Cuéntanos de Tu Hijo</h3>
            <p className="step-description">
              Comparte su nombre, edad y deseos. Santa personalizará cada palabra
              especialmente para él.
            </p>
          </div>

          <div className="step step-featured">
            <div className="step-number">2</div>
            <div className="step-icon">🎅</div>
            <h3 className="step-title">La Llamada Mágica</h3>
            <p className="step-description">
              Tu hijo habla con Santa en vivo. Verás sus ojos brillar cuando Santa
              mencione sus deseos por nombre.
            </p>
            <div className="sparkle-effect"></div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">💌</div>
            <h3 className="step-title">Carta Personalizada</h3>
            <p className="step-description">
              Recibe una hermosa carta de Santa por email. Imprímela y guárdala
              para siempre.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <Video className="feature-icon" />
            <h3>Video en Tiempo Real</h3>
            <p>Conversación interactiva con Santa, no es grabación</p>
          </div>

          <div className="feature-card">
            <Sparkles className="feature-icon" />
            <h3>100% Personalizado</h3>
            <p>Santa conoce su nombre, edad y todos sus deseos</p>
          </div>

          <div className="feature-card">
            <Clock className="feature-icon" />
            <h3>Disponible 24/7</h3>
            <p>Programa tu llamada cuando mejor te convenga</p>
          </div>

          <div className="feature-card">
            <Shield className="feature-icon" />
            <h3>Seguro para Niños</h3>
            <p>Conversaciones apropiadas y seguras</p>
          </div>

          <div className="feature-card">
            <Mail className="feature-icon" />
            <h3>Carta de Recuerdo</h3>
            <p>Hermosa carta personalizada incluida</p>
          </div>

          <div className="feature-card">
            <Heart className="feature-icon" />
            <h3>Memoria Eterna</h3>
            <p>Un momento mágico que atesorarán siempre</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section">
        <div className="section-header">
          <h2 className="section-title">Elige Tu Paquete Mágico</h2>
          <p className="section-subtitle">Cada plan incluye una experiencia única con Santa</p>
        </div>

        <div className="pricing-grid">
          {/* Mini */}
          <div className="pricing-card">
            <div className="pricing-icon">🎁</div>
            <h3 className="pricing-name">Mini Carta</h3>
            <div className="pricing-price">
              <span className="price-amount">$45</span>
              <span className="price-currency">MXN</span>
            </div>
            <div className="pricing-duration">5 minutos con Santa</div>

            <ul className="pricing-features">
              <li><span className="check">✓</span> Videollamada de 5 minutos</li>
              <li><span className="check">✓</span> Conversación personalizada</li>
              <li><span className="check">✓</span> Carta de Santa por email</li>
            </ul>

            <button
              onClick={() => handleSelectPlan('mini')}
              disabled={isProcessing}
              className="pricing-button"
            >
              Seleccionar
            </button>
          </div>

          {/* Premium */}
          <div className="pricing-card pricing-featured">
            <div className="popular-badge">
              <Star className="w-3 h-3 fill-current" />
              <span>MÁS POPULAR</span>
              <Star className="w-3 h-3 fill-current" />
            </div>
            <div className="pricing-icon">🎄</div>
            <h3 className="pricing-name">Carta Premium</h3>
            <div className="pricing-price">
              <span className="price-amount">$80</span>
              <span className="price-currency">MXN</span>
            </div>
            <div className="pricing-duration">10 minutos con Santa</div>

            <ul className="pricing-features">
              <li><span className="check">✓</span> Videollamada de 10 minutos</li>
              <li><span className="check">✓</span> Conversación extendida</li>
              <li><span className="check">✓</span> Carta premium por email</li>
              <li><span className="check">✓</span> Mención de deseos específicos</li>
            </ul>

            <button
              onClick={() => handleSelectPlan('premium')}
              disabled={isProcessing}
              className="pricing-button pricing-button-primary"
            >
              Seleccionar ⭐
            </button>
          </div>

          {/* VIP */}
          <div className="pricing-card">
            <div className="pricing-icon">👑</div>
            <h3 className="pricing-name">Experiencia VIP</h3>
            <div className="pricing-price">
              <span className="price-amount">$140</span>
              <span className="price-currency">MXN</span>
            </div>
            <div className="pricing-duration">20 minutos con Santa</div>

            <ul className="pricing-features">
              <li><span className="check">✓</span> Videollamada de 20 minutos</li>
              <li><span className="check">✓</span> Conversación profunda</li>
              <li><span className="check">✓</span> Carta VIP personalizada</li>
              <li><span className="check">✓</span> Video grabado de la llamada</li>
              <li><span className="check">✓</span> Mención del nombre en video</li>
            </ul>

            <button
              onClick={() => handleSelectPlan('vip')}
              disabled={isProcessing}
              className="pricing-button"
            >
              Seleccionar 👑
            </button>
          </div>
        </div>

        <div className="pricing-footer">
          <Shield className="w-5 h-5" />
          <span>Pago 100% seguro con Stripe</span>
          <span className="dot">•</span>
          <span>Satisfacción garantizada</span>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-content">
          <Gift className="cta-gift-icon" />
          <h2 className="cta-title">No Dejes Pasar Esta Navidad</h2>
          <p className="cta-description">
            Únete a miles de familias que han convertido esta Navidad en algo
            verdaderamente mágico. Un momento que tu hijo atesorará para siempre.
          </p>
          <button
            onClick={() => handleSelectPlan('premium')}
            disabled={isProcessing}
            className="cta-primary"
          >
            <span className="cta-text">
              {isProcessing ? 'Preparando...' : 'Crear Mi Momento Mágico'}
            </span>
            <Star className="cta-icon" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Llamada Mágica con Santa</p>
        <p className="footer-tagline">Hecho con ❤️ para crear magia navideña</p>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

        .santa-landing {
          font-family: 'Crimson Text', Georgia, serif;
          background: linear-gradient(180deg, #0f1f2e 0%, #1a2f3f 50%, #0f1f2e 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Snow Animation */
        .snow-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .snowflake-particle {
          position: absolute;
          top: -20px;
          color: #fff;
          animation: fall linear infinite;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 4rem;
          padding: 4rem 6rem;
          max-width: 1400px;
          margin: 0 auto;
          z-index: 2;
        }

        @media (max-width: 968px) {
          .hero-section {
            grid-template-columns: 1fr;
            padding: 3rem 2rem;
            gap: 3rem;
          }
        }

        .hero-content {
          position: relative;
          z-index: 3;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          padding: 0.5rem 1.5rem;
          font-size: 0.875rem;
          color: #f0e6d6;
          margin-bottom: 2rem;
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .title-line-1 {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 900;
          color: #f0e6d6;
          text-shadow: 2px 2px 0 #c41e3a, 4px 4px 20px rgba(196, 30, 58, 0.5);
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .title-line-2 {
          font-size: clamp(3.5rem, 8vw, 6rem);
          font-weight: 900;
          color: #c41e3a;
          text-shadow: 3px 3px 0 #165b33, 5px 5px 20px rgba(22, 91, 51, 0.5);
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
        }

        .title-line-3 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          color: #ffd700;
          text-shadow: 2px 2px 0 #8b6914, 4px 4px 20px rgba(255, 215, 0, 0.5);
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards;
        }

        @keyframes slideIn {
          from {
            transform: translateX(-50px);
            opacity: 0;
          }
        }

        .hero-subtitle {
          font-size: 1.25rem;
          line-height: 1.8;
          color: #e0d5c7;
          margin-bottom: 3rem;
          max-width: 600px;
          animation: fadeIn 1s ease 0.4s backwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
        }

        .hero-cta {
          animation: fadeIn 1s ease 0.6s backwards;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #c41e3a 0%, #a01528 100%);
          color: #fff;
          font-size: 1.25rem;
          font-weight: 600;
          padding: 1.25rem 2.5rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(196, 30, 58, 0.4),
                      inset 0 -2px 0 rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .cta-primary:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .cta-primary:hover:before {
          left: 100%;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(196, 30, 58, 0.6),
                      inset 0 -2px 0 rgba(0, 0, 0, 0.2);
        }

        .cta-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .cta-icon {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hero-trust-line {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          font-size: 0.95rem;
          color: #d0c5b8;
        }

        .dot {
          opacity: 0.5;
        }

        /* Floating ornaments */
        .floating-ornaments {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .ornament {
          position: absolute;
          font-size: 3rem;
          animation: float 6s ease-in-out infinite;
        }

        .ornament-1 {
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .ornament-2 {
          top: 30%;
          left: 85%;
          animation-delay: 1s;
        }

        .ornament-3 {
          bottom: 20%;
          left: 10%;
          animation-delay: 2s;
        }

        .ornament-4 {
          bottom: 40%;
          right: 5%;
          animation-delay: 3s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        /* Hero Image */
        .hero-image-container {
          position: relative;
          z-index: 2;
        }

        .hero-image-wrapper {
          position: relative;
          animation: fadeIn 1s ease 0.8s backwards;
        }

        .image-frame {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 0 0 8px #165b33,
            0 0 0 16px #c41e3a,
            0 30px 60px rgba(0, 0, 0, 0.5);
          transform: rotate(-2deg);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .image-frame:hover {
          transform: rotate(0deg) scale(1.05);
        }

        .hero-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .live-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(220, 20, 60, 0.95);
          backdrop-filter: blur(10px);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(220, 20, 60, 0.5);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* Stamps */
        .stamp {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 3px dashed currentColor;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(15deg);
          animation: stampIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 1.2s backwards;
        }

        @keyframes stampIn {
          from {
            transform: rotate(15deg) scale(0);
          }
        }

        .stamp-authentic {
          top: -30px;
          right: -30px;
          color: #ffd700;
          background: rgba(139, 105, 20, 0.2);
        }

        .stamp-magic {
          bottom: -30px;
          left: -30px;
          color: #c41e3a;
          background: rgba(196, 30, 58, 0.2);
        }

        .stamp-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-weight: 700;
          text-align: center;
        }

        .stamp-inner span:first-child {
          font-size: 1.5rem;
        }

        .stamp-inner span:last-child {
          font-size: 0.75rem;
        }

        /* How It Works */
        .how-it-works {
          padding: 8rem 6rem;
          background: linear-gradient(180deg, #0f1f2e 0%, #1a2f3f 100%);
          position: relative;
          z-index: 2;
        }

        @media (max-width: 968px) {
          .how-it-works {
            padding: 5rem 2rem;
          }
        }

        .section-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          color: #f0e6d6;
          margin-bottom: 1rem;
          text-shadow: 3px 3px 0 #c41e3a;
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: #d0c5b8;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .step {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 3rem 2rem;
          text-align: center;
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .step:hover {
          transform: translateY(-10px);
          border-color: rgba(255, 215, 0, 0.4);
          box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
        }

        .step-featured {
          background: rgba(196, 30, 58, 0.1);
          border-color: rgba(196, 30, 58, 0.3);
          transform: scale(1.05);
        }

        .step-featured:hover {
          transform: scale(1.08) translateY(-10px);
        }

        .step-number {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #c41e3a, #a01528);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          box-shadow: 0 4px 15px rgba(196, 30, 58, 0.5);
        }

        .step-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .step-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffd700;
          margin-bottom: 1rem;
        }

        .step-description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #d0c5b8;
        }

        .sparkle-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }

        .step-featured:hover .sparkle-effect {
          opacity: 1;
        }

        /* Features Section */
        .features-section {
          padding: 8rem 6rem;
          background: linear-gradient(180deg, #1a2f3f 0%, #0f1f2e 100%);
          position: relative;
          z-index: 2;
        }

        @media (max-width: 968px) {
          .features-section {
            padding: 5rem 2rem;
          }
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(22, 91, 51, 0.5);
          transform: translateY(-5px);
        }

        .feature-icon {
          width: 3rem;
          height: 3rem;
          color: #165b33;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #f0e6d6;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          color: #b0a594;
          line-height: 1.6;
        }

        /* Pricing Section */
        .pricing-section {
          padding: 8rem 6rem;
          background: linear-gradient(180deg, #0f1f2e 0%, #165b33 50%, #0f1f2e 100%);
          position: relative;
          z-index: 2;
        }

        @media (max-width: 968px) {
          .pricing-section {
            padding: 5rem 2rem;
          }
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto 3rem;
        }

        .pricing-card {
          background: rgba(240, 230, 214, 0.95);
          border-radius: 20px;
          padding: 2.5rem;
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .pricing-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .pricing-featured {
          background: linear-gradient(135deg, #fff8e1 0%, #ffe9b3 100%);
          transform: scale(1.08);
          border: 3px solid #ffd700;
        }

        .pricing-featured:hover {
          transform: scale(1.1) translateY(-10px);
        }

        .popular-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #8b6914;
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
        }

        .pricing-icon {
          font-size: 4rem;
          text-align: center;
          margin-bottom: 1rem;
        }

        .pricing-name {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #2c1810;
          text-align: center;
          margin-bottom: 1rem;
        }

        .pricing-price {
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .price-amount {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 900;
          color: #c41e3a;
        }

        .price-currency {
          font-size: 1.25rem;
          color: #6b4423;
        }

        .pricing-duration {
          text-align: center;
          font-size: 1rem;
          color: #6b4423;
          margin-bottom: 2rem;
          font-style: italic;
        }

        .pricing-features {
          list-style: none;
          margin-bottom: 2rem;
        }

        .pricing-features li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          color: #4a3426;
        }

        .check {
          color: #165b33;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .pricing-button {
          width: 100%;
          background: #6b4423;
          color: white;
          font-weight: 600;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(107, 68, 35, 0.3);
        }

        .pricing-button:hover {
          background: #4a3426;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(107, 68, 35, 0.4);
        }

        .pricing-button-primary {
          background: linear-gradient(135deg, #c41e3a, #a01528);
          box-shadow: 0 4px 15px rgba(196, 30, 58, 0.4);
        }

        .pricing-button-primary:hover {
          background: linear-gradient(135deg, #a01528, #7d0f1d);
        }

        .pricing-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .pricing-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #d0c5b8;
          font-size: 0.95rem;
        }

        /* Final CTA */
        .final-cta {
          padding: 8rem 6rem;
          background: linear-gradient(180deg, #0f1f2e 0%, #1a2f3f 100%);
          position: relative;
          z-index: 2;
        }

        @media (max-width: 968px) {
          .final-cta {
            padding: 5rem 2rem;
          }
        }

        .cta-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .cta-gift-icon {
          width: 5rem;
          height: 5rem;
          color: #ffd700;
          margin: 0 auto 2rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 900;
          color: #f0e6d6;
          margin-bottom: 1.5rem;
          text-shadow: 2px 2px 0 #c41e3a;
        }

        .cta-description {
          font-size: 1.25rem;
          line-height: 1.8;
          color: #d0c5b8;
          margin-bottom: 3rem;
        }

        /* Footer */
        .footer {
          background: #0a0f14;
          padding: 3rem 2rem;
          text-align: center;
          color: #6b7c8f;
          font-size: 0.95rem;
          position: relative;
          z-index: 2;
        }

        .footer-tagline {
          margin-top: 0.5rem;
          color: #4a5c6f;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
