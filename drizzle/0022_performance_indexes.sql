-- Performance Optimization: Add Database Indexes
-- Created: 2025-12-26
-- Purpose: Improve query performance for frequently accessed tables

-- ============================================
-- CRITICAL INDEXES (Authentication & Core Queries)
-- ============================================

-- Users table: Critical for authentication
CREATE INDEX `idx_users_open_id` ON `users` (`open_id`);
CREATE INDEX `idx_users_email` ON `users` (`email`);

-- ============================================
-- PRESS RELEASES INDEXES
-- ============================================

-- Single column indexes for flexibility
CREATE INDEX `idx_press_releases_business_id` ON `press_releases` (`business_id`);
CREATE INDEX `idx_press_releases_user_id` ON `press_releases` (`user_id`);
CREATE INDEX `idx_press_releases_status` ON `press_releases` (`status`);
CREATE INDEX `idx_press_releases_created_at` ON `press_releases` (`created_at` DESC);

-- Composite index for optimal list queries (business + ordering)
CREATE INDEX `idx_press_releases_business_created` ON `press_releases` (`business_id`, `created_at` DESC);

-- Composite index for filtered queries (business + status + ordering)
CREATE INDEX `idx_press_releases_business_status_created` ON `press_releases` (`business_id`, `status`, `created_at` DESC);

-- ============================================
-- CAMPAIGNS INDEXES
-- ============================================

CREATE INDEX `idx_campaigns_business_id` ON `campaigns` (`business_id`);
CREATE INDEX `idx_campaigns_user_id` ON `campaigns` (`user_id`);
CREATE INDEX `idx_campaigns_status` ON `campaigns` (`status`);
CREATE INDEX `idx_campaigns_created_at` ON `campaigns` (`created_at` DESC);

-- Composite index for optimal list queries
CREATE INDEX `idx_campaigns_business_created` ON `campaigns` (`business_id`, `created_at` DESC);

-- Composite index for filtered queries
CREATE INDEX `idx_campaigns_business_status_created` ON `campaigns` (`business_id`, `status`, `created_at` DESC);

-- ============================================
-- CAMPAIGN VARIANTS INDEXES
-- ============================================

-- Foreign key index for joining with campaigns
CREATE INDEX `idx_campaign_variants_campaign_id` ON `campaign_variants` (`campaign_id`);
CREATE INDEX `idx_campaign_variants_created_at` ON `campaign_variants` (`created_at` DESC);

-- Composite index for optimal variant loading
CREATE INDEX `idx_campaign_variants_campaign_created` ON `campaign_variants` (`campaign_id`, `created_at` DESC);

-- ============================================
-- MEDIA LISTS INDEXES
-- ============================================

CREATE INDEX `idx_media_lists_business_id` ON `media_lists` (`business_id`);
CREATE INDEX `idx_media_lists_user_id` ON `media_lists` (`user_id`);
CREATE INDEX `idx_media_lists_created_at` ON `media_lists` (`created_at` DESC);

-- Composite index for optimal list queries
CREATE INDEX `idx_media_lists_business_created` ON `media_lists` (`business_id`, `created_at` DESC);

-- ============================================
-- MEDIA LIST CONTACTS INDEXES
-- ============================================

-- Foreign key index for joining with media lists
CREATE INDEX `idx_media_list_contacts_list_id` ON `media_list_contacts` (`media_list_id`);
CREATE INDEX `idx_media_list_contacts_created_at` ON `media_list_contacts` (`created_at` DESC);

-- ============================================
-- SOCIAL MEDIA POSTS INDEXES
-- ============================================

CREATE INDEX `idx_social_media_posts_press_release_id` ON `social_media_posts` (`press_release_id`);
CREATE INDEX `idx_social_media_posts_business_id` ON `social_media_posts` (`business_id`);
CREATE INDEX `idx_social_media_posts_created_at` ON `social_media_posts` (`created_at` DESC);

-- ============================================
-- SUBSCRIPTIONS INDEXES
-- ============================================

CREATE INDEX `idx_subscriptions_user_id` ON `subscriptions` (`user_id`);
CREATE INDEX `idx_subscriptions_stripe_subscription_id` ON `subscriptions` (`stripe_subscription_id`);
CREATE INDEX `idx_subscriptions_status` ON `subscriptions` (`status`);

-- Composite index for user subscription lookups
CREATE INDEX `idx_subscriptions_user_status` ON `subscriptions` (`user_id`, `status`);

-- ============================================
-- BUSINESSES INDEXES
-- ============================================

CREATE INDEX `idx_businesses_user_id` ON `businesses` (`user_id`);
CREATE INDEX `idx_businesses_created_at` ON `businesses` (`created_at` DESC);

-- ============================================
-- JOURNALISTS INDEXES
-- ============================================

CREATE INDEX `idx_journalists_user_id` ON `journalists` (`user_id`);
CREATE INDEX `idx_journalists_media_outlet_id` ON `journalists` (`media_outlet_id`);
CREATE INDEX `idx_journalists_status` ON `journalists` (`status`);
CREATE INDEX `idx_journalists_email` ON `journalists` (`email`);

-- ============================================
-- APPROVAL REQUESTS INDEXES
-- ============================================

CREATE INDEX `idx_approval_requests_press_release_id` ON `approval_requests` (`press_release_id`);
CREATE INDEX `idx_approval_requests_requester_id` ON `approval_requests` (`requester_id`);
CREATE INDEX `idx_approval_requests_approver_id` ON `approval_requests` (`approver_id`);
CREATE INDEX `idx_approval_requests_status` ON `approval_requests` (`status`);
CREATE INDEX `idx_approval_requests_created_at` ON `approval_requests` (`created_at` DESC);

-- Composite index for pending approvals
CREATE INDEX `idx_approval_requests_status_created` ON `approval_requests` (`status`, `created_at` DESC);

-- ============================================
-- TEAM MEMBERS INDEXES
-- ============================================

CREATE INDEX `idx_team_members_business_id` ON `team_members` (`business_id`);
CREATE INDEX `idx_team_members_user_id` ON `team_members` (`user_id`);
CREATE INDEX `idx_team_members_status` ON `team_members` (`status`);

-- Composite index for user-business lookups
CREATE INDEX `idx_team_members_user_business` ON `team_members` (`user_id`, `business_id`);

-- ============================================
-- CREDIT USAGE INDEXES (Admin Monitoring)
-- ============================================

CREATE INDEX `idx_credit_usage_user_id` ON `credit_usage` (`user_id`);
CREATE INDEX `idx_credit_usage_feature_type` ON `credit_usage` (`feature_type`);
CREATE INDEX `idx_credit_usage_created_at` ON `credit_usage` (`created_at` DESC);

-- Composite index for user credit tracking
CREATE INDEX `idx_credit_usage_user_created` ON `credit_usage` (`user_id`, `created_at` DESC);

-- ============================================
-- NOTIFICATION PREFERENCES INDEXES
-- ============================================

CREATE INDEX `idx_notification_preferences_user_id` ON `notification_preferences` (`user_id`);

-- ============================================
-- CONTENT VERSIONS INDEXES
-- ============================================

CREATE INDEX `idx_content_versions_press_release_id` ON `content_versions` (`press_release_id`);
CREATE INDEX `idx_content_versions_user_id` ON `content_versions` (`user_id`);
CREATE INDEX `idx_content_versions_version_number` ON `content_versions` (`version_number` DESC);

-- ============================================
-- EMAIL CAMPAIGNS INDEXES
-- ============================================

CREATE INDEX `idx_email_campaigns_status` ON `email_campaigns` (`status`);
CREATE INDEX `idx_email_campaigns_scheduled_at` ON `email_campaigns` (`scheduled_at`);
CREATE INDEX `idx_email_campaigns_created_at` ON `email_campaigns` (`created_at` DESC);

-- ============================================
-- PERFORMANCE NOTES
-- ============================================

-- Index Naming Convention:
-- idx_{table_name}_{column_name(s)}
--
-- Index Types:
-- 1. Single column indexes: For flexible query patterns
-- 2. Composite indexes: For specific query patterns (most selective column first)
-- 3. Foreign key indexes: For JOIN operations
--
-- Expected Improvements:
-- - Press release list queries: 50-70% faster
-- - Campaign dashboard: 60-80% faster with batch loading
-- - Media lists: 40-60% faster
-- - Authentication queries: 80-90% faster
--
-- Monitoring:
-- - Use EXPLAIN to verify index usage
-- - Monitor slow query log for additional optimization opportunities
-- - Check index size and maintenance overhead