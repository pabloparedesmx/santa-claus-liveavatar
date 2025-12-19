import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
config();

const app = express();
const PORT = 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Middleware
app.use(cors());

// IMPORTANT: Stripe webhook needs raw body, so we apply it before express.json()
app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// HeyGen API configuration
const HEYGEN_API_URL = 'https://api.liveavatar.com';
const API_KEY = process.env.VITE_HEYGEN_API_KEY;

// Parent goal configurations
const PARENT_GOALS = {
  encourage: {
    objective: "Animar y motivar al niño, haciéndolo sentir especial y valorado",
    closing: "Termina expresando lo orgulloso que estás de ellos y lo especiales que son"
  },
  confirm_gifts: {
    objective: "Confirmar que traerás sus regalos en Nochebuena, generando emoción y anticipación",
    closing: "Termina confirmando que sus deseos están en tu lista y que visitarás su hogar en Nochebuena"
  },
  improve_behavior: {
    objective: "Motivar al niño a mejorar su comportamiento de manera positiva y alentadora",
    closing: "Termina recordándole gentilmente que aún tiene tiempo para demostrar su mejor comportamiento antes de Navidad"
  },
  acknowledge_achievements: {
    objective: "Reconocer y celebrar los logros y esfuerzos del niño durante el año",
    closing: "Termina celebrando sus logros y expresando lo orgulloso que estás de su esfuerzo"
  },
  inspire_kindness: {
    objective: "Inspirar al niño a ser más amable, generoso y pensar en los demás",
    closing: "Termina recordándole que el verdadero espíritu navideño está en dar y compartir con otros"
  }
};

// Plan configurations
const PLANS = {
  standard: {
    name: 'Videollamada con Santa',
    price: 15000, // $150 MXN in centavos
    time_minutes: 5,
    heygen_credits: 10,
    features: [
      'Videollamada EN VIVO de 5 minutos',
      'Santa conoce el nombre de tu hijo',
      'Conversación 100% personalizada',
      'Menciona sus deseos y cómo se ha portado',
      'Disponible 24/7 - Comienza ahora mismo'
    ]
  }
};

// Function to create/get the 100SANTA coupon
async function ensureSantaCoupon() {
  try {
    // Try to retrieve existing coupon
    const existingCoupon = await stripe.coupons.retrieve('100SANTA').catch(() => null);

    if (existingCoupon) {
      console.log('✅ Cupón 100SANTA ya existe');
      return existingCoupon;
    }

    // Create new coupon if it doesn't exist
    const coupon = await stripe.coupons.create({
      id: '100SANTA',
      percent_off: 100,
      duration: 'forever',
      name: 'Cupón Navideño 100% Descuento',
      metadata: {
        description: 'Cupón de 100% descuento para videollamada con Santa Claus'
      }
    });

    console.log('✅ Cupón 100SANTA creado exitosamente');
    return coupon;
  } catch (error) {
    console.error('❌ Error al crear cupón 100SANTA:', error.message);
    throw error;
  }
}

// Ensure coupon exists on server start
ensureSantaCoupon();

// Stripe Checkout Session endpoint (just plan selection, no child info yet)
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { plan_type } = req.body;

    // Validate plan
    if (!PLANS[plan_type]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const plan = PLANS[plan_type];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: plan.name,
              description: `Videollamada personalizada de ${plan.time_minutes} minutos con Santa Claus en vivo`,
              images: ['https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400'],
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true, // Permite que el usuario ingrese cupones como 100SANTA
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?cancelled=true`,
      metadata: {
        plan_type,
        time_limit_minutes: plan.time_minutes,
        heygen_credits: plan.heygen_credits,
      },
    });

    console.log('✅ Stripe checkout session created:', session.id);

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook endpoint
app.post('/api/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('💰 Payment successful!', {
      session_id: session.id,
      payment_intent: session.payment_intent,
      customer_email: session.customer_email,
      amount: session.amount_total / 100,
      plan: session.metadata.plan_type
    });

    // TODO: Store session in Supabase here
    // For now, just log it
    console.log('📋 Session data to store:', {
      stripe_checkout_session_id: session.id,
      payment_intent_id: session.payment_intent,
      customer_email: session.customer_email,
      amount_paid: session.amount_total,
      plan_type: session.metadata.plan_type,
      time_limit_minutes: session.metadata.time_limit_minutes,
      child_name: session.metadata.child_name,
      child_age: session.metadata.child_age,
      child_location: session.metadata.child_location,
      wish_list: session.metadata.wish_list,
      behavior_notes: session.metadata.behavior_notes,
      status: 'pending'
    });
  }

  res.json({ received: true });
});

// Get session data by Stripe checkout session ID
app.get('/api/session/:checkout_session_id', async (req, res) => {
  try {
    const { checkout_session_id } = req.params;

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(checkout_session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Return session data
    res.json({
      session_id: checkout_session_id,
      customer_email: session.customer_email,
      plan_type: session.metadata.plan_type,
      time_limit_minutes: parseInt(session.metadata.time_limit_minutes),
      heygen_credits: parseInt(session.metadata.heygen_credits),
      heygen_context_id: session.metadata.heygen_context_id || '',
      child_info: {
        name: session.metadata.child_name || '',
        age: session.metadata.child_age ? parseInt(session.metadata.child_age) : null,
        location: session.metadata.child_location || '',
        wishList: session.metadata.wish_list || '',
        behaviorNotes: session.metadata.behavior_notes || '',
      },
      status: 'pending',
      used: false
    });

  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update session with child information (after form is filled)
app.post('/api/session/:checkout_session_id/update', async (req, res) => {
  try {
    const { checkout_session_id } = req.params;
    const {
      child_name,
      child_age,
      child_location,
      wish_list,
      behavior_notes,
      additional_info,
      parent_goal
    } = req.body;

    if (!child_name) {
      return res.status(400).json({ error: 'Child name is required' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(checkout_session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Create HeyGen context with child information
    console.log('=== CREATING HEYGEN CONTEXT ===');
    console.log('Child name:', child_name);
    const planType = session.metadata.plan_type;
    const plan = PLANS[planType] || PLANS.mini;
    console.log('Plan type:', planType, '- Duration:', plan.time_minutes, 'minutes');
    let contextId = '';

    if (API_KEY) {
      try {
        // Get parent goal configuration
        const goalConfig = PARENT_GOALS[parent_goal] || PARENT_GOALS.encourage;

        // Build topic list dynamically based on what we know
        const topicsToMention = [];
        if (wish_list) topicsToMention.push(`sus deseos navideños (${wish_list})`);
        if (behavior_notes) topicsToMention.push(`cómo se ha portado (${behavior_notes})`);
        if (additional_info) {
          // Parse additional_info for specific topics
          if (additional_info.toLowerCase().includes('mascota')) topicsToMention.push('su mascota');
          if (additional_info.toLowerCase().includes('escuela')) topicsToMention.push('la escuela');
          if (additional_info.toLowerCase().includes('hobbi')) topicsToMention.push('sus hobbies');
          if (additional_info.toLowerCase().includes('amigo')) topicsToMention.push('sus amigos');
        }

        // Format the Santa context text with conversational structure
        const contextText = `
##PERSONA:

Eres Santa Claus, el alegre repartidor de regalos del Polo Norte.
Hablas español naturalmente y de forma conversacional con los niños.
Eres cálido, alentador, amable y lleno de espíritu navideño.

##INFORMACIÓN DEL NIÑO:

Nombre: ${child_name}${child_age ? `
Edad: ${child_age} años` : ''}${child_location ? `
Ubicación: ${child_location}` : ''}${wish_list ? `
Deseos de Navidad: ${wish_list}` : ''}${behavior_notes ? `
Comportamiento este año: ${behavior_notes}` : ''}${additional_info ? `
Contexto adicional: ${additional_info}` : ''}

##OBJETIVO DE LA CONVERSACIÓN:

${goalConfig.objective}

##ESTRUCTURA CONVERSACIONAL - SIGUE ESTE FLUJO:

IMPORTANTE: Debes ser PROACTIVO y mencionar estos temas durante la conversación, NO esperes a que el niño los mencione primero.

FASE 1 - Saludo y Conexión Inicial (primeros 1-2 minutos):
- Saluda calurosamente a ${child_name} y pregunta cómo se siente con la Navidad acercándose
- Pregunta sobre sus tradiciones navideñas o decoraciones
- Establece una conexión cálida y mágica

FASE 2 - Exploración Proactiva (60-70% del tiempo):
Debes MENCIONAR PROACTIVAMENTE estos temas específicos durante la conversación:
${topicsToMention.length > 0 ? topicsToMention.map((topic, i) => `${i + 1}. ${topic} - Pregunta sobre esto de forma natural y muestra interés genuino`).join('\n') : '- Pregunta sobre su año, escuela, amigos y actividades favoritas'}
- Si mencionan algo interesante, haz preguntas de seguimiento
- Comparte brevemente historias del Polo Norte relacionadas con lo que comparten
- Celebra sus logros y buenos comportamientos

FASE 3 - Cierre Significativo (últimos 1-2 minutos):
${goalConfig.closing}
- Menciona la emoción de Nochebuena
- Despídete con cariño y "¡Feliz Navidad!"

##REGLAS DE CONVERSACIÓN:

PROACTIVIDAD: Si el niño no menciona algo de su información (mascota, hobbies, escuela, etc.), TÚ debes preguntarle sobre eso. No seas pasivo.

RESPUESTAS CORTAS: ${planType === 'mini' ? '1-2 oraciones máximo' : planType === 'premium' ? '2-3 oraciones máximo' : '3-4 oraciones máximo'}. Máximo 30 palabras por oración.

NATURALIDAD: Habla como en una conversación real. Usa "Ho, Ho, Ho!" ocasionalmente pero no en cada respuesta.

MANEJO DE ERRORES: Si no entiendes algo, di "no escuché bien eso" o "¿puedes repetir?" de forma natural.

SOLO HABLA: NO uses asteriscos, NO describas acciones (*guiña*, *ríe*, etc.). Solo di palabras que Santa diría en voz alta.

SEGURIDAD: Nunca pidas información personal. Evita política, religión, contenido asustadizo. Si mencionan tristeza, responde con empatía y redirige suavemente a temas navideños positivos.

DURACIÓN: ${planType === 'mini' ? 'Conversación de 5 minutos - sé conciso pero significativo' : planType === 'premium' ? 'Conversación de 10 minutos - profundiza más en los temas' : 'Conversación VIP de 20 minutos - conoce profundamente al niño, comparte más historias'}

##INICIO:

Comienza saludando: "¡Ho, Ho, Ho! ¡Hola ${child_name}! ¡Qué alegría verte desde el Polo Norte!"
        `.trim();

        console.log('Calling HeyGen API to create context...');

        // CREATE new context for this child with timestamp for uniqueness
        const timestamp = Date.now();
        const contextName = `Santa context for ${child_name} - ${timestamp}`;
        const openingText = `Ho ho ho! ¡Hola ${child_name}! ¡Feliz Navidad desde el Polo Norte!`;

        const contextResponse = await fetch(`${HEYGEN_API_URL}/v1/contexts`, {
          method: 'POST',
          headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: contextName,
            prompt: contextText,
            opening_text: openingText
          }),
        });

        const contextResponseText = await contextResponse.text();
        console.log('HeyGen context API status:', contextResponse.status);
        console.log('HeyGen context API response:', contextResponseText);

        if (contextResponse.ok) {
          const contextData = JSON.parse(contextResponseText);
          contextId = contextData.data?.id || contextData.id;
          console.log('✅ Context created successfully:', contextId);
        } else {
          console.error('❌ Failed to create context:', contextResponseText);
        }
      } catch (contextError) {
        console.error('❌ Error creating context:', contextError);
        // Continue even if context creation fails
      }
    } else {
      console.warn('⚠️ No API_KEY found, skipping context creation');
    }

    // Update session metadata
    await stripe.checkout.sessions.update(checkout_session_id, {
      metadata: {
        ...session.metadata,
        child_name,
        child_age: child_age?.toString() || '',
        child_location: child_location || '',
        wish_list: wish_list || '',
        behavior_notes: behavior_notes || '',
        additional_info: additional_info || '',
        heygen_context_id: contextId || '',
      },
    });

    console.log('✅ Session updated with child info:', checkout_session_id);
    if (contextId) {
      console.log('✅ Context ID saved:', contextId);
    }

    // TODO: Also update in Supabase when we add it

    res.json({
      success: true,
      context_id: contextId
    });

  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create HeyGen session endpoint
app.post('/api/create-session', async (req, res) => {
  try {
    const { avatar_id, avatar_persona } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    console.log('Creating HeyGen session with:', {
      avatar_id,
      voice_id: avatar_persona.voice_id,
      has_context: !!avatar_persona.context,
      language: avatar_persona.language
    });

    // Session payload - match demo format exactly
    const payload = {
      mode: 'FULL',
      avatar_id,
      avatar_persona,
    };

    console.log('Request payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${HEYGEN_API_URL}/v1/sessions/token`, {
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('HeyGen API response status:', response.status);
    console.log('HeyGen API response:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }
      const errorMessage = errorData?.data?.[0]?.message || errorData?.message || errorData?.error || 'Failed to create session';
      console.error('HeyGen API error:', errorMessage, errorData);
      return res.status(response.status).json({ error: errorMessage, details: errorData });
    }

    const data = JSON.parse(responseText);
    console.log('Session created successfully:', data.data?.session_id);

    res.json({
      session_token: data.data.session_token,
      session_id: data.data.session_id,
    });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEST endpoint to create a context manually
app.post('/api/test-create-context', async (req, res) => {
  try {
    console.log('=== TEST: Creating HeyGen Context ===');

    if (!API_KEY) {
      return res.status(500).json({ error: 'HeyGen API key not configured' });
    }

    // Hardcoded test context with timestamp to ensure uniqueness
    const timestamp = Date.now();
    const testContext = `
You are Santa Claus speaking with Maria, age 7, from Mexico City.

Child's wish list: A bicycle and a doll
How they've been this year: Very kind to her siblings

Guidelines:
- Be warm, jolly, and encouraging in Spanish (speak Spanish!)
- Reference their wishes naturally in conversation
- Keep responses concise (2-3 sentences)
- Use "Ho ho ho!" occasionally
    `.trim();

    console.log('Test context text length:', testContext.length);
    console.log('Calling HeyGen API...');

    const response = await fetch(`${HEYGEN_API_URL}/v1/contexts`, {
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `TEST - Santa context for Maria ${timestamp}`,
        prompt: testContext,
        opening_text: 'Ho ho ho! Hola Maria! ¡Feliz Navidad desde el Polo Norte!'
      }),
    });

    const responseText = await response.text();
    console.log('HeyGen response status:', response.status);
    console.log('HeyGen response body:', responseText);

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'HeyGen API error',
        status: response.status,
        response: responseText
      });
    }

    const data = JSON.parse(responseText);
    const contextId = data.data?.id || data.id;

    console.log('✅ Context created successfully!');
    console.log('Context ID:', contextId);

    res.json({
      success: true,
      context_id: contextId,
      message: 'Context created! Go to HeyGen dashboard to verify.',
      heygen_response: data
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop HeyGen session endpoint
app.post('/api/stop-session', async (req, res) => {
  try {
    const { session_token } = req.body;

    if (!session_token) {
      return res.status(400).json({ error: 'session_token is required' });
    }

    console.log('🛑 Stopping HeyGen session via REST API');

    const response = await fetch(`${HEYGEN_API_URL}/v1/sessions/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session_token}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Stop session response status:', response.status);
    console.log('Stop session response:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      return res.status(response.status).json({
        error: 'Failed to stop HeyGen session',
        details: errorData
      });
    }

    const data = JSON.parse(responseText);
    console.log('✅ HeyGen session stopped successfully');

    res.json({
      success: true,
      message: 'Session stopped successfully',
      data
    });

  } catch (error) {
    console.error('Error stopping HeyGen session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apiKeyConfigured: !!API_KEY });
});

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n🎅 Santa Backend Server running on http://localhost:${PORT}`);
    console.log(`API Key configured: ${!!API_KEY}`);
    console.log(`Ready to create HeyGen sessions!\n`);
  });
}

// Export for Vercel serverless functions
export default app;
