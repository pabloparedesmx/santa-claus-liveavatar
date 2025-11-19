// HeyGen API integration utilities

const BACKEND_API_URL = import.meta.env.VITE_API_URL || '/api';

export interface HeyGenSessionResponse {
  session_token: string;
  session_id: string;
}

export interface AvatarPersona {
  voice_id: string;
  context_id?: string;
  language?: string;
}

export interface CreateSessionOptions {
  mode?: 'FULL' | 'CUSTOM';
  avatar_id: string;
  avatar_persona: AvatarPersona;
}

/**
 * Creates a HeyGen LiveAvatar session via our backend API
 * This keeps the API key secure on the server
 */
export async function createHeyGenSession(
  options: CreateSessionOptions
): Promise<HeyGenSessionResponse> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar_id: options.avatar_id,
        avatar_persona: options.avatar_persona,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error || 'Failed to create session';
      throw new Error(`Backend API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();

    if (!data.session_token) {
      throw new Error('Invalid response from backend: missing session_token');
    }

    return {
      session_token: data.session_token,
      session_id: data.session_id,
    };
  } catch (error) {
    console.error('Error creating HeyGen session:', error);
    throw error;
  }
}

/**
 * Formats the Santa persona context based on child information
 */
export function formatSantaContext(childInfo: {
  name: string;
  age?: number | null;
  location?: string;
  wishList?: string;
  behaviorNotes?: string;
}): string {
  const context = `
You are Santa Claus speaking with ${childInfo.name}${childInfo.age ? `, age ${childInfo.age}` : ''}${childInfo.location ? `, from ${childInfo.location}` : ''}.

${childInfo.wishList ? `Child's wish list: ${childInfo.wishList}` : ''}
${childInfo.behaviorNotes ? `How they've been this year: ${childInfo.behaviorNotes}` : ''}

Guidelines:
- Be warm, jolly, and encouraging
- Reference their wishes naturally in conversation
- Praise good behavior and encourage continued kindness
- Ask engaging questions about their year, school, friends, hobbies
- Keep responses concise (2-3 sentences) to maintain engagement
- Use "Ho ho ho!" occasionally but not excessively
- If unsure about something, stay in character and redirect warmly
- Aim for a 3-5 minute conversation with a natural conclusion
- End by promising to deliver presents on Christmas Eve and wishing them a Merry Christmas

Safety rules:
- Never ask for personal information beyond what parent provided
- Avoid topics: politics, religion, scary content
- If child mentions sadness/problems, respond with empathy and redirect to positive topics
- Never make promises about specific gifts or guarantee wishes
  `.trim();

  return context;
}
