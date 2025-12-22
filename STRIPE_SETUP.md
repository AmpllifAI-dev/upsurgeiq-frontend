# Stripe Integration Setup Instructions

## Overview
The media list credit system uses Stripe for payment processing. This document explains how to complete the Stripe setup.

---

## Step 1: Create Stripe Products

Log into your Stripe Dashboard and create 3 products for the credit bundles:

### Product 1: Starter Bundle
- **Name:** 10 Media List Credits
- **Description:** 10 credits for media list distribution
- **Price:** £36.00 GBP
- **Type:** One-time payment
- **Product ID:** `media_list_credits_10` (set in metadata)

### Product 2: Professional Bundle  
- **Name:** 20 Media List Credits
- **Description:** 20 credits for media list distribution (Save £12)
- **Price:** £68.00 GBP
- **Type:** One-time payment
- **Product ID:** `media_list_credits_20` (set in metadata)

### Product 3: Enterprise Bundle
- **Name:** 30 Media List Credits
- **Description:** 30 credits for media list distribution (Save £24)
- **Price:** £96.00 GBP
- **Type:** One-time payment
- **Product ID:** `media_list_credits_30` (set in metadata)

**Important:** Add the product ID to each product's metadata with key `productId` and the values shown above.

---

## Step 2: Configure Webhook

### Create Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the **Webhook Signing Secret** (starts with `whsec_...`)

### Add Webhook Secret to Environment

Add the webhook secret to your environment variables:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## Step 3: Verify Environment Variables

Ensure these environment variables are set:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...

# Already configured by Manus
FRONTEND_URL=https://your-domain.com
```

---

## Step 4: Test the Integration

### Test Purchase Flow

1. Navigate to `/credits` page (when frontend is built)
2. Click "Purchase" on any credit bundle
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify credits are added to your account

### Test Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed` event
5. Check server logs for successful processing

---

## How It Works

### Purchase Flow

```
User clicks "Purchase" 
  ↓
Frontend calls trpc.stripe.createCheckoutSession
  ↓
Backend creates Stripe Checkout Session
  ↓
User redirected to Stripe payment page
  ↓
User completes payment
  ↓
Stripe sends webhook to /api/stripe/webhook
  ↓
Backend verifies webhook signature
  ↓
Backend adds credits to user account
  ↓
User redirected back to /credits?success=true
  ↓
Frontend shows success message
```

### Credit Deduction Flow

```
User distributes press release to 3 media lists
  ↓
Backend checks credit balance (hasEnoughCredits)
  ↓
If sufficient credits:
  - Deduct 3 credits (deductCredits)
  - Send emails to journalists
  - Mark distribution as sent
  ↓
If insufficient credits:
  - Show error: "Not enough credits"
  - Redirect to /credits page
```

---

## Product Configuration

The credit products are defined in `server/stripe.ts`:

```typescript
export const CREDIT_PRODUCTS = {
  STARTER: {
    productId: "media_list_credits_10",
    name: "10 Media List Credits",
    credits: 10,
    priceGBP: 3600, // £36.00 in pence
  },
  PROFESSIONAL: {
    productId: "media_list_credits_20",
    name: "20 Media List Credits",
    credits: 20,
    priceGBP: 6800, // £68.00 in pence
  },
  ENTERPRISE: {
    productId: "media_list_credits_30",
    name: "30 Media List Credits",
    credits: 30,
    priceGBP: 9600, // £96.00 in pence
  },
};
```

**To change pricing:** Update the `priceGBP` values (in pence) and the corresponding prices in Stripe Dashboard.

---

## API Endpoints

### tRPC Procedures

**Get Products:**
```typescript
trpc.stripe.getProducts.useQuery()
// Returns: Array of credit products with pricing
```

**Create Checkout Session:**
```typescript
trpc.stripe.createCheckoutSession.useMutation({
  productId: "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
})
// Returns: { checkoutUrl: string }
```

**Get Credit Balance:**
```typescript
trpc.mediaList.getCredits.useQuery()
// Returns: { balance: number }
```

**Get Transaction History:**
```typescript
trpc.mediaList.getCreditTransactions.useQuery()
// Returns: Array of transactions
```

### Webhook Endpoint

**POST /api/stripe/webhook**
- Receives Stripe webhook events
- Verifies signature
- Processes `checkout.session.completed` events
- Adds credits to user account

---

## Troubleshooting

### Credits not added after payment

1. Check webhook is configured correctly in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is set correctly
3. Check server logs for webhook errors
4. Test webhook using Stripe Dashboard → "Send test webhook"

### Checkout session creation fails

1. Verify `STRIPE_SECRET_KEY` is set correctly
2. Check product IDs match in code and Stripe Dashboard
3. Ensure `FRONTEND_URL` is set for success/cancel URLs

### Webhook signature verification fails

1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Ensure webhook URL is correct: `/api/stripe/webhook`
3. Check server is receiving raw body (not parsed JSON)

---

## Security Notes

- **Never expose `STRIPE_SECRET_KEY`** in frontend code
- **Always verify webhook signatures** before processing events
- **Use test mode** (`sk_test_...`) during development
- **Switch to live mode** (`sk_live_...`) only in production
- **Monitor webhook logs** in Stripe Dashboard for suspicious activity

---

## Going Live

Before launching to production:

1. ✅ Switch from test keys to live keys
2. ✅ Update webhook endpoint URL to production domain
3. ✅ Test purchase flow with real card
4. ✅ Verify webhook is receiving events
5. ✅ Monitor first few transactions closely
6. ✅ Set up Stripe email notifications for failed payments
7. ✅ Configure Stripe Radar rules for fraud prevention

---

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For integration issues:
- Check server logs in `/home/ubuntu/upsurgeiq-frontend`
- Review webhook events in Stripe Dashboard
- Test with Stripe CLI for local development
