# Stripe Integration Setup Guide

## ✅ What's Been Implemented

The Stripe payment integration is **complete** and ready for testing. Here's what's working:

### Backend (server.js)
- ✅ Stripe SDK initialized
- ✅ `/api/create-checkout-session` - Creates Stripe Checkout sessions
- ✅ `/api/webhook/stripe` - Handles payment confirmations
- ✅ `/api/session/:checkout_session_id` - Retrieves session data after payment
- ✅ Plan configurations (Mini $45, Premium $80, VIP $140 MXN)

### Frontend
- ✅ Landing page buttons connected to plan selection
- ✅ Form updated with email field (required for Stripe)
- ✅ Checkout flow redirects to Stripe
- ✅ Return URL handling (reads session_id from URL after payment)
- ✅ Automatic session data loading after successful payment

---

## 🚀 How to Set Up Stripe (Step by Step)

### Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up for a free account
3. You'll start in **Test Mode** automatically (perfect for development)

### Step 2: Get Your API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

3. Copy your **Secret Key**

### Step 3: Add Keys to .env File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Stripe secret key:
   ```bash
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
   ```

3. For now, use a dummy webhook secret (we'll get the real one in Step 5):
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_temporary
   ```

### Step 4: Install Stripe CLI (For Webhook Testing)

The Stripe CLI lets you test webhooks locally.

**Windows:**
```bash
# Using Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from https://github.com/stripe/stripe-cli/releases/latest
```

### Step 5: Set Up Webhook Forwarding

1. Login to Stripe CLI:
   ```bash
   stripe login
   ```
   This will open your browser to authorize.

2. Start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3001/api/webhook/stripe
   ```

3. You'll see output like:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
   ```

4. Copy that `whsec_` secret and update your `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **Keep this terminal running!** It needs to stay open to forward webhooks.

### Step 6: Restart Your Backend

Since you updated .env, restart the server:

```bash
# Kill the current server (Ctrl+C)
# Then restart:
npm run server
```

---

## 🧪 Testing the Payment Flow

### Test Cards

Use these test card numbers in Stripe Checkout:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure authentication |
| `4000 0000 0000 9995` | ❌ Card declined |

**Other fields:**
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any postal code (e.g., `12345`)

### Testing Steps

1. **Start both servers:**
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend
   npm run server

   # Terminal 3: Stripe webhooks
   stripe listen --forward-to localhost:3001/api/webhook/stripe
   ```

2. **Open the app:**
   - Go to http://localhost:5176
   - Click on any pricing plan (Mini, Premium, or VIP)

3. **Fill out the form:**
   - Enter your email
   - Enter child's name and other info
   - Check the consent checkbox
   - Click "Proceder al Pago"

4. **Complete payment in Stripe:**
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Fill in other fields with dummy data
   - Click "Pay"

5. **Watch the magic happen:**
   - You'll be redirected back to your app
   - URL will have `?session_id=cs_test_...`
   - App will show "Waiting" screen
   - Then automatically start the video chat!

6. **Check the logs:**
   - In your **backend terminal**, you should see:
     ```
     ✅ Stripe checkout session created: cs_test_xxxxx
     💰 Payment successful!
     📋 Session data to store: { ... }
     ```
   - In your **Stripe CLI terminal**, you should see:
     ```
     checkout.session.completed [200] POST http://localhost:3001/api/webhook/stripe
     ```

---

## 🔍 Troubleshooting

### "Webhook signature verification failed"

**Problem:** Backend can't verify webhook is from Stripe.

**Solution:**
1. Make sure you're running `stripe listen`
2. Copy the `whsec_` secret from stripe listen output
3. Update `.env` with the correct secret
4. Restart your backend server

### "Checkout session not found"

**Problem:** Can't retrieve session data after payment.

**Solution:**
- Make sure backend is running on port 3001
- Check that FRONTEND_URL in .env matches your frontend URL

### "CORS error" when creating checkout

**Problem:** Frontend can't talk to backend.

**Solution:**
- Ensure backend is running
- CORS is already configured in server.js
- Check frontend is calling `http://localhost:3001`

### Backend crashes on startup

**Problem:** Missing environment variables.

**Solution:**
1. Make sure `.env` exists
2. Check that `STRIPE_SECRET_KEY` is set
3. The key should start with `sk_test_`

---

## 📋 Current Flow (How It Works)

```
1. User clicks plan on Landing page
   └─> Sets selectedPlan state
   └─> Navigates to form

2. User fills form and clicks "Proceder al Pago"
   └─> POST /api/create-checkout-session
   └─> Backend creates Stripe Checkout session
   └─> Returns checkout URL
   └─> Frontend redirects to Stripe

3. User completes payment in Stripe
   └─> Stripe sends webhook to backend
   └─> Backend logs payment data (TODO: save to Supabase)
   └─> Stripe redirects user back to app

4. User returns to app with ?session_id=xxx
   └─> App detects session_id in URL
   └─> GET /api/session/:session_id
   └─> Backend retrieves session from Stripe
   └─> Returns child_info and plan_type
   └─> App loads data and starts video chat
```

---

## 🎯 What's Next

After Stripe is working, the next priorities are:

### Priority #3: Supabase Integration
- Store session data in database
- Track used sessions (prevent reuse)
- Store transcripts
- Track HeyGen credits usage

### Priority #4: Zapier Webhook
- Trigger after call ends
- Send transcript + child info
- Generate personalized letter
- Email letter to customer

---

## 🔐 Security Notes

### ⚠️ NEVER Commit These Files:
- ❌ `.env` - Contains your secret keys
- ✅ `.env.example` - Safe to commit (no real keys)

### Current Security Implementation:
- ✅ Webhook signature verification
- ✅ Payment status verification before allowing chat
- ✅ CORS enabled
- ✅ Server-side session validation

### TODO for Production:
- [ ] Switch to live Stripe keys
- [ ] Set up production webhook URL
- [ ] Add rate limiting
- [ ] Add session expiry
- [ ] Implement "used" flag to prevent session reuse

---

## 💡 Testing Checklist

Use this to verify everything is working:

- [ ] Backend starts without errors
- [ ] Frontend loads landing page
- [ ] Can click plan and see form
- [ ] Form includes email field
- [ ] Submitting form redirects to Stripe
- [ ] Can see plan details in Stripe Checkout
- [ ] Test card payment succeeds
- [ ] Webhook logs show in Stripe CLI terminal
- [ ] Backend logs show payment success
- [ ] User redirected back with session_id
- [ ] Waiting screen shows
- [ ] Chat screen loads with child info

---

## 📞 Need Help?

Check these resources:
- **Stripe Docs:** https://stripe.com/docs/checkout/quickstart
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Test Cards:** https://stripe.com/docs/testing

---

**Status:** ✅ **Ready to test!**

Copy your Stripe secret key to `.env` and start testing the payment flow.
