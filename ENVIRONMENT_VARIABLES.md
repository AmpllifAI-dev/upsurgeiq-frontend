# UpsurgeIQ Environment Variables

This document lists all environment variables required to run the UpsurgeIQ platform.

## Important Notes

⚠️ **SECURITY WARNING:** Never commit actual secret values to Git!

✅ **In Manus Environment:** All variables are automatically configured  
✅ **For Local Development:** Request values from Christopher or get Manus platform access

---

## Required Variables

### Manus Platform (Required)

These are automatically provided in the Manus environment:

```bash
# Manus OAuth
VITE_APP_ID=                    # Your Manus application ID
OAUTH_SERVER_URL=               # Manus OAuth backend (https://api.manus.im)
VITE_OAUTH_PORTAL_URL=          # Manus login portal (https://oauth.manus.im)

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=         # Manus API endpoint (https://forge.manus.im)
BUILT_IN_FORGE_API_KEY=         # Server-side API key (NEVER expose to frontend)
VITE_FRONTEND_FORGE_API_KEY=    # Frontend API key (safe to expose)
VITE_FRONTEND_FORGE_API_URL=    # Frontend API endpoint

# Manus Owner Info
OWNER_OPEN_ID=                  # Owner's Manus user ID
OWNER_NAME=                     # Owner's name (Christopher Lembke)
```

### Database (Required)

```bash
DATABASE_URL=                   # MySQL/TiDB connection string
                               # Format: mysql://user:password@host:port/database
```

### Authentication (Required)

```bash
JWT_SECRET=                     # Secret for signing session cookies
                               # Generate with: openssl rand -base64 32
```

### Stripe Payment Processing (Required)

Get from: https://dashboard.stripe.com/apikeys

```bash
STRIPE_SECRET_KEY=              # Stripe secret key (sk_test_... or sk_live_...)
VITE_STRIPE_PUBLISHABLE_KEY=    # Stripe publishable key (pk_test_... or pk_live_...)
STRIPE_WEBHOOK_SECRET=          # Webhook signing secret (whsec_...)
STRIPE_MANAGEMENT_API_KEY=      # For automated product sync (same as STRIPE_SECRET_KEY)
```

### Email (Required)

Get from: https://app.sendgrid.com/settings/api_keys

```bash
SENDGRID_API_KEY=               # SendGrid API key (SG....)
FROM_EMAIL=                     # Sender email (noreply@upsurgeiq.com)
ADMIN_EMAIL=                    # Admin email (christopher@upsurgeiq.com)
```

---

## Optional Variables

### Social Media OAuth (Optional)

Only required if users will post to social media:

```bash
# Facebook App (https://developers.facebook.com/apps)
FACEBOOK_CLIENT_ID=             # Facebook App ID
FACEBOOK_CLIENT_SECRET=         # Facebook App Secret

# LinkedIn App (https://www.linkedin.com/developers/apps)
LINKEDIN_CLIENT_ID=             # LinkedIn Client ID
LINKEDIN_CLIENT_SECRET=         # LinkedIn Client Secret
```

### Application Settings (Optional)

```bash
FRONTEND_URL=                   # Frontend URL (http://localhost:3000 for dev)
VITE_APP_TITLE=                 # Application title (UpsurgeIQ)
VITE_APP_LOGO=                  # Logo path (/logo.png)
```

### Analytics (Optional)

```bash
VITE_ANALYTICS_WEBSITE_ID=      # Analytics website ID
VITE_ANALYTICS_ENDPOINT=        # Analytics endpoint URL
```

---

## Environment-Specific Values

### Development

```bash
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...   # Use test mode keys
```

### Production

```bash
NODE_ENV=production
FRONTEND_URL=https://upsurgeiq.com
STRIPE_SECRET_KEY=sk_live_...   # Use live mode keys
```

---

## How to Set Up

### Option 1: Use Manus Platform (Recommended)

All environment variables are pre-configured in the Manus platform. Just run:

```bash
pnpm dev
```

The server will automatically pick up all variables.

### Option 2: Local Development (Outside Manus)

1. **Request Access:** Contact Christopher for:
   - Manus platform access (easiest)
   - OR encrypted file with actual values
   - OR secure password manager share

2. **Create .env file:**

```bash
# Copy template
cp .env.example .env

# Edit with actual values
nano .env
```

3. **Verify Setup:**

```bash
# Start server
pnpm dev

# Should start without errors
# If you see "Required for..." errors, check your .env file
```

---

## Security Best Practices

### ✅ DO:

- Store secrets in environment variables
- Use `.env` file for local development (it's in `.gitignore`)
- Use different keys for test/production
- Rotate secrets regularly
- Use Manus platform for team access

### ❌ DON'T:

- Commit `.env` file to Git
- Share secrets in chat/email
- Use production keys in development
- Hardcode secrets in code
- Expose server-side keys to frontend

---

## Variable Naming Convention

- **VITE_** prefix: Exposed to frontend (safe for client-side)
- **No prefix**: Server-side only (NEVER expose to frontend)

Example:
```bash
STRIPE_SECRET_KEY=sk_...        # Server-only (NEVER expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_... # Frontend-safe (public)
```

---

## Troubleshooting

### Server Won't Start

**Error:** `OAUTH_SERVER_URL - Required for Manus OAuth authentication`

**Solution:** Environment variables not loaded. Either:
1. Run in Manus environment (recommended)
2. Create `.env` file with actual values
3. Request Manus platform access from Christopher

### Database Connection Fails

**Error:** `connect ETIMEDOUT` or `ER_ACCESS_DENIED_ERROR`

**Solution:** Check `DATABASE_URL`:
- Correct host/port?
- Valid credentials?
- Database exists?
- Firewall allows connection?

### Stripe Errors

**Error:** `Invalid API Key provided`

**Solution:** Check Stripe keys:
- Using correct key for environment (test vs live)?
- Key copied completely (no spaces)?
- Key is active in Stripe Dashboard?

### SendGrid Errors

**Error:** `Forbidden` or `Unauthorized`

**Solution:** Check SendGrid:
- API key is valid?
- Sender email verified in SendGrid?
- Account not suspended?

---

## Getting Help

**For Manus Platform Access:** Contact Christopher  
**For Technical Issues:** See SETUP_GUIDE.md troubleshooting section  
**For Security Concerns:** Contact Christopher immediately

---

## Complete Variable List (Reference)

All 25 environment variables used in the application:

1. `VITE_APP_ID` - Manus OAuth app ID
2. `OAUTH_SERVER_URL` - Manus OAuth backend
3. `VITE_OAUTH_PORTAL_URL` - Manus login portal
4. `BUILT_IN_FORGE_API_URL` - Manus API endpoint
5. `BUILT_IN_FORGE_API_KEY` - Server-side Manus API key
6. `VITE_FRONTEND_FORGE_API_KEY` - Frontend Manus API key
7. `VITE_FRONTEND_FORGE_API_URL` - Frontend API endpoint
8. `OWNER_OPEN_ID` - Owner's Manus user ID
9. `OWNER_NAME` - Owner's name
10. `DATABASE_URL` - MySQL connection string
11. `JWT_SECRET` - Session cookie secret
12. `STRIPE_SECRET_KEY` - Stripe secret key
13. `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
14. `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
15. `STRIPE_MANAGEMENT_API_KEY` - Stripe management key
16. `SENDGRID_API_KEY` - SendGrid API key
17. `FROM_EMAIL` - Sender email address
18. `ADMIN_EMAIL` - Admin email address
19. `FACEBOOK_CLIENT_ID` - Facebook app ID (optional)
20. `FACEBOOK_CLIENT_SECRET` - Facebook app secret (optional)
21. `LINKEDIN_CLIENT_ID` - LinkedIn client ID (optional)
22. `LINKEDIN_CLIENT_SECRET` - LinkedIn client secret (optional)
23. `FRONTEND_URL` - Frontend URL
24. `VITE_APP_TITLE` - Application title
25. `VITE_APP_LOGO` - Logo path

---

**Last Updated:** December 23, 2025  
**Version:** 1.0
