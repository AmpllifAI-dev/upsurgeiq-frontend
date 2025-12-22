# upsurgeIQ Project TODO

## Press Release Distribution System

### Backend Implementation (Completed)
- [x] Create database schema for media list categories and journalist contacts
- [x] Create AI media list generation service
- [x] Create background job processor for AI generation
- [x] Create email notification service
- [x] Create credit management system
- [x] Create payment system for credit bundles
- [x] Create image hosting system for press releases
- [x] Create email distribution service
- [x] Create save for later functionality
- [x] Create 24hr reminder email system
- [x] Add tRPC procedures for all features

### Frontend Implementation (Documentation Complete)
- [x] Document media list categories browse page
- [x] Document credit management page with purchase options
- [x] Document generation status tracking UI
- [x] Document press release distribution flow
- [x] Fix privacy protection rules (only show publications for AI-generated lists)
- [x] Add "Being Generated" status scenario (shared generation queue)
- [x] Correct Genre definition to lifestyle/hobby-based categories

### Frontend UI Pages (Complete)
- [x] Create MediaListCategories page with tab navigation
- [x] Create CategoryPublications view page (AI-generated lists)
- [x] Create CreditManagement page with purchase flow
- [x] Update Home page with navigation and features
- [x] Register all routes in App.tsx
- [ ] Create DistributePressRelease page (future feature)
- [ ] Create SavedDistributions page (future feature)
- [ ] Create DistributionReport page (future feature)

### Stripe Integration (Complete)
- [x] Create Stripe service with product configuration
- [x] Create webhook handler for credit fulfillment
- [x] Add tRPC procedures for checkout
- [x] Create credit bundle products in Stripe (10, 20, 30 credits)
- [x] Replace placeholder Stripe product IDs with real Price IDs
- [x] Write and pass vitest tests for media lists and credits
- [ ] Configure webhook endpoint in Stripe Dashboard (manual step - user action required)
