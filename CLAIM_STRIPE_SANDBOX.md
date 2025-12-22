# Claim Stripe Sandbox - Instructions

**Status**: ⚠️ **ACTION REQUIRED**  
**Priority**: HIGH (Required before accepting real payments)  
**Estimated Time**: 5-10 minutes

---

## What is the Stripe Sandbox?

The Stripe Sandbox is a test environment that allows you to test payment flows without processing real transactions. Your UpsurgeIQ application has been configured with a Stripe test sandbox, but it needs to be claimed by you to activate it.

---

## Why Do I Need to Claim It?

Without claiming the sandbox:
- ❌ You cannot test payment flows
- ❌ You cannot accept real payments in production
- ❌ Subscription upgrades won't work
- ❌ Media list purchases won't process

After claiming the sandbox:
- ✅ Test all payment flows safely
- ✅ Verify subscription upgrades work correctly
- ✅ Test media list purchases
- ✅ Ready to switch to live mode for real payments

---

## Claim Instructions

### Step 1: Access the Claim Link

**Claim URL**: https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU2ZsMjJJRVZyM1YyMUplLDE3NjY2ODkyMDcv100LZAKvbtT

**Expiration Date**: February 16, 2026 at 7:00 PM UTC

⚠️ **Important**: This link expires on the date above. If expired, you'll need to create a new Stripe account.

### Step 2: Sign In or Create Stripe Account

When you click the link, you'll be prompted to:

**Option A: If you already have a Stripe account**
1. Click "Sign in to Stripe"
2. Enter your Stripe credentials
3. Authorize the sandbox claim

**Option B: If you don't have a Stripe account**
1. Click "Create account"
2. Enter your email address
3. Create a password
4. Verify your email
5. Complete the account setup

### Step 3: Verify Sandbox Activation

After claiming, you should see:
1. A new test account in your Stripe dashboard
2. Test API keys (starting with `sk_test_` and `pk_test_`)
3. Access to the Stripe test dashboard

### Step 4: Test the Integration

1. Go to your UpsurgeIQ application
2. Navigate to Subscription page
3. Try upgrading to Pro or Scale tier
4. Use Stripe test card: `4242 4242 4242 4242`
5. Use any future expiry date (e.g., 12/25)
6. Use any 3-digit CVC (e.g., 123)
7. Verify the payment succeeds

---

## Test Card Numbers

Stripe provides test card numbers for different scenarios:

### Successful Payments
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`

### Failed Payments (for testing error handling)
- **Card Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

### For All Test Cards
- **Expiry**: Any future date (e.g., 12/25, 01/26)
- **CVC**: Any 3 digits (e.g., 123, 456)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## What Happens After Claiming?

### Immediate Benefits
1. **Test Mode Active**: You can test all payment flows
2. **Subscription Testing**: Test tier upgrades and downgrades
3. **Webhook Testing**: Stripe webhooks will work in test mode
4. **Payment History**: View test transactions in Stripe dashboard

### Next Steps After Testing
1. **Verify All Flows Work**:
   - Subscription creation (Starter, Pro, Scale)
   - Subscription upgrades
   - Subscription downgrades
   - Media list purchases
   - Webhook handling

2. **Review Stripe Dashboard**:
   - Check test payments appear correctly
   - Verify customer records are created
   - Review subscription status

3. **Prepare for Production**:
   - Complete business verification in Stripe
   - Switch to live API keys when ready
   - Update environment variables for production

---

## Switching to Live Mode (Production)

⚠️ **Do NOT do this until you're ready to accept real payments**

When ready for production:

### Step 1: Complete Stripe Verification
1. Go to Stripe Dashboard → Settings → Business Settings
2. Complete business verification (required by Stripe)
3. Provide:
   - Business details (name, address, type)
   - Tax information (EIN or SSN)
   - Bank account for payouts
   - Identity verification documents

### Step 2: Get Live API Keys
1. Go to Stripe Dashboard → Developers → API Keys
2. Toggle from "Test mode" to "Live mode"
3. Copy your live keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### Step 3: Update UpsurgeIQ Environment Variables
1. Go to Manus Management UI → Settings → Secrets
2. Update these variables:
   - `STRIPE_SECRET_KEY`: Your live secret key
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your live publishable key
3. Save changes
4. Restart the application

### Step 4: Test in Production
1. Use a real card (your own) to test
2. Immediately refund the test transaction
3. Verify webhooks work in production
4. Monitor for any errors

---

## Troubleshooting

### "Link has expired"
**Solution**: The claim link expired. You'll need to:
1. Create a new Stripe account at https://stripe.com
2. Get your test API keys
3. Update the environment variables in UpsurgeIQ

### "Unable to claim sandbox"
**Solution**: 
1. Clear browser cookies and cache
2. Try in an incognito/private window
3. Try a different browser
4. Contact Stripe support if issue persists

### "Test payments not working"
**Solution**:
1. Verify you're using test card numbers (4242 4242 4242 4242)
2. Check you're in test mode in Stripe dashboard
3. Verify API keys are test keys (start with `sk_test_`)
4. Check browser console for errors

### "Webhooks not receiving events"
**Solution**:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Verify webhook endpoint is configured
3. Check webhook signing secret matches environment variable
4. Test webhook with "Send test webhook" button

---

## Current Stripe Configuration

Your UpsurgeIQ application is configured with:

### Products
1. **Starter Tier**: £49/month
   - Product ID: `prod_Td2pC4hUddBbAH`
   - Price ID: `price_1SfmjyAGfyqPBnQ9JPZoNoWl`

2. **Pro Tier**: £99/month
   - Product ID: `prod_Td2sl51moqbe4C`
   - Price ID: `price_1SfmmWAGfyqPBnQ9LeAJ711i`

3. **Scale Tier**: £349/month
   - Product ID: `prod_Td2tuhKJPQ41d8`
   - Price ID: `price_1SfmnuAGfyqPBnQ9U5P7KfF4`

4. **Additional Media List**: £4 per list
   - Product ID: `prod_Td2wLpX1A6exs9`
   - Price ID: `price_1Sfmq8AGfyqPBnQ9JJ8tsFHt`

5. **Intelligent Campaign Lab**: (Add-on)
   - Product ID: `prod_Td2yyQ1pFJWNoo`
   - Price ID: `price_1SfmsDAGfyqPBnQ9DTkBb5vw`

### Webhook Events
Your application listens for:
- `checkout.session.completed` - Subscription created
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

---

## Support

### Stripe Support
- **Documentation**: https://stripe.com/docs
- **Support**: https://support.stripe.com
- **Status**: https://status.stripe.com

### UpsurgeIQ Support
- **Help Center**: https://help.manus.im
- **Email**: support@manus.im (if applicable)

---

## Checklist

Use this checklist to track your progress:

- [ ] Clicked the claim link before expiration date
- [ ] Successfully claimed the Stripe sandbox
- [ ] Verified test API keys are visible in Stripe dashboard
- [ ] Tested subscription creation with test card
- [ ] Tested subscription upgrade
- [ ] Tested media list purchase
- [ ] Verified webhooks are working
- [ ] Reviewed test transactions in Stripe dashboard
- [ ] Completed Stripe business verification (when ready for production)
- [ ] Obtained live API keys (when ready for production)
- [ ] Updated environment variables to live keys (when ready for production)
- [ ] Tested with real card in production (when ready for production)

---

## Summary

**What You Need to Do Now**:
1. Click the claim link: https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU2ZsMjJJRVZyM1YyMUplLDE3NjY2ODkyMDcv100LZAKvbtT
2. Sign in or create Stripe account
3. Test payment flows with test cards
4. Verify everything works

**What You'll Do Later** (when ready for real payments):
1. Complete Stripe business verification
2. Get live API keys
3. Update environment variables
4. Test in production
5. Launch! 🚀

---

**Questions?** Refer to Stripe documentation or contact support.
