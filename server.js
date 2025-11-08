import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// HeyGen API configuration
const HEYGEN_API_URL = 'https://api.liveavatar.com';
const API_KEY = process.env.VITE_HEYGEN_API_KEY;

// Create session endpoint
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

app.listen(PORT, () => {
  console.log(`\n🎅 Santa Backend Server running on http://localhost:${PORT}`);
  console.log(`API Key configured: ${!!API_KEY}`);
  console.log(`Ready to create HeyGen sessions!\n`);
});
