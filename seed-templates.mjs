import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { campaignTemplates } from "./drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

const defaultTemplates = [
  {
    name: "Product Launch Campaign",
    description: "Comprehensive campaign template for launching a new product or service to market",
    category: "Product Launch",
    goal: "Generate awareness and drive early adoption for new product launch",
    targetAudience: "Early adopters, industry influencers, tech journalists, and target customer segments",
    platforms: "LinkedIn, Twitter, Tech blogs, Industry publications, Email",
    suggestedBudget: "15000.00",
    suggestedDuration: 90,
    strategy: `**Phase 1: Pre-Launch (Weeks 1-4)**
- Build anticipation with teaser content
- Engage industry influencers and beta testers
- Create press kit and media materials
- Schedule exclusive previews for key journalists

**Phase 2: Launch (Weeks 5-6)**
- Coordinate press release distribution
- Host virtual launch event
- Activate social media campaigns
- Deploy email marketing to existing customers

**Phase 3: Post-Launch (Weeks 7-12)**
- Share customer success stories
- Publish thought leadership content
- Monitor and respond to media coverage
- Optimize messaging based on feedback`,
    keyMessages: `1. Innovation: Highlight what makes this product unique and groundbreaking
2. Value Proposition: Clear benefits and ROI for customers
3. Credibility: Leverage testimonials, certifications, or partnerships
4. Urgency: Limited-time launch offers or early-bird incentives`,
    successMetrics: `- Media mentions: 50+ articles in target publications
- Social engagement: 10,000+ impressions, 500+ engagements
- Website traffic: 5,000+ visits to product page
- Lead generation: 500+ qualified leads
- Conversion rate: 5% of leads to customers
- Email open rate: 25%+, click-through rate: 5%+`,
    milestones: JSON.stringify([
      { title: "Press Kit Complete", dueOffset: 7, description: "Finalize all media materials" },
      { title: "Influencer Outreach", dueOffset: 14, description: "Contact 20+ industry influencers" },
      { title: "Press Release Distribution", dueOffset: 35, description: "Distribute to 100+ media outlets" },
      { title: "Launch Event", dueOffset: 42, description: "Host virtual product reveal" },
      { title: "Customer Success Stories", dueOffset: 60, description: "Publish 3+ case studies" },
    ]),
    deliverables: JSON.stringify([
      { title: "Product Press Release", type: "press_release", dueOffset: 30 },
      { title: "Launch Event Deck", type: "presentation", dueOffset: 35 },
      { title: "Social Media Assets", type: "social_post", dueOffset: 28 },
      { title: "Email Campaign", type: "email", dueOffset: 40 },
      { title: "Product Demo Video", type: "video", dueOffset: 38 },
    ]),
    isPublic: 1,
    usageCount: 0,
  },
  {
    name: "Brand Awareness Campaign",
    description: "Build brand recognition and establish thought leadership in your industry",
    category: "Brand Awareness",
    goal: "Increase brand visibility and establish company as industry thought leader",
    targetAudience: "Industry professionals, potential customers, media, and business partners",
    platforms: "LinkedIn, Twitter, Industry blogs, Podcasts, Webinars",
    suggestedBudget: "10000.00",
    suggestedDuration: 60,
    strategy: `**Content Strategy:**
- Publish weekly thought leadership articles
- Host monthly webinars on industry trends
- Participate in industry podcasts and panels
- Share company culture and behind-the-scenes content

**Distribution Strategy:**
- Leverage employee advocacy programs
- Partner with industry publications
- Engage in relevant online communities
- Optimize content for SEO and social sharing

**Engagement Strategy:**
- Respond to all comments and mentions
- Build relationships with industry influencers
- Create shareable infographics and data visualizations
- Host interactive Q&A sessions`,
    keyMessages: `1. Expertise: Position as industry experts and innovators
2. Values: Communicate company mission and core values
3. Community: Build sense of belonging and engagement
4. Transparency: Share authentic stories and insights`,
    successMetrics: `- Brand mentions: 100+ across social and media
- Social following growth: 20% increase
- Website traffic: 30% increase in organic visits
- Content engagement: 1,000+ shares/comments
- Media features: 10+ articles or interviews
- Webinar attendance: 200+ participants per session`,
    milestones: JSON.stringify([
      { title: "Content Calendar Created", dueOffset: 7, description: "Plan 8 weeks of content" },
      { title: "First Webinar Hosted", dueOffset: 21, description: "Launch webinar series" },
      { title: "Podcast Appearances", dueOffset: 30, description: "Secure 3+ podcast interviews" },
      { title: "Influencer Partnerships", dueOffset: 35, description: "Establish 5+ collaborations" },
    ]),
    deliverables: JSON.stringify([
      { title: "Thought Leadership Articles (8)", type: "blog_post", dueOffset: 14 },
      { title: "Webinar Series (2)", type: "webinar", dueOffset: 21 },
      { title: "Infographics (4)", type: "infographic", dueOffset: 28 },
      { title: "Social Media Content Calendar", type: "social_post", dueOffset: 7 },
    ]),
    isPublic: 1,
    usageCount: 0,
  },
  {
    name: "Lead Generation Campaign",
    description: "Drive qualified leads through targeted content and conversion-optimized campaigns",
    category: "Lead Generation",
    goal: "Generate 500+ qualified leads for sales pipeline",
    targetAudience: "Decision-makers in target industries, marketing and sales professionals",
    platforms: "LinkedIn Ads, Google Ads, Email, Webinars, Gated content",
    suggestedBudget: "20000.00",
    suggestedDuration: 45,
    strategy: `**Lead Magnet Creation:**
- Develop high-value gated content (whitepapers, guides, templates)
- Create compelling landing pages with clear CTAs
- Design multi-step lead nurturing sequences

**Paid Advertising:**
- LinkedIn sponsored content targeting job titles
- Google Ads for high-intent keywords
- Retargeting campaigns for website visitors

**Conversion Optimization:**
- A/B test landing page elements
- Optimize form fields for higher completion rates
- Implement progressive profiling for returning visitors

**Lead Nurturing:**
- Automated email drip campaigns
- Personalized follow-up based on behavior
- Sales and marketing alignment on lead scoring`,
    keyMessages: `1. Problem/Solution: Address specific pain points with clear solutions
2. Social Proof: Showcase customer results and testimonials
3. Expertise: Demonstrate deep industry knowledge
4. Value: Emphasize ROI and tangible benefits`,
    successMetrics: `- Total leads generated: 500+
- Cost per lead: Under $40
- Lead quality score: 70%+ marketing qualified
- Conversion rate: 15%+ landing page visitors to leads
- Email engagement: 30%+ open rate, 10%+ CTR
- Sales accepted leads: 40%+ of total leads`,
    milestones: JSON.stringify([
      { title: "Lead Magnet Published", dueOffset: 10, description: "Launch gated whitepaper" },
      { title: "Landing Pages Live", dueOffset: 12, description: "3 conversion-optimized pages" },
      { title: "Ad Campaigns Launched", dueOffset: 14, description: "LinkedIn and Google Ads live" },
      { title: "Nurture Sequences Active", dueOffset: 18, description: "Email automation running" },
      { title: "Mid-Campaign Optimization", dueOffset: 25, description: "Review and optimize performance" },
    ]),
    deliverables: JSON.stringify([
      { title: "Lead Magnet Whitepaper", type: "whitepaper", dueOffset: 10 },
      { title: "Landing Pages (3)", type: "landing_page", dueOffset: 12 },
      { title: "Email Nurture Sequence", type: "email", dueOffset: 16 },
      { title: "Ad Creative Assets", type: "ad_creative", dueOffset: 13 },
      { title: "Webinar Presentation", type: "webinar", dueOffset: 20 },
    ]),
    isPublic: 1,
    usageCount: 0,
  },
  {
    name: "Event Promotion Campaign",
    description: "Drive registrations and attendance for conferences, webinars, or company events",
    category: "Event Promotion",
    goal: "Achieve 500+ registrations and 70%+ attendance rate for upcoming event",
    targetAudience: "Industry professionals, existing customers, prospects, and media",
    platforms: "Email, LinkedIn, Twitter, Event platforms, Partner channels",
    suggestedBudget: "8000.00",
    suggestedDuration: 30,
    strategy: `**Pre-Event (Weeks 1-3):**
- Create event landing page and registration flow
- Launch email invitation campaigns
- Promote through social media and paid ads
- Leverage speaker and partner networks
- Send press releases to industry media

**Event Week:**
- Send reminder emails (3 days, 1 day, 1 hour before)
- Create social media countdown content
- Prepare live-tweet and engagement plan
- Coordinate with speakers and sponsors

**Post-Event:**
- Send thank-you emails with recordings
- Share event highlights and key takeaways
- Nurture attendees with relevant follow-up content
- Survey attendees for feedback`,
    keyMessages: `1. Value: Highlight key speakers, topics, and learning outcomes
2. Exclusivity: Emphasize unique insights or networking opportunities
3. Urgency: Create FOMO with early-bird pricing or limited seats
4. Social Proof: Feature past attendee testimonials`,
    successMetrics: `- Total registrations: 500+
- Attendance rate: 70%+
- Social media reach: 50,000+ impressions
- Email open rate: 35%+
- Post-event engagement: 200+ survey responses
- Lead generation: 100+ qualified leads from attendees`,
    milestones: JSON.stringify([
      { title: "Event Page Live", dueOffset: 3, description: "Registration open" },
      { title: "Email Campaign Launch", dueOffset: 5, description: "First invitation sent" },
      { title: "Early Bird Deadline", dueOffset: 14, description: "Special pricing ends" },
      { title: "Event Day", dueOffset: 28, description: "Host successful event" },
      { title: "Follow-Up Complete", dueOffset: 32, description: "All attendees contacted" },
    ]),
    deliverables: JSON.stringify([
      { title: "Event Landing Page", type: "landing_page", dueOffset: 3 },
      { title: "Email Invitation Series", type: "email", dueOffset: 5 },
      { title: "Social Media Promo Assets", type: "social_post", dueOffset: 4 },
      { title: "Event Press Release", type: "press_release", dueOffset: 7 },
      { title: "Post-Event Survey", type: "survey", dueOffset: 29 },
    ]),
    isPublic: 1,
    usageCount: 0,
  },
  {
    name: "Crisis Management Campaign",
    description: "Respond to negative publicity or crisis situations with strategic communications",
    category: "Crisis Management",
    goal: "Mitigate negative impact, restore brand reputation, and rebuild stakeholder trust",
    targetAudience: "Customers, media, employees, investors, and general public",
    platforms: "Press releases, Social media, Company blog, Email, Media interviews",
    suggestedBudget: "12000.00",
    suggestedDuration: 21,
    strategy: `**Immediate Response (Days 1-3):**
- Assess situation and gather facts
- Activate crisis response team
- Prepare holding statement
- Monitor social media and news coverage
- Respond to urgent inquiries

**Active Management (Days 4-14):**
- Issue official statement or press release
- Conduct media interviews if appropriate
- Provide regular updates to stakeholders
- Address customer concerns directly
- Implement corrective actions

**Recovery Phase (Days 15-21):**
- Share progress on resolution
- Highlight positive steps taken
- Rebuild trust through transparency
- Resume normal communications gradually`,
    keyMessages: `1. Accountability: Take responsibility and show empathy
2. Action: Communicate specific steps being taken
3. Transparency: Provide regular, honest updates
4. Commitment: Demonstrate dedication to preventing recurrence`,
    successMetrics: `- Response time: Statement within 24 hours
- Media coverage: 80%+ balanced or positive mentions
- Social sentiment: Shift from negative to neutral/positive
- Customer retention: Minimize churn to under 5%
- Employee confidence: Internal survey shows 70%+ support
- Stakeholder trust: Positive feedback from key partners`,
    milestones: JSON.stringify([
      { title: "Crisis Team Assembled", dueOffset: 1, description: "Key stakeholders aligned" },
      { title: "Initial Statement Released", dueOffset: 2, description: "Public acknowledgment" },
      { title: "Corrective Actions Announced", dueOffset: 5, description: "Clear action plan shared" },
      { title: "Progress Update", dueOffset: 10, description: "Demonstrate improvements" },
      { title: "Resolution Communicated", dueOffset: 20, description: "Crisis concluded" },
    ]),
    deliverables: JSON.stringify([
      { title: "Holding Statement", type: "press_release", dueOffset: 1 },
      { title: "Official Response", type: "press_release", dueOffset: 2 },
      { title: "FAQ Document", type: "document", dueOffset: 3 },
      { title: "Customer Email", type: "email", dueOffset: 4 },
      { title: "Progress Report", type: "blog_post", dueOffset: 10 },
    ]),
    isPublic: 1,
    usageCount: 0,
  },
  {
    name: "Thought Leadership Campaign",
    description: "Establish executives as industry experts through strategic content and speaking opportunities",
    category: "Thought Leadership",
    goal: "Position CEO/executives as recognized thought leaders in the industry",
    targetAudience: "Industry peers, media, conference organizers, and potential customers",
    platforms: "LinkedIn, Industry publications, Podcasts, Conferences, Company blog",
    suggestedBudget: "7000.00",
    suggestedDuration: 90,
    strategy: `**Content Creation:**
- Publish monthly bylined articles in industry publications
- Create LinkedIn posts sharing unique insights
- Develop original research or industry reports
- Write executive blog posts on company site

**Speaking Opportunities:**
- Apply to speak at 5+ industry conferences
- Participate in panel discussions and roundtables
- Guest on relevant podcasts
- Host webinars on trending topics

**Media Relations:**
- Position as expert source for journalists
- Respond to media requests (HARO, etc.)
- Offer commentary on industry news
- Build relationships with key reporters

**Community Engagement:**
- Engage in LinkedIn discussions
- Comment on industry trends
- Mentor emerging professionals
- Participate in industry associations`,
    keyMessages: `1. Expertise: Demonstrate deep industry knowledge and experience
2. Innovation: Share forward-thinking perspectives
3. Authenticity: Communicate with genuine voice and values
4. Generosity: Freely share insights to help others`,
    successMetrics: `- Published articles: 12+ in target publications
- Speaking engagements: 5+ conferences/events
- Podcast appearances: 6+ episodes
- LinkedIn followers: 50% growth
- Media mentions: 20+ as expert source
- Engagement rate: 5%+ on LinkedIn posts`,
    milestones: JSON.stringify([
      { title: "Content Calendar Finalized", dueOffset: 7, description: "Plan 12 weeks of content" },
      { title: "First Article Published", dueOffset: 14, description: "Byline in major publication" },
      { title: "Conference Speaking Confirmed", dueOffset: 30, description: "Secure 2+ speaking slots" },
      { title: "Podcast Tour Launched", dueOffset: 35, description: "First 3 episodes recorded" },
      { title: "Industry Report Released", dueOffset: 60, description: "Original research published" },
    ]),
    deliverables: JSON.stringify([
      { title: "Bylined Articles (6)", type: "article", dueOffset: 14 },
      { title: "LinkedIn Post Series", type: "social_post", dueOffset: 7 },
      { title: "Conference Presentations (2)", type: "presentation", dueOffset: 45 },
      { title: "Industry Research Report", type: "whitepaper", dueOffset: 60 },
      { title: "Podcast Interview Prep", type: "document", dueOffset: 30 },
    ]),
    isPublic: 1,
    usageCount: 0,
  },
];

console.log("Seeding campaign templates...");

for (const template of defaultTemplates) {
  try {
    await db.insert(campaignTemplates).values(template);
    console.log(`✓ Created template: ${template.name}`);
  } catch (error) {
    console.error(`✗ Failed to create template: ${template.name}`, error.message);
  }
}

console.log("\nTemplate seeding complete!");
await connection.end();
