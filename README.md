# 🎅 Santa Claus Live Avatar Experience

An interactive Christmas web application that connects children with Santa Claus through real-time AI avatar conversations, followed by personalized letter generation and delivery.

## 🎯 Project Overview

This is a magical web experience built with:
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS (Christmas themed)
- **Live Avatar**: HeyGen LiveAvatar SDK
- **Backend** (planned): Supabase + Stripe + Zapier

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- npm or pnpm
- HeyGen API key (for live avatar functionality)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Edit .env and add your API keys:
# - VITE_HEYGEN_API_KEY
# - VITE_HEYGEN_SANTA_AVATAR_ID
# - VITE_HEYGEN_SANTA_VOICE_ID
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## 📁 Project Structure

```
santa-claus-liveavatar/
├── src/
│   ├── components/
│   │   └── AvatarChat.tsx       # Main avatar video chat component
│   ├── App.tsx                   # Main app with state management
│   ├── index.css                 # Tailwind styles + Christmas theme
│   └── main.tsx                  # App entry point
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Example env configuration
└── tailwind.config.js            # Tailwind with Christmas colors
```

## 🎨 Features Implemented

### ✅ Current Features
- **Child Information Form**: Collects name, age, location, wish list, and behavior notes
- **Waiting Room**: Festive loading screen before meeting Santa
- **Avatar Chat Interface**: Full-screen video chat with controls
  - Mute/unmute button
  - End call button
  - Timer display
  - Connection status indicator
  - Real-time transcript display
- **Completion Screen**: Thank you message with transcript
- **Mobile-responsive design**: Works on all screen sizes

### 🔨 In Progress
- **HeyGen SDK Integration**: Real avatar connection (currently simulated)
- **Session token generation**: Backend API endpoint needed

### 🔜 Planned Features
- Payment integration (Stripe)
- Database storage (Supabase)
- Letter generation (Zapier)
- Email delivery
- Landing page
- Pricing page

## 🎄 Christmas Theme Colors

The app uses a festive color palette:
- **Christmas Red**: `#DC2626` (primary)
- **Christmas Green**: `#059669` (secondary)
- **Christmas Gold**: `#F59E0B` (accent)

## 🔧 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📚 Next Steps

1. **Integrate Real HeyGen API**:
   - Create backend endpoint for token generation
   - Replace simulated connection with actual LiveAvatarSession
   - Test with real HeyGen avatar

2. **Add Payment Flow**:
   - Integrate Stripe Checkout
   - Create pricing page
   - Handle payment success/failure

3. **Set up Database**:
   - Create Supabase project
   - Define session schema
   - Implement data persistence

4. **Implement Letter Generation**:
   - Set up Zapier workflow
   - Create letter template
   - Configure email delivery

## 🔐 Environment Variables

Required variables (see `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_HEYGEN_API_KEY` | HeyGen API key | Yes |
| `VITE_HEYGEN_SANTA_AVATAR_ID` | Santa avatar ID from HeyGen | Yes |
| `VITE_HEYGEN_SANTA_VOICE_ID` | Santa voice ID from HeyGen | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | For payments |
| `VITE_SUPABASE_URL` | Supabase project URL | For database |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | For database |
| `VITE_ZAPIER_WEBHOOK_URL` | Zapier webhook for letters | For automation |

## 📖 Documentation

For detailed implementation guidance, refer to:
- `santa-claus-liveavatar-lovable-setup.md` - Complete project specification
- HeyGen LiveAvatar Docs: https://docs.liveavatar.com
- Tailwind CSS: https://tailwindcss.com/docs

## 🎁 License

MIT

---

**Built with ❤️ for creating magical Christmas memories**
