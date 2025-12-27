# Secrets Handoff Guide

**For:** Christopher → New Development Team  
**Date:** December 23, 2025

---

## Overview

The new development team needs access to 25+ environment variables to run the application. This document explains how to securely transfer these secrets.

---

## Option 1: Manus Platform Access (Recommended)

**Easiest and Most Secure**

### What Christopher Needs to Do:

1. **Add team members to Manus project:**
   - Go to Manus platform
   - Navigate to project settings
   - Add team members by email
   - Grant appropriate permissions

2. **Team members can then:**
   - Access the project in Manus
   - Run `pnpm dev` - all secrets automatically available
   - No manual secret transfer needed

### Advantages:
- ✅ No manual secret transfer
- ✅ Secrets never leave secure environment
- ✅ Easy to revoke access
- ✅ Audit trail of who accessed what
- ✅ Automatic secret rotation support

---

## Option 2: Encrypted File Transfer

**If team needs local development access**

### What Christopher Needs to Do:

1. **Export secrets to file:**

```bash
# Create secrets file (on Manus platform)
cat > secrets.env << 'EOF'
# Paste all environment variables here
VITE_APP_ID=actual_value_here
OAUTH_SERVER_URL=actual_value_here
DATABASE_URL=actual_value_here
# ... all 25 variables
EOF
```

2. **Encrypt the file:**

```bash
# Using GPG (recommended)
gpg --symmetric --cipher-algo AES256 secrets.env
# Creates: secrets.env.gpg
# Delete original: rm secrets.env
```

3. **Share encrypted file + password separately:**
   - Send `secrets.env.gpg` via email/Slack
   - Send password via different channel (SMS, phone call)

### What Team Needs to Do:

1. **Decrypt file:**

```bash
gpg --decrypt secrets.env.gpg > .env
```

2. **Verify it works:**

```bash
pnpm dev
# Should start without "Required for..." errors
```

3. **Delete encrypted file:**

```bash
rm secrets.env.gpg
```

---

## Option 3: Password Manager Share

**If using 1Password, LastPass, etc.**

### What Christopher Needs to Do:

1. Create vault/folder called "UpsurgeIQ Secrets"
2. Add all 25 environment variables as secure notes
3. Share vault with team members
4. Team can copy values into `.env` file

### Advantages:
- ✅ Secure storage
- ✅ Easy to update
- ✅ Team members can access anytime
- ✅ Audit trail

---

## Complete Variable List

The new team needs these 25 variables:

### Critical (Application Won't Start Without These):

1. `VITE_APP_ID` - Manus OAuth app ID
2. `OAUTH_SERVER_URL` - Manus OAuth backend
3. `DATABASE_URL` - MySQL connection string
4. `JWT_SECRET` - Session cookie secret
5. `STRIPE_SECRET_KEY` - Stripe secret key
6. `SENDGRID_API_KEY` - SendGrid API key
7. `BUILT_IN_FORGE_API_KEY` - Manus API key

### Important (Features Won't Work Without These):

8. `VITE_OAUTH_PORTAL_URL` - Manus login portal
9. `BUILT_IN_FORGE_API_URL` - Manus API endpoint
10. `VITE_FRONTEND_FORGE_API_KEY` - Frontend API key
11. `VITE_FRONTEND_FORGE_API_URL` - Frontend API endpoint
12. `OWNER_OPEN_ID` - Owner's Manus user ID
13. `OWNER_NAME` - Owner's name
14. `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
15. `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
16. `STRIPE_MANAGEMENT_API_KEY` - Stripe management key
17. `FROM_EMAIL` - Sender email address
18. `ADMIN_EMAIL` - Admin email address
19. `FRONTEND_URL` - Frontend URL

### Optional (Features Can Work Without These):

20. `FACEBOOK_CLIENT_ID` - Facebook app ID
21. `FACEBOOK_CLIENT_SECRET` - Facebook app secret
22. `LINKEDIN_CLIENT_ID` - LinkedIn client ID
23. `LINKEDIN_CLIENT_SECRET` - LinkedIn client secret
24. `VITE_APP_TITLE` - Application title
25. `VITE_APP_LOGO` - Logo path

---

## Security Checklist

### Before Sharing Secrets:

- [ ] Verify team member identity
- [ ] Use encrypted transfer method
- [ ] Send password via different channel
- [ ] Set expiration date if possible
- [ ] Document who received what

### After Sharing Secrets:

- [ ] Confirm team can run application
- [ ] Delete unencrypted files
- [ ] Update access log
- [ ] Plan secret rotation schedule

### Team Responsibilities:

- [ ] Never commit `.env` to Git
- [ ] Never share secrets in chat/email
- [ ] Delete secrets when leaving project
- [ ] Report any security concerns immediately

---

## Testing Access

### How Team Can Verify They Have Correct Secrets:

```bash
# 1. Start server
pnpm dev

# 2. Check for errors
# ❌ Bad: "OAUTH_SERVER_URL - Required for..."
# ✅ Good: "Server running on http://localhost:3000/"

# 3. Test login
# Visit: http://localhost:3000
# Click: "Get Started" or "Login"
# Should redirect to Manus OAuth (not error)

# 4. Test database
# Login should work (proves DATABASE_URL correct)

# 5. Test Stripe
# Try to subscribe (proves STRIPE_SECRET_KEY correct)
```

---

## Troubleshooting

### "Server won't start - missing variables"

**Problem:** `.env` file not loaded or incomplete

**Solution:**
1. Check `.env` file exists in project root
2. Check all 25 variables are present
3. Check no typos in variable names
4. Check no extra spaces around `=` signs

### "Database connection failed"

**Problem:** `DATABASE_URL` incorrect

**Solution:**
1. Verify host/port are correct
2. Verify credentials are correct
3. Verify database name exists
4. Check firewall allows connection

### "Stripe errors"

**Problem:** Stripe keys incorrect or invalid

**Solution:**
1. Check using correct environment (test vs live)
2. Verify keys copied completely
3. Check keys are active in Stripe Dashboard

---

## Emergency Procedures

### If Secrets Are Compromised:

1. **Immediately rotate all secrets:**
   - Generate new JWT_SECRET
   - Regenerate Stripe keys
   - Regenerate SendGrid key
   - Update all services

2. **Notify affected parties:**
   - Christopher
   - All team members
   - Stripe support
   - SendGrid support

3. **Update documentation:**
   - New secrets to team
   - Update this document
   - Update deployment configs

### If Team Member Leaves:

1. **Revoke Manus access** (if using Option 1)
2. **Rotate critical secrets** (if using Option 2/3)
3. **Update password manager access**
4. **Document in access log**

---

## Recommended Approach

**For Christopher:**

1. **Week 1:** Grant Manus platform access (Option 1)
   - Easiest for both parties
   - Most secure
   - No manual secret transfer

2. **If local development needed:** Use encrypted file (Option 2)
   - Only share what's absolutely necessary
   - Use strong encryption
   - Rotate secrets after project completion

3. **Long-term:** Set up password manager (Option 3)
   - Good for ongoing collaboration
   - Easy to update secrets
   - Audit trail

**For Team:**

1. **Prefer Manus platform access** - no secrets to manage
2. **If using local secrets** - treat them like production credentials
3. **Never commit secrets to Git** - use `.gitignore`
4. **Delete secrets when done** - don't keep copies

---

## Questions?

**For Christopher:**
- Which option do you prefer?
- Do you have a password manager?
- Should we set up secret rotation schedule?

**For Team:**
- Do you need local development access?
- Do you have GPG installed?
- Do you have access to password manager?

---

**Last Updated:** December 23, 2025  
**Version:** 1.0
