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

// Plan configurations
const PLANS = {
  mini: {
    name: 'Mini Carta',
    price: 4500, // $45 MXN in centavos
    time_minutes: 5,
    heygen_credits: 10,
    features: [
      'Videollamada de 5 minutos',
      'Conversación personalizada',
      'Carta de Santa por email'
    ]
  },
  premium: {
    name: 'Carta Premium',
    price: 8000, // $80 MXN in centavos
    time_minutes: 10,
    heygen_credits: 20,
    features: [
      'Videollamada de 10 minutos',
      'Conversación extendida',
      'Carta premium por email',
      'Mención de deseos específicos'
    ]
  },
  vip: {
    name: 'Experiencia VIP',
    price: 14000, // $140 MXN in centavos
    time_minutes: 20,
    heygen_credits: 40,
    features: [
      'Videollamada de 20 minutos',
      'Conversación profunda',
      'Carta VIP personalizada',
      'Video grabado de la llamada',
      'Mención del nombre en video'
    ]
  }
};

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
              description: `${plan.time_minutes} minutos con Santa + Carta personalizada`,
              images: ['https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400'],
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5176'}/form?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5176'}/?cancelled=true`,
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
      behavior_notes
    } = req.body;

    if (!child_name) {
      return res.status(400).json({ error: 'Child name is required' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(checkout_session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
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
      },
    });

    console.log('✅ Session updated with child info:', checkout_session_id);

    // TODO: Also update in Supabase when we add it

    res.json({ success: true });

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
