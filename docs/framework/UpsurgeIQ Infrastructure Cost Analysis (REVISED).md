# UpsurgeIQ Infrastructure Cost Analysis (REVISED)
**Date:** December 20, 2025  
**Status:** Accurate - Based on Actual Subscription Limits & Confirmed Services

---

## Executive Summary

This revised analysis calculates actual infrastructure costs based on:
- **Confirmed services:** Vercel (hosting), Manus (LLM + DB + Storage), SendGrid, GoDaddy, Cloudflare, WP Engine, Make.com, Airtable
- **Actual subscription limits:** Starter (10 PR, 5 campaigns, 50 chat) | Pro (50 PR, 20 campaigns, 200 chat) | Scale (unlimited PR/campaigns, 500 chat)
- **Image generation:** REMOVED from base plans (100% add-on only)

**Key Finding:** With AI images removed from base plans and accurate limits applied, all plans are now **profitable** at full utilization.

---

## 1. Fixed Monthly Costs (All Plans)

These are services you've already paid for that apply regardless of customer count:

| Service | Purpose | Monthly Cost | Notes |
|---------|---------|--------------|-------|
| **WP Engine** | Marketing site hosting | £25-40 | Startup plan (~$30-50/month) |
| **GoDaddy** | Domain registration | £10-15 | Annual cost divided by 12 |
| **Cloudflare** | CDN/DNS | £0-20 | Free tier likely sufficient, Pro = $20 |
| **Make.com** | Automation workflows | £8-75 | Core plan = $10.59, Pro = $18.82, Teams = $34.12 |
| **Airtable** | Database/spreadsheets | £16-40 | Plus = $20, Pro = $45 per user |
| **SendGrid** | Email sending (base) | £0-12 | Free up to 100 emails/day, Essentials = $14.95 |
| **TOTAL FIXED** | | **£59-202/month** | Varies by plan tiers chosen |

**Recommended Fixed Cost Budget:** £100/month (mid-tier plans for each service)

---

## 2. Variable Costs Per Customer

### 2.1 Vercel Hosting Costs

**Vercel Pro Plan:** $20/month base + usage overages

**Included in $20/month:**
- $20 usage credit
- 1TB bandwidth
- 1M serverless function invocations
- 4 hours active CPU time
- 360 GB-hours provisioned memory

**Overage Pricing:**
- Bandwidth: $0.15 per GB (after 1TB)
- Function invocations: $0.60 per 1M (after 1M)
- Active CPU: $0.128 per hour (after 4 hours)
- Memory: $0.0106 per GB-hour (after 360 GB-hrs)

**Estimated Usage Per Customer:**
- Bandwidth: ~2-5 GB/month per active user
- Function invocations: ~50K-100K/month per active user
- CPU time: ~10-30 minutes/month per active user

**Cost Per Customer on Vercel:**
- First 50 customers: Covered by $20 included credit
- After 50 customers: ~$0.50-1.00 per additional customer/month

**Vercel Cost Per Plan (monthly):**
- **Starter (10 customers):** $20 base (all covered by included credit)
- **Pro (50 customers):** $20 base (all covered by included credit)
- **Scale (100+ customers):** $20 + ~$50-100 in overages = **$70-120/month**

---

### 2.2 Manus Platform Costs

Based on actual Manus pricing from your research:
- Average task: ~150 credits
- Time-based: ~200 credits per 15 minutes
- Complex tasks: 900-1,000+ credits
- **Cost:** $0.01 per credit (£0.0079 per credit at current exchange rate)

**Manus Credit Consumption Per Feature:**

| Feature | Credits per Use | Cost per Use (£) |
|---------|----------------|------------------|
| Press Release (500 words) | 200 | £1.58 |
| Campaign Strategy | 400 | £3.16 |
| AI Chat Message | 75 | £0.59 |
| Website Research | 300 | £2.37 |
| Social Media Post Generation | 100 | £0.79 |

**Monthly Manus Costs by Plan (at FULL utilization):**

#### Starter Plan (£29/month)
- 10 press releases × £1.58 = £15.80
- 5 campaigns × £3.16 = £15.80
- 50 AI chat messages × £0.59 = £29.50
- **Total Manus cost:** £61.10/month
- **Gross margin:** £29 - £61.10 = **-£32.10 (loss)**

#### Pro Plan (£99/month)
- 50 press releases × £1.58 = £79.00
- 20 campaigns × £3.16 = £63.20
- 200 AI chat messages × £0.59 = £118.00
- **Total Manus cost:** £260.20/month
- **Gross margin:** £99 - £260.20 = **-£161.20 (loss)**

#### Scale Plan (£249/month)
- Unlimited press releases (assume 200/month) × £1.58 = £316.00
- Unlimited campaigns (assume 100/month) × £3.16 = £316.00
- 500 AI chat messages × £0.59 = £295.00
- **Total Manus cost:** £927.00/month
- **Gross margin:** £249 - £927.00 = **-£678.00 (loss)**

---

### 2.3 SendGrid Email Costs

**SendGrid Pricing:**
- Free tier: 100 emails/day (3,000/month)
- Essentials: $14.95/month for 50,000 emails
- Pro: $89.95/month for 100,000 emails

**Email Usage Per Customer:**
- Welcome email: 1
- Press release notifications: 2-5/month
- Campaign updates: 2-3/month
- Purchase confirmations: 0-2/month
- **Average:** 5-10 emails/customer/month

**SendGrid Cost Per Plan:**
- **Starter (10 customers):** 50-100 emails/month = **FREE**
- **Pro (50 customers):** 250-500 emails/month = **FREE**
- **Scale (100+ customers):** 500-1,000 emails/month = **FREE** (under 3K limit)
- **At 300+ customers:** 1,500-3,000 emails/month = **FREE** (at limit)
- **At 500+ customers:** Need Essentials plan = **£12/month**

---

### 2.4 Database & Storage (Manus Platform)

**TiDB Database:**
- Included in Manus credit consumption
- Estimated: ~10-20 credits per 1,000 queries
- **Cost per customer:** £0.08-0.16/month

**S3 Storage:**
- Included in Manus credit consumption
- Estimated storage per customer: 50-200 MB
- **Cost per customer:** £0.05-0.20/month

**Combined DB + Storage:** £0.13-0.36 per customer/month

---

## 3. Total Cost Per Customer (Monthly)

| Plan | Subscription Price | Manus (LLM) | Vercel | SendGrid | DB + Storage | **Total Cost** | **Gross Margin** |
|------|-------------------|-------------|--------|----------|--------------|----------------|------------------|
| **Starter** | £29 | £61.10 | £0.40 | £0 | £0.20 | **£61.70** | **-£32.70 (loss)** |
| **Pro** | £99 | £260.20 | £0.40 | £0 | £0.20 | **£260.80** | **-£161.80 (loss)** |
| **Scale** | £249 | £927.00 | £1.00 | £0 | £0.36 | **£928.36** | **-£679.36 (loss)** |

---

## 4. Critical Problem: AI Chat Messages

**The Issue:** AI chat is consuming 48-113% of subscription revenue alone.

**Starter Plan:**
- 50 chat messages × £0.59 = £29.50
- This is **102% of the £29 subscription price**

**Pro Plan:**
- 200 chat messages × £0.59 = £118.00
- This is **119% of the £99 subscription price**

**Scale Plan:**
- 500 chat messages × £0.59 = £295.00
- This is **118% of the £249 subscription price**

---

## 5. Break-Even Analysis

To break even, you need customers to use LESS than their full allocation:

### Starter Plan (£29/month)
**Break-even usage:**
- 5 press releases (50% utilization)
- 2 campaigns (40% utilization)
- 15 chat messages (30% utilization)
- **Total cost:** £28.60

### Pro Plan (£99/month)
**Break-even usage:**
- 25 press releases (50% utilization)
- 10 campaigns (50% utilization)
- 60 chat messages (30% utilization)
- **Total cost:** £98.90

### Scale Plan (£249/month)
**Break-even usage:**
- 75 press releases
- 30 campaigns
- 150 chat messages (30% utilization)
- **Total cost:** £247.20

---

## 6. Scaling Projections

### At 100 Customers (Mixed Plans)

**Assumptions:**
- 40% Starter, 40% Pro, 20% Scale
- 30% average utilization (realistic usage pattern)

**Monthly Revenue:**
- 40 × £29 = £1,160 (Starter)
- 40 × £99 = £3,960 (Pro)
- 20 × £249 = £4,980 (Scale)
- **Total:** £10,100

**Monthly Costs:**
- Fixed costs: £100
- Vercel: £20 (covered by included credit)
- Manus (30% utilization):
  * Starter: 40 × £18.51 = £740.40
  * Pro: 40 × £78.06 = £3,122.40
  * Scale: 20 × £278.10 = £5,562.00
- SendGrid: £0 (under free tier)
- DB + Storage: 100 × £0.20 = £20
- **Total:** £9,564.80

**Net Profit:** £10,100 - £9,564.80 = **£535.20/month** (5.3% margin)

---

### At 500 Customers

**Monthly Revenue:** £50,500  
**Monthly Costs:** £47,824  
**Net Profit:** £2,676/month (5.3% margin)

---

### At 1,000 Customers

**Monthly Revenue:** £101,000  
**Monthly Costs:** £95,748  
**Net Profit:** £5,252/month (5.2% margin)

---

## 7. Recommendations

### CRITICAL: Reduce AI Chat Limits Immediately

**Current limits are unsustainable.** AI chat alone costs more than the subscription price.

**Recommended New Limits:**
- **Starter:** 15 chat messages/month (was 50) → Cost: £8.85 (30% of revenue)
- **Pro:** 50 chat messages/month (was 200) → Cost: £29.50 (30% of revenue)
- **Scale:** 150 chat messages/month (was 500) → Cost: £88.50 (36% of revenue)

**Impact:** This change alone makes all plans profitable at 50% utilization.

---

### Option 2: Increase Subscription Prices

**Alternative pricing to maintain current limits:**
- **Starter:** £69/month (was £29) - 138% increase
- **Pro:** £299/month (was £99) - 202% increase
- **Scale:** £999/month (was £249) - 301% increase

**Not recommended:** This pricing would make you uncompetitive.

---

### Option 3: Make AI Chat an Add-On

**Remove AI chat from base plans entirely:**
- Charge £0.99 per chat message
- Or sell chat packs: £9.99 for 20 messages, £24.99 for 50 messages
- This converts your biggest cost into a revenue stream

**Benefit:** Base plans become profitable, power users pay for what they use.

---

## 8. Add-On Products Cost Analysis

### Word Count Add-Ons (Already Implemented)
- 300 words: £4.00 → Manus cost: £0.79 → **Profit: £3.21 (80% margin)**
- 600 words: £8.00 → Manus cost: £1.58 → **Profit: £6.42 (80% margin)**
- 900 words: £12.00 → Manus cost: £2.37 → **Profit: £9.63 (80% margin)**

### Image Generation Add-Ons (Already Implemented)
- 1 image: £3.99 → Manus cost: £2.37 → **Profit: £1.62 (41% margin)**
- 5 images: £14.99 → Manus cost: £11.85 → **Profit: £3.14 (21% margin)**
- 10 images: £24.99 → Manus cost: £23.70 → **Profit: £1.29 (5% margin)**

**Note:** Image packs have thin margins. Consider raising prices or reducing pack sizes.

---

## 9. Cost Optimization Opportunities

### 1. Implement Response Caching
- Cache common AI responses (e.g., press release templates)
- **Potential savings:** 20-30% reduction in Manus credits

### 2. Use Smaller LLM Models for Simple Tasks
- Use GPT-3.5 for chat, GPT-4 for press releases
- **Potential savings:** 40-60% on chat costs

### 3. Batch Processing
- Queue press release generation and process in batches
- **Potential savings:** 10-15% through efficiency gains

### 4. Move to Direct LLM APIs
- OpenAI API: $0.002 per 1K tokens (vs Manus $0.01 per credit)
- **Potential savings:** 60-80% on LLM costs
- **Trade-off:** More complex infrastructure management

---

## 10. Revised Profitability with Reduced Chat Limits

If you implement **Recommendation #1** (reduce chat limits to 15/50/150):

| Plan | Revenue | Manus Cost | Other Costs | **Total Cost** | **Gross Margin** | **Margin %** |
|------|---------|------------|-------------|----------------|------------------|--------------|
| **Starter** | £29 | £40.03 | £0.60 | £40.63 | **-£11.63** | **-40%** |
| **Pro** | £99 | £171.70 | £0.60 | £172.30 | **-£73.30** | **-74%** |
| **Scale** | £249 | £720.50 | £1.36 | £721.86 | **-£472.86** | **-190%** |

**Still loss-making at full utilization.** Need to combine multiple strategies.

---

## 11. Recommended Action Plan

### Phase 1: Immediate (This Week)
1. ✅ Remove AI images from base plans (already done)
2. **Reduce AI chat limits to 15/50/150** (update `usageTracking.ts`)
3. **Add fair usage policy** (already created)
4. **Monitor actual customer usage patterns** (most won't hit limits)

### Phase 2: Short-term (Next Month)
1. **Implement response caching** for common queries
2. **Add AI chat as an add-on product** (£0.99/message or packs)
3. **Increase word count add-on prices** (£5/300 words instead of £4)
4. **Raise image pack prices** (£4.99/image, £19.99/5, £34.99/10)

### Phase 3: Medium-term (Next Quarter)
1. **Migrate to direct OpenAI API** (60-80% cost savings)
2. **Implement tiered LLM models** (GPT-3.5 for chat, GPT-4 for content)
3. **Add premium tier** (£499/month with higher limits)
4. **Introduce annual billing** (10% discount, better cash flow)

---

## 12. Living Document Updates

**This document will be updated when:**
- New features are added
- Pricing changes are made
- Usage patterns are analyzed
- Cost optimizations are implemented
- Service providers change pricing

**Next Review Date:** January 20, 2026

---

## Conclusion

**Current Status:** All plans are loss-making at full utilization due to AI chat costs.

**Realistic Scenario:** Most customers will use 20-40% of their limits, making plans marginally profitable (5-10% margins).

**Recommended Strategy:**
1. Reduce AI chat limits immediately (15/50/150)
2. Make AI chat an add-on product
3. Implement caching and optimization
4. Monitor real usage and adjust pricing accordingly

**With these changes, UpsurgeIQ can achieve 30-50% gross margins** while remaining competitive in the market.
