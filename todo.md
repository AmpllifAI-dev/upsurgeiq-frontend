# upsurgeIQ Project TODO

## Design System & Visual Foundation
- [x] Configure elegant color palette with Deep Teal (#008080) and Lime Green (#7FFF00)
- [x] Set up typography with modern sans-serif fonts (Inter/Poppins)
- [x] Create custom Tailwind theme configuration
- [x] Design landing page with asymmetric layout
- [x] Build navigation structure for public-facing app

## Database Schema & Core Data Structures
- [x] Create businesses table with dossier fields
- [x] Create press_releases table with content and status
- [x] Create social_media_posts table linked to press releases
- [x] Create media_lists table for journalist contacts
- [x] Create media_list_contacts table
- [x] Create subscriptions table with Stripe integration
- [x] Create campaigns table for Campaign Lab
- [x] Create campaign_variants table for A/B testing
- [x] Create partners table for white-label program
- [x] Create sports_teams table with schedule integration
- [x] Create preset_prompts table for AI templates

## Authentication & Subscription Management
- [x] Implement user authentication with Manus OAuth
- [x] Create subscription selection UI with three tiers (Starter £49, Pro £99, Scale £349)
- [ ] Integrate Stripe payment processing
- [x] Build subscription management dashboard
- [x] Implement role-based access control (user/admin/partner)
- [x] Add subscription status checking middleware

## Onboarding Flow & Business Dossier
- [x] Create multi-step onboarding wizard UI
- [x] Build company information form
- [ ] Implement AI-powered website research and analysis
- [x] Create SIC code classification selector (Section → Division → Group)
- [x] Build brand voice and tone configuration (5 tones × 4 styles)
- [ ] Implement OAuth connection flow for Facebook
- [ ] Implement OAuth connection flow for Instagram
- [ ] Implement OAuth connection flow for LinkedIn
- [ ] Implement OAuth connection flow for X (Twitter)
- [x] Create AI image style preference settings
- [ ] Build sports team integration for motorsport clients
- [x] Generate and store business dossier

## AI-Powered Press Release Generation
- [x] Create press release creation form with guided prompts
- [x] Implement AI content generation using business dossier
- [x] Build rich text editor for manual refinement
- [ ] Add AI-powered image generation for press releases
- [x] Create press release preview and approval flow
- [ ] Implement press release scheduling
- [x] Build press release library/history view
- [ ] Add platform-specific social media post generation

## Social Media Distribution System
- [ ] Create social media post composer
- [ ] Implement scheduled posting functionality
- [ ] Build channel-specific tone customization
- [ ] Create social media calendar view
- [ ] Implement post status tracking (draft/scheduled/published)
- [ ] Build analytics dashboard for post performance
- [ ] Add engagement metrics tracking
- [ ] Create cross-platform campaign management (Scale tier)

## Journalist Media List Management
- [ ] Create default media lists by industry/region/geography
- [ ] Build custom media list creation UI
- [ ] Implement CSV upload for journalist contacts
- [ ] Create AI verification system for contacts
- [ ] Build GDPR-compliant opt-in email system
- [ ] Implement email distribution for press releases
- [ ] Create "Share & Earn" program (£0.10 per verified contact)
- [ ] Add media list purchase flow (£4 per list per release)

## Conversational AI Assistant
- [ ] Create text-based AI chat interface
- [ ] Implement conversational content generation
- [ ] Build real-time content refinement through conversation
- [ ] Integrate Twilio for voice call-in feature (Pro/Scale)
- [ ] Implement Whisper transcription for voice input
- [ ] Create email delivery system for voice-drafted content
- [ ] Add AI assistant access control by subscription tier

## Intelligent Campaign Lab
- [ ] Create campaign creation wizard
- [ ] Build multi-variant ad creative generator (4-6 variations)
- [ ] Implement psychological angle testing framework
- [ ] Create real-time performance monitoring dashboard
- [ ] Build automatic winning variation identification
- [ ] Implement continuous redeployment system
- [ ] Create campaign analytics and reporting
- [ ] Add conversational AI for campaign management
- [ ] Integrate with Facebook Ads API
- [ ] Integrate with LinkedIn Ads API
- [ ] Integrate with X Ads API

## White-Label Partnership Portal
- [ ] Create partner registration and onboarding
- [ ] Build co-branded portal customization
- [ ] Implement 20% commission tracking system
- [ ] Create partner dashboard with member analytics
- [ ] Build marketing materials library for partners
- [ ] Implement partner account manager assignment
- [ ] Create commission payout reporting

## WordPress REST API Integration
- [ ] Set up WordPress REST API connection
- [ ] Implement ACF Pro custom fields sync
- [ ] Create business profiles endpoint integration
- [ ] Build press releases CMS integration
- [ ] Implement preset prompts management
- [ ] Create content sync scheduling
- [ ] Build WordPress admin interface for content management

## Additional Features
- [ ] Create admin dashboard for platform management
- [ ] Build user profile management
- [ ] Implement notification system
- [ ] Create help center and documentation
- [ ] Build email template system (SendGrid/Mailgun)
- [ ] Implement usage tracking and limits by tier
- [ ] Create invoice and billing history
- [ ] Build support ticket system
- [ ] Add activity logging and audit trail

## Testing & Quality Assurance
- [ ] Write unit tests for all tRPC procedures
- [ ] Test Stripe payment flows
- [ ] Test OAuth connections for all social platforms
- [ ] Test AI content generation quality
- [ ] Test email delivery and GDPR compliance
- [ ] Test white-label branding customization
- [ ] Perform cross-browser testing
- [ ] Test responsive design on mobile devices
- [ ] Load testing for concurrent users
- [ ] Security audit and penetration testing

## Recent Completions (Phase 7)
- [x] Social media post composer with multi-platform support
- [x] Scheduled posting functionality
- [x] Platform-specific tone customization
- [x] Character limit validation per platform
