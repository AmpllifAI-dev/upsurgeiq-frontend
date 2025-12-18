# upsurgeIQ - AI-Powered PR & Marketing Platform

**Intelligence That Drives Growth**

upsurgeIQ is a comprehensive SaaS platform that empowers businesses with AI-powered press release generation, social media distribution, journalist media list management, conversational AI assistance, and intelligent campaign optimization.

---

## 🚀 Features

### Core Features

- **AI-Powered Press Release Generation** - Create professional press releases using your business dossier and brand voice
- **Social Media Distribution** - Schedule and distribute content across Facebook, Instagram, LinkedIn, and X (Twitter)
- **Journalist Media List Management** - Access curated media lists organized by industry and region
- **Business Dossier** - Comprehensive onboarding captures company information, SIC codes, brand voice, and target audience
- **Conversational AI Assistant** (Pro/Scale) - Real-time PR and marketing consultation with text and voice capabilities
- **Intelligent Campaign Lab** (Scale) - A/B testing with multi-variant campaigns and performance monitoring
- **White-Label Partnership Portal** (Admin) - Manage chambers of commerce and business network partnerships with 20% commission tracking

### Technical Features

- **Stripe Payment Integration** - Subscription management with three pricing tiers (Starter £49, Pro £99, Scale £349)
- **WordPress REST API Integration** - Sync business profiles and press releases with ACF Pro custom fields
- **Role-Based Access Control** - User, admin, and partner roles with appropriate permissions
- **Elegant Design System** - Deep Teal (#008080) and Lime Green (#7FFF00) brand colors with Inter/Poppins typography

---

## 📋 Pricing Tiers

### Starter - £49/month
- 2 press releases per month
- 1 social media channel
- 3 default media lists
- AI-powered content generation
- Basic analytics
- Email support

### Pro - £99/month
- 5 press releases per month
- 3 social media channels
- 5 media lists included
- AI-powered content generation
- **Conversational AI assistant**
- **AI call-in feature**
- Advanced analytics
- Priority support

### Scale - £349/month
- 15 press releases per month
- All 4 social media channels
- 10 media lists included
- AI-powered content generation
- Conversational AI assistant
- AI call-in feature
- **Intelligent Campaign Lab**
- Advanced analytics & reporting
- Priority support
- Dedicated account manager

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui, Wouter (routing)
- **Backend**: Express 4, tRPC 11, Node.js 22
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **Payments**: Stripe
- **AI**: Built-in LLM integration via Manus Forge API
- **CMS**: WordPress REST API with ACF Pro

---

## 📁 Project Structure

```
client/
  src/
    pages/          # Page components (Home, Dashboard, PressReleases, etc.)
    components/     # Reusable UI components (shadcn/ui)
    lib/            # tRPC client configuration
    App.tsx         # Routes and layout
    index.css       # Global styles and design tokens

server/
  routers.ts        # tRPC procedure definitions
  db.ts             # Database query helpers
  stripe.ts         # Stripe integration
  wordpress.ts      # WordPress REST API client
  products.ts       # Pricing tier configuration
  webhooks/         # Webhook handlers (Stripe)
  _core/            # Framework plumbing (OAuth, context, etc.)

drizzle/
  schema.ts         # Database schema definitions
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

The following environment variables are automatically configured by the Manus platform:

- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth backend base URL
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
- `STRIPE_SECRET_KEY` - Stripe secret key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `BUILT_IN_FORGE_API_URL` - Manus built-in APIs
- `BUILT_IN_FORGE_API_KEY` - Bearer token for Manus APIs

---

## 🔧 Configuration

### Stripe Setup

1. Create products in Stripe Dashboard for the three pricing tiers:
   - Starter: £49/month
   - Pro: £99/month
   - Scale: £349/month

2. Add the Stripe Price IDs to `server/products.ts`:

```typescript
export const PRODUCTS: Record<PricingTier, ProductConfig> = {
  starter: {
    // ... other config
    stripePriceId: "price_xxx", // Add your Stripe Price ID here
  },
  // ... pro and scale
};
```

3. Test payments with card number: `4242 4242 4242 4242`

### WordPress Integration

1. Install required WordPress plugins:
   - Advanced Custom Fields (ACF) Pro
   - WordPress REST API (built into WordPress 4.7+)

2. Create ACF field groups:

**Business Profile Fields:**
- company_name (Text)
- industry (Text)
- sic_code (Text)
- website_url (URL)
- brand_voice (Text)
- brand_tone (Text)
- target_audience (Textarea)
- key_messages (Textarea)

**Press Release Fields:**
- headline (Text)
- subheadline (Text)
- body_content (Wysiwyg Editor)
- contact_name (Text)
- contact_email (Email)
- contact_phone (Text)
- release_date (Date Picker)

3. Generate an Application Password in WordPress:
   - Navigate to Users → Your Profile → Application Passwords
   - Create a new application password
   - Enter credentials in upsurgeIQ WordPress Settings page

---

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

All core functionality is covered by vitest tests including:
- Authentication flows
- Subscription management
- Press release creation
- Social media posting
- Media list management
- AI chat functionality
- Campaign creation
- Partner management (admin-only)
- Stripe checkout
- Dashboard stats

---

## 📚 Key Features Documentation

### Business Dossier Onboarding

The multi-step onboarding wizard captures:
1. Company information (name, website, industry)
2. SIC code classification (Section → Division → Group)
3. Brand voice and tone configuration (5 tones × 4 styles)
4. Social media OAuth connections (coming soon)
5. AI image style preferences

### Press Release Generation

1. Navigate to Dashboard → Create Press Release
2. Enter topic, key points, target audience, and tone
3. AI generates professional content using your business dossier
4. Edit and refine the generated content
5. Save as draft or publish immediately
6. Optional: Sync to WordPress CMS

### Social Media Distribution

1. Create a new social media post
2. Select target platforms (Facebook, Instagram, LinkedIn, X)
3. Customize content for each platform
4. Schedule for immediate or future posting
5. Track performance analytics

### Journalist Media Lists

- **Default Lists**: Pre-curated contacts organized by industry (Tech, Finance, Lifestyle) and region (UK, London, National)
- **Custom Lists**: Create your own media lists with custom names and descriptions
- **CSV Import**: (Coming soon) Upload custom contact lists
- **GDPR Compliance**: Email distribution with proper consent management

### Conversational AI Assistant (Pro/Scale)

- Real-time chat interface for PR and marketing consultation
- Context-aware responses using your business dossier
- Voice call-in feature (coming soon with Twilio + Whisper integration)
- Available 24/7 for strategic advice

### Intelligent Campaign Lab (Scale)

- Create campaigns with multiple variants (4-6 variations)
- A/B testing framework for ad creative optimization
- Real-time performance monitoring dashboard
- Budget tracking and progress visualization
- Automatic deployment of winning variations (coming soon)

### White-Label Partnership Portal (Admin)

- Partner registration and onboarding
- 20% recurring commission tracking
- Co-branding customization options
- Partner dashboard with organization details
- Member analytics and reporting

---

## 🔐 Security

- **Authentication**: Manus OAuth with session cookies
- **Authorization**: Role-based access control (user/admin/partner)
- **Payments**: PCI-compliant Stripe integration
- **Webhooks**: Signature verification for all webhook events
- **Database**: Parameterized queries via Drizzle ORM
- **Environment**: Secrets managed via platform environment variables

---

## 📈 Roadmap

### Upcoming Features

- [ ] Social media OAuth connections (Facebook, Instagram, LinkedIn, X)
- [ ] Voice transcription with Whisper API for AI assistant
- [ ] Automatic campaign winner deployment
- [ ] CSV import for custom media lists
- [ ] Email notification system (SendGrid/Mailgun)
- [ ] Sports team integration for motorsport clients
- [ ] Advanced analytics dashboard with custom reports
- [ ] API access for Scale tier customers
- [ ] Mobile app (iOS/Android)

---

## 🤝 Support

For support, feature requests, or bug reports:
- Email: support@upsurgeiq.com
- Documentation: [help.upsurgeiq.com](https://help.upsurgeiq.com)

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

Built with:
- [Manus Platform](https://manus.im) - Hosting and infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI component library
- [Stripe](https://stripe.com) - Payment processing
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [tRPC](https://trpc.io) - End-to-end typesafe APIs

---

**upsurgeIQ** - Intelligence That Drives Growth 🚀
