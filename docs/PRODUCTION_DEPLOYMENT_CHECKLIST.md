# UpsurgeIQ Production Deployment Checklist

**Version:** 1.0  
**Last Updated:** December 26, 2025  
**Purpose:** Comprehensive checklist for safely deploying UpsurgeIQ to production

---

## Pre-Deployment Verification

### 1. Environment Variables Configuration

**Critical Environment Variables (MUST be set):**

```bash
# Core Application
VITE_APP_ID=your_app_id
JWT_SECRET=your_jwt_secret_min_32_chars
NODE_ENV=production
FRONTEND_URL=https://upsurgeiq.com

# Database
DATABASE_URL=mysql://user:password@host:port/database

# OAuth & Authentication
OAUTH_SERVER_URL=your_oauth_server_url
OWNER_OPEN_ID=christopher_open_id

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_live_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@upsurgeiq.com
ADMIN_EMAIL=christopher@upsurgeiq.com

# Forge API (AI Features)
BUILT_IN_FORGE_API_URL=your_forge_api_url
BUILT_IN_FORGE_API_KEY=your_forge_api_key
```

**Optional Environment Variables (OAuth for Ad Platforms):**

```bash
# Facebook OAuth (for ad deployment)
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# LinkedIn OAuth (for ad deployment)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

**Verification Steps:**

- [ ] All critical environment variables are set
- [ ] No placeholder values (e.g., "your_app_id") remain
- [ ] JWT_SECRET is at least 32 characters and cryptographically secure
- [ ] DATABASE_URL points to production database
- [ ] STRIPE keys are LIVE keys (sk_live_*, pk_live_*), not test keys
- [ ] SENDGRID_API_KEY is valid and has sending permissions
- [ ] NODE_ENV is set to "production"
- [ ] FRONTEND_URL matches actual production domain

**Command to Verify:**

```bash
# Check all environment variables are loaded
node -e "
const env = process.env;
const required = ['VITE_APP_ID', 'JWT_SECRET', 'DATABASE_URL', 'STRIPE_SECRET_KEY', 'SENDGRID_API_KEY'];
const missing = required.filter(key => !env[key]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing);
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}
"
```

---

### 2. Database Migration Verification

**Current Migration Status:**

- Total migrations: 24 (0000-0021 + performance indexes 0022)
- Latest migration: `0022_performance_indexes.sql`

**Pre-Deployment Database Checks:**

- [ ] **Backup current production database** (if exists)
  ```bash
  mysqldump -h HOST -u USER -p DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Verify database connection**
  ```bash
  mysql -h HOST -u USER -p -e "SELECT 1"
  ```

- [ ] **Check current migration status**
  ```bash
  mysql -h HOST -u USER -p DATABASE -e "SHOW TABLES LIKE 'drizzle%'"
  ```

- [ ] **Run migrations in order** (if fresh database)
  ```bash
  # Apply all migrations
  for file in drizzle/*.sql; do
    echo "Applying $file..."
    mysql -h HOST -u USER -p DATABASE < "$file"
  done
  ```

- [ ] **Verify all tables exist**
  ```bash
  mysql -h HOST -u USER -p DATABASE -e "SHOW TABLES"
  ```

**Expected Tables (Minimum 40+ tables):**

- users, businesses, subscriptions
- press_releases, social_media_posts
- campaigns, campaign_variants
- media_lists, media_list_contacts
- journalists, media_outlets
- email_campaigns, email_workflows
- credit_usage, credit_alert_thresholds
- team_members, team_invitations
- approval_requests, content_versions
- business_dossiers, ai_conversations
- social_media_accounts
- notification_preferences
- saved_filters
- (and more...)

**Verify Performance Indexes:**

```bash
# Check indexes are created
mysql -h HOST -u USER -p DATABASE -e "
SHOW INDEX FROM users WHERE Key_name = 'idx_users_open_id';
SHOW INDEX FROM press_releases WHERE Key_name = 'idx_press_releases_business_created';
SHOW INDEX FROM campaigns WHERE Key_name = 'idx_campaigns_business_created';
"
```

---

### 3. Stripe Product Configuration

**Verify Stripe Products are Synced:**

```bash
# List current Stripe products
pnpm stripe:list

# Expected output: 3 products (Starter, Pro, Scale)
# - Starter: £49/month
# - Pro: £99/month
# - Scale: £349/month
```

**If products don't exist, sync them:**

```bash
# Dry run first (preview changes)
pnpm stripe:dry-run

# If looks good, sync for real
pnpm stripe:sync
```

**Verify Stripe Webhook:**

```bash
# Test webhook signature verification
pnpm webhook:verify
```

**Stripe Dashboard Checks:**

- [ ] Go to: https://dashboard.stripe.com/products
- [ ] Verify 3 products exist: Starter, Pro, Scale
- [ ] Verify prices match: £49, £99, £349
- [ ] Verify all products are "Active"
- [ ] Go to: https://dashboard.stripe.com/webhooks
- [ ] Verify webhook endpoint is configured: `https://upsurgeiq.com/api/stripe/webhook`
- [ ] Verify webhook events are enabled:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` env var

---

### 4. Email Template Verification

**SendGrid Setup:**

- [ ] Log into SendGrid: https://app.sendgrid.com/
- [ ] Verify API key has "Mail Send" permissions
- [ ] Verify sender email is verified: noreply@upsurgeiq.com
- [ ] Test email sending:

```bash
# Send test email
node -e "
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'christopher@upsurgeiq.com',
  from: 'noreply@upsurgeiq.com',
  subject: 'UpsurgeIQ Production Test',
  text: 'This is a test email from production deployment.',
};

sgMail.send(msg)
  .then(() => console.log('✅ Test email sent successfully'))
  .catch(error => console.error('❌ Email failed:', error));
"
```

**Email Templates to Verify:**

- [ ] Welcome email (new user signup)
- [ ] Subscription confirmation
- [ ] Payment receipt
- [ ] Usage threshold alerts (50%, 80%, 100%)
- [ ] Team invitation
- [ ] Password reset (if applicable)
- [ ] Press release approval request
- [ ] Campaign performance report

---

### 5. Build Verification

**Run Full Build:**

```bash
# Install dependencies
pnpm install

# Type check
pnpm check

# Build frontend and backend
pnpm build
```

**Expected Output:**

- ✅ No TypeScript errors
- ✅ Frontend build completes (creates `dist/client/`)
- ✅ Backend build completes (creates `dist/index.js`)
- ✅ No warnings about missing dependencies

**Verify Build Artifacts:**

```bash
# Check build output exists
ls -lh dist/
ls -lh dist/client/

# Verify backend entry point
node dist/index.js --version 2>/dev/null || echo "Backend built successfully"
```

---

### 6. Security Checklist

**Code Security:**

- [ ] No hardcoded secrets in code
- [ ] No console.log statements with sensitive data
- [ ] All API keys loaded from environment variables
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure

**Database Security:**

- [ ] Database user has minimum required permissions
- [ ] Database is not publicly accessible
- [ ] SSL/TLS enabled for database connections
- [ ] Regular backups configured

**API Security:**

- [ ] Rate limiting enabled on API endpoints
- [ ] CORS configured correctly (only allow production domain)
- [ ] CSRF protection enabled for OAuth flows
- [ ] SQL injection protection (using Drizzle ORM parameterized queries)
- [ ] XSS protection (React escapes by default)

**Stripe Security:**

- [ ] Using LIVE Stripe keys (not test keys)
- [ ] Webhook signature verification enabled
- [ ] Webhook endpoint uses HTTPS
- [ ] Stripe webhook secret is secure

---

## Deployment Procedures

### Method 1: Manual Deployment

**Step 1: Prepare Server**

```bash
# SSH into production server
ssh user@production-server

# Navigate to application directory
cd /var/www/upsurgeiq

# Pull latest code
git pull origin main
```

**Step 2: Install Dependencies**

```bash
# Install production dependencies only
pnpm install --prod
```

**Step 3: Build Application**

```bash
# Build frontend and backend
pnpm build
```

**Step 4: Run Database Migrations**

```bash
# Apply any new migrations
mysql -h HOST -u USER -p DATABASE < drizzle/0022_performance_indexes.sql
```

**Step 5: Restart Application**

```bash
# Using PM2
pm2 restart upsurgeiq

# OR using systemd
sudo systemctl restart upsurgeiq

# OR using Docker
docker-compose restart
```

**Step 6: Verify Deployment**

```bash
# Check application is running
curl https://upsurgeiq.com/api/health

# Check logs for errors
pm2 logs upsurgeiq --lines 50
# OR
sudo journalctl -u upsurgeiq -n 50
```

---

### Method 2: Docker Deployment

**Dockerfile (if not exists, create it):**

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --prod

# Copy application code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      # ... other env vars
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: upsurgeiq
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

**Deploy with Docker:**

```bash
# Build and start containers
docker-compose up -d --build

# Check logs
docker-compose logs -f app

# Verify health
curl http://localhost:3000/api/health
```

---

### Method 3: CI/CD Pipeline (GitHub Actions)

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run type check
        run: pnpm check
      
      - name: Build application
        run: pnpm build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/upsurgeiq
            git pull origin main
            pnpm install --prod
            pnpm build
            pm2 restart upsurgeiq
```

---

## Post-Deployment Verification

### 1. Application Health Check

**Automated Health Check:**

```bash
#!/bin/bash
# health-check.sh

echo "🏥 Running post-deployment health checks..."

# Check application is responding
echo "1. Checking application health endpoint..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://upsurgeiq.com/api/health)
if [ "$HEALTH" -eq 200 ]; then
  echo "   ✅ Application is healthy"
else
  echo "   ❌ Application health check failed (HTTP $HEALTH)"
  exit 1
fi

# Check database connectivity
echo "2. Checking database connection..."
DB_CHECK=$(curl -s https://upsurgeiq.com/api/health/db)
if echo "$DB_CHECK" | grep -q "ok"; then
  echo "   ✅ Database connection successful"
else
  echo "   ❌ Database connection failed"
  exit 1
fi

# Check Stripe integration
echo "3. Checking Stripe integration..."
STRIPE_CHECK=$(curl -s https://upsurgeiq.com/api/health/stripe)
if echo "$STRIPE_CHECK" | grep -q "ok"; then
  echo "   ✅ Stripe integration working"
else
  echo "   ❌ Stripe integration failed"
  exit 1
fi

# Check email service
echo "4. Checking email service..."
EMAIL_CHECK=$(curl -s https://upsurgeiq.com/api/health/email)
if echo "$EMAIL_CHECK" | grep -q "ok"; then
  echo "   ✅ Email service working"
else
  echo "   ❌ Email service failed"
  exit 1
fi

echo ""
echo "✅ All health checks passed!"
```

---

### 2. Functional Testing

**Critical User Flows to Test:**

- [ ] **User Registration**
  - Visit https://upsurgeiq.com/signup
  - Create new account
  - Verify welcome email received
  - Verify redirect to dashboard

- [ ] **Subscription Purchase**
  - Click "Upgrade" or "Subscribe"
  - Select Starter plan (£49/month)
  - Enter test card: 4242 4242 4242 4242
  - Complete payment
  - Verify subscription active in dashboard
  - Verify payment receipt email received

- [ ] **Press Release Creation**
  - Navigate to Press Releases
  - Click "Create Press Release"
  - Fill in title, content
  - Save as draft
  - Verify press release appears in list

- [ ] **Social Media Connection**
  - Navigate to Settings → Social Media
  - Click "Connect Facebook" (if OAuth configured)
  - Complete OAuth flow
  - Verify connection status shows "Connected"

- [ ] **Business Dossier**
  - Navigate to Settings → Business Profile
  - Fill in company information
  - Save dossier
  - Verify data persists

- [ ] **Team Management**
  - Navigate to Settings → Team
  - Invite team member
  - Verify invitation email sent
  - Accept invitation (in separate browser)
  - Verify team member appears in list

---

### 3. Performance Verification

**Response Time Checks:**

```bash
# Check API response times
echo "Testing API response times..."

# Homepage
time curl -s -o /dev/null https://upsurgeiq.com/

# API endpoint
time curl -s -o /dev/null https://upsurgeiq.com/api/health

# Dashboard (authenticated - requires cookie)
time curl -s -o /dev/null -b "session_cookie" https://upsurgeiq.com/dashboard
```

**Expected Response Times:**

- Homepage: < 1 second
- API health check: < 200ms
- Dashboard: < 2 seconds
- Press release list: < 1 second
- Campaign dashboard: < 1.5 seconds

**Database Query Performance:**

```bash
# Check slow queries
mysql -h HOST -u USER -p -e "
SHOW VARIABLES LIKE 'slow_query_log';
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
"
```

---

### 4. Monitoring Setup Verification

**Check Logs:**

```bash
# Application logs
tail -f /var/log/upsurgeiq/app.log

# Error logs
tail -f /var/log/upsurgeiq/error.log

# Access logs
tail -f /var/log/nginx/upsurgeiq-access.log
```

**Verify Scheduled Jobs:**

```bash
# Check usage notifications job is running
ps aux | grep usageNotificationsJob

# Check job logs
grep "UsageNotificationsJob" /var/log/upsurgeiq/app.log | tail -20
```

---

## Rollback Procedures

### When to Rollback

Rollback immediately if:
- ❌ Critical functionality is broken (e.g., payments failing)
- ❌ Database corruption detected
- ❌ Security vulnerability exposed
- ❌ Application crashes repeatedly
- ❌ Data loss occurring

### Rollback Steps

**Step 1: Stop Current Application**

```bash
# Using PM2
pm2 stop upsurgeiq

# OR using systemd
sudo systemctl stop upsurgeiq

# OR using Docker
docker-compose down
```

**Step 2: Restore Previous Code Version**

```bash
# Revert to previous git commit
git log --oneline -10  # Find previous working commit
git checkout <previous_commit_hash>

# OR restore from backup
cp -r /backups/upsurgeiq-YYYYMMDD/* /var/www/upsurgeiq/
```

**Step 3: Restore Database (if needed)**

```bash
# CRITICAL: Only if database changes caused issues

# Stop application first
pm2 stop upsurgeiq

# Restore database from backup
mysql -h HOST -u USER -p DATABASE < backup_YYYYMMDD_HHMMSS.sql

# Verify restoration
mysql -h HOST -u USER -p DATABASE -e "SELECT COUNT(*) FROM users"
```

**Step 4: Restart Application**

```bash
# Rebuild if needed
pnpm install
pnpm build

# Start application
pm2 start upsurgeiq

# OR
sudo systemctl start upsurgeiq
```

**Step 5: Verify Rollback Success**

```bash
# Run health checks
./health-check.sh

# Check logs for errors
pm2 logs upsurgeiq --lines 50

# Test critical functionality
curl https://upsurgeiq.com/api/health
```

**Step 6: Notify Team**

```bash
# Send notification to team
echo "ROLLBACK COMPLETED: UpsurgeIQ rolled back to previous version due to [REASON]. Current status: [STATUS]" | mail -s "UpsurgeIQ Rollback Alert" christopher@upsurgeiq.com
```

---

## Emergency Contacts

**In case of critical issues during deployment:**

- **Christopher (Owner):** christopher@upsurgeiq.com
- **Development Team:** [Add contact info]
- **DevOps/Infrastructure:** [Add contact info]
- **Database Administrator:** [Add contact info]

**External Support:**

- **Stripe Support:** https://support.stripe.com/
- **SendGrid Support:** https://support.sendgrid.com/
- **MySQL/TiDB Support:** [Add contact info]

---

## Post-Launch Monitoring Checklist

**First 24 Hours:**

- [ ] Monitor error logs every hour
- [ ] Check database connection pool usage
- [ ] Monitor API response times
- [ ] Track Stripe webhook success rate
- [ ] Monitor email delivery rate
- [ ] Check scheduled job execution
- [ ] Monitor user registration rate
- [ ] Track subscription conversion rate

**First Week:**

- [ ] Review all error logs daily
- [ ] Monitor database performance
- [ ] Check for slow queries
- [ ] Review user feedback
- [ ] Monitor credit usage patterns
- [ ] Check for any security alerts
- [ ] Verify backup procedures working

**First Month:**

- [ ] Analyze performance metrics
- [ ] Review and optimize slow queries
- [ ] Check for memory leaks
- [ ] Review error patterns
- [ ] Optimize database indexes if needed
- [ ] Review and update documentation
- [ ] Plan performance improvements

---

## Success Criteria

**Deployment is considered successful when:**

- ✅ All health checks pass
- ✅ No critical errors in logs
- ✅ Users can register and login
- ✅ Payments processing successfully
- ✅ Emails sending correctly
- ✅ Press releases can be created
- ✅ Dashboard loads within 2 seconds
- ✅ Database queries performing well (< 100ms average)
- ✅ Scheduled jobs running on schedule
- ✅ No data loss or corruption
- ✅ Monitoring and alerting active
- ✅ Backups running successfully

---

## Deployment Sign-Off

**Before marking deployment as complete, obtain sign-off:**

- [ ] **Technical Lead:** Verified all technical checks pass
- [ ] **QA Lead:** Verified all functional tests pass
- [ ] **Product Owner (Christopher):** Verified business functionality works
- [ ] **DevOps:** Verified monitoring and backups configured

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Sign-Off:** _______________

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Next Review:** After first production deployment