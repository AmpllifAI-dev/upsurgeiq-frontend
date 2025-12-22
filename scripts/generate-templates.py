#!/usr/bin/env python3
"""
Generate downloadable PR template PDFs for the Resources page
"""

from fpdf import FPDF
import os

# Create output directory
output_dir = "/home/ubuntu/upsurgeiq-frontend/client/public/templates"
os.makedirs(output_dir, exist_ok=True)

class TemplatePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)
        
    def header(self):
        # UpsurgeIQ branding
        self.set_font('Arial', 'B', 16)
        self.set_text_color(0, 128, 128)  # Deep Teal
        self.cell(0, 10, 'UpsurgeIQ', 0, 1, 'L')
        self.set_text_color(0, 0, 0)
        self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
        
    def chapter_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(0, 128, 128)
        self.cell(0, 10, title, 0, 1, 'L')
        self.set_text_color(0, 0, 0)
        self.ln(4)
        
    def section_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 8, title, 0, 1, 'L')
        self.ln(2)
        
    def body_text(self, text):
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 6, text)
        self.ln(3)
        
    def bullet_point(self, text):
        self.set_font('Arial', '', 11)
        self.cell(10, 6, chr(149), 0, 0)  # Bullet character
        self.multi_cell(0, 6, text)


# Template 1: Press Release Template
def create_press_release_template():
    pdf = TemplatePDF()
    pdf.add_page()
    
    pdf.chapter_title('Press Release Template')
    pdf.body_text('Use this template to create professional press releases that capture media attention.')
    pdf.ln(5)
    
    pdf.section_title('FOR IMMEDIATE RELEASE')
    pdf.ln(3)
    
    pdf.section_title('Contact Information')
    pdf.body_text('[Your Name]\n[Your Title]\n[Company Name]\n[Phone Number]\n[Email Address]\n[Website]')
    pdf.ln(5)
    
    pdf.section_title('Headline')
    pdf.body_text('[Write a compelling, newsworthy headline in title case - keep it under 10 words]')
    pdf.ln(3)
    
    pdf.section_title('Subheadline (Optional)')
    pdf.body_text('[Add a supporting subheadline that provides additional context]')
    pdf.ln(3)
    
    pdf.section_title('City, Date')
    pdf.body_text('[CITY, STATE] - [Month Day, Year] -')
    pdf.ln(3)
    
    pdf.section_title('Opening Paragraph')
    pdf.body_text('[Answer the 5 Ws: Who, What, When, Where, Why. Make it newsworthy and concise.]')
    pdf.ln(3)
    
    pdf.section_title('Second Paragraph')
    pdf.body_text('[Provide supporting details, statistics, or context. Explain the significance of your announcement.]')
    pdf.ln(3)
    
    pdf.section_title('Quote')
    pdf.body_text('"[Include a quote from a key stakeholder - CEO, founder, or relevant expert. Make it authentic and insightful.]" - [Name, Title]')
    pdf.ln(3)
    
    pdf.section_title('Third Paragraph')
    pdf.body_text('[Add additional information, benefits, or call-to-action. Include relevant links or resources.]')
    pdf.ln(3)
    
    pdf.section_title('Boilerplate')
    pdf.body_text('About [Company Name]\n[2-3 sentences about your company, its mission, and key achievements. This stays consistent across all press releases.]')
    pdf.ln(3)
    
    pdf.section_title('###')
    pdf.body_text('[This symbol indicates the end of the press release]')
    
    pdf.output(f'{output_dir}/press-release-template.pdf')
    print("✓ Created press-release-template.pdf")


# Template 2: Media Pitch Template
def create_media_pitch_template():
    pdf = TemplatePDF()
    pdf.add_page()
    
    pdf.chapter_title('Media Pitch Template')
    pdf.body_text('Use this template to pitch story ideas directly to journalists and media outlets.')
    pdf.ln(5)
    
    pdf.section_title('Subject Line')
    pdf.body_text('[Personalized, compelling subject line - reference their recent work or beat]')
    pdf.ln(3)
    
    pdf.section_title('Greeting')
    pdf.body_text('Hi [Journalist First Name],')
    pdf.ln(3)
    
    pdf.section_title('Opening (Personalization)')
    pdf.body_text('[Reference their recent article or beat. Show you\'ve done your research.]')
    pdf.ln(3)
    
    pdf.section_title('The Hook')
    pdf.body_text('[Lead with your most newsworthy angle. Why should they care? What makes this timely?]')
    pdf.ln(3)
    
    pdf.section_title('Key Details')
    pdf.body_text('[Provide essential facts, statistics, or unique insights. Keep it concise - 2-3 sentences max.]')
    pdf.ln(3)
    
    pdf.section_title('Why This Matters to Their Audience')
    pdf.body_text('[Explain the relevance to their readers/viewers. Connect to current trends or events.]')
    pdf.ln(3)
    
    pdf.section_title('Expert Availability')
    pdf.body_text('[Offer access to experts, exclusive data, or unique perspectives.]')
    pdf.ln(3)
    
    pdf.section_title('Call to Action')
    pdf.body_text('[Clear next step - "Are you available for a quick call?" or "Would you like the full press release?"]')
    pdf.ln(3)
    
    pdf.section_title('Closing')
    pdf.body_text('Best regards,\n[Your Name]\n[Your Title]\n[Company Name]\n[Phone]\n[Email]')
    pdf.ln(5)
    
    pdf.section_title('Pro Tips:')
    pdf.bullet_point('Keep it under 150 words')
    pdf.bullet_point('Personalize every pitch - no mass emails')
    pdf.bullet_point('Send Tuesday-Thursday, 10am-2pm for best response rates')
    pdf.bullet_point('Follow up once after 3-4 days if no response')
    
    pdf.output(f'{output_dir}/media-pitch-template.pdf')
    print("✓ Created media-pitch-template.pdf")


# Template 3: Campaign Planning Checklist
def create_campaign_checklist():
    pdf = TemplatePDF()
    pdf.add_page()
    
    pdf.chapter_title('Campaign Planning Checklist')
    pdf.body_text('Use this checklist to plan and execute successful PR and marketing campaigns.')
    pdf.ln(5)
    
    pdf.section_title('1. Campaign Strategy')
    pdf.bullet_point('Define campaign objectives (awareness, leads, sales, etc.)')
    pdf.bullet_point('Identify target audience and personas')
    pdf.bullet_point('Set measurable KPIs and success metrics')
    pdf.bullet_point('Determine campaign budget and resource allocation')
    pdf.bullet_point('Establish campaign timeline and key milestones')
    pdf.ln(3)
    
    pdf.section_title('2. Content Creation')
    pdf.bullet_point('Draft press release and key messaging')
    pdf.bullet_point('Create social media content for all platforms')
    pdf.bullet_point('Develop visual assets (images, videos, infographics)')
    pdf.bullet_point('Prepare email templates and sequences')
    pdf.bullet_point('Write blog posts or supporting content')
    pdf.ln(3)
    
    pdf.section_title('3. Media Outreach')
    pdf.bullet_point('Build targeted media list by industry/geography')
    pdf.bullet_point('Research journalists and personalize pitches')
    pdf.bullet_point('Prepare press kit (fact sheet, images, bios)')
    pdf.bullet_point('Schedule media outreach timeline')
    pdf.bullet_point('Prepare spokesperson for interviews')
    pdf.ln(3)
    
    pdf.section_title('4. Distribution Channels')
    pdf.bullet_point('Schedule social media posts across platforms')
    pdf.bullet_point('Distribute press release via newswire services')
    pdf.bullet_point('Send email campaigns to subscriber lists')
    pdf.bullet_point('Update website and blog with campaign content')
    pdf.bullet_point('Coordinate with partners for co-promotion')
    pdf.ln(3)
    
    pdf.section_title('5. Launch Execution')
    pdf.bullet_point('Final review and approval of all materials')
    pdf.bullet_point('Test all links and landing pages')
    pdf.bullet_point('Schedule content across all channels')
    pdf.bullet_point('Brief team on campaign messaging and FAQs')
    pdf.bullet_point('Set up tracking and analytics')
    pdf.ln(3)
    
    pdf.section_title('6. Monitoring & Optimization')
    pdf.bullet_point('Track media coverage and mentions')
    pdf.bullet_point('Monitor social media engagement and sentiment')
    pdf.bullet_point('Analyze website traffic and conversions')
    pdf.bullet_point('Respond to comments and inquiries promptly')
    pdf.bullet_point('Adjust tactics based on performance data')
    pdf.ln(3)
    
    pdf.section_title('7. Post-Campaign Analysis')
    pdf.bullet_point('Compile campaign results and ROI analysis')
    pdf.bullet_point('Document lessons learned and best practices')
    pdf.bullet_point('Share results with stakeholders')
    pdf.bullet_point('Archive campaign assets for future reference')
    pdf.bullet_point('Plan follow-up campaigns based on insights')
    
    pdf.output(f'{output_dir}/campaign-planning-checklist.pdf')
    print("✓ Created campaign-planning-checklist.pdf")


# Template 4: Social Media Content Calendar
def create_social_calendar():
    pdf = TemplatePDF()
    pdf.add_page()
    
    pdf.chapter_title('Social Media Content Calendar Template')
    pdf.body_text('Use this template to plan and organize your social media content across platforms.')
    pdf.ln(5)
    
    pdf.section_title('Monthly Planning Framework')
    pdf.body_text('Plan your content themes, campaigns, and key dates for the month ahead.')
    pdf.ln(3)
    
    pdf.section_title('Week 1: [Theme/Focus]')
    pdf.body_text('Monday:\nPlatform: [Facebook/Instagram/LinkedIn]\nContent Type: [Post/Story/Video]\nTopic: [Brief description]\nCTA: [Call to action]\nHashtags: [Relevant hashtags]\nScheduled Time: [Best posting time]\n')
    pdf.body_text('Tuesday:\n[Repeat format]\n')
    pdf.body_text('Wednesday:\n[Repeat format]\n')
    pdf.ln(3)
    
    pdf.section_title('Content Mix Guidelines')
    pdf.bullet_point('Educational content: 40% (tips, how-tos, industry insights)')
    pdf.bullet_point('Promotional content: 20% (products, services, offers)')
    pdf.bullet_point('Engaging content: 30% (questions, polls, user-generated content)')
    pdf.bullet_point('Company culture: 10% (behind-the-scenes, team highlights)')
    pdf.ln(3)
    
    pdf.section_title('Platform-Specific Best Practices')
    pdf.body_text('Facebook:\n- Post 1-2 times daily\n- Best times: Tue-Thu 1-3pm\n- Use images, videos, and links\n- Encourage comments and shares')
    pdf.ln(2)
    
    pdf.body_text('Instagram:\n- Post 1-2 times daily + Stories\n- Best times: Mon-Fri 11am-1pm\n- High-quality visuals essential\n- Use 5-10 relevant hashtags')
    pdf.ln(2)
    
    pdf.body_text('LinkedIn:\n- Post 2-5 times per week\n- Best times: Tue-Wed 9am-12pm\n- Professional, thought-leadership content\n- Engage with industry discussions')
    pdf.ln(5)
    
    pdf.section_title('Content Batching Tips')
    pdf.bullet_point('Create content in batches (weekly or monthly)')
    pdf.bullet_point('Use scheduling tools to automate posting')
    pdf.bullet_point('Repurpose content across platforms')
    pdf.bullet_point('Leave room for real-time, trending topics')
    pdf.bullet_point('Review analytics weekly to optimize strategy')
    
    pdf.output(f'{output_dir}/social-media-calendar-template.pdf')
    print("✓ Created social-media-calendar-template.pdf")


# Template 5: Press Kit Guide
def create_press_kit_guide():
    pdf = TemplatePDF()
    pdf.add_page()
    
    pdf.chapter_title('Press Kit Guide')
    pdf.body_text('A comprehensive guide to creating a professional press kit that makes journalists\' jobs easier.')
    pdf.ln(5)
    
    pdf.section_title('What is a Press Kit?')
    pdf.body_text('A press kit (or media kit) is a collection of promotional materials that provides journalists with everything they need to write about your company, product, or event. A well-organized press kit saves journalists time and increases your chances of media coverage.')
    pdf.ln(5)
    
    pdf.section_title('Essential Components')
    pdf.ln(2)
    
    pdf.body_text('1. Company Overview\n- Brief company description (2-3 paragraphs)\n- Mission statement and values\n- Key milestones and achievements\n- Founding story and history')
    pdf.ln(3)
    
    pdf.body_text('2. Press Releases\n- Recent press releases (last 6-12 months)\n- Organized by date or category\n- Include both PDF and text versions')
    pdf.ln(3)
    
    pdf.body_text('3. Executive Bios\n- CEO and key executives\n- Professional headshots (high-resolution)\n- Background, expertise, and notable achievements\n- Social media handles')
    pdf.ln(3)
    
    pdf.body_text('4. Product/Service Information\n- Detailed descriptions of offerings\n- Key features and benefits\n- Pricing information (if public)\n- Use cases and customer success stories')
    pdf.ln(3)
    
    pdf.body_text('5. Visual Assets\n- Company logo (multiple formats: PNG, SVG, EPS)\n- Product images (high-resolution, 300 DPI minimum)\n- Infographics and data visualizations\n- Video content or demo links')
    pdf.ln(3)
    
    pdf.body_text('6. Media Coverage\n- Links to recent articles and features\n- Awards and recognition\n- Industry rankings or certifications\n- Testimonials from credible sources')
    pdf.ln(3)
    
    pdf.body_text('7. Contact Information\n- Media contact name, title, email, phone\n- Social media profiles\n- Website and newsroom links\n- Best times to reach for urgent inquiries')
    pdf.ln(5)
    
    pdf.section_title('Distribution Tips')
    pdf.bullet_point('Host your press kit on your website (/press or /media)')
    pdf.bullet_point('Make it easily downloadable (ZIP file option)')
    pdf.bullet_point('Update regularly with latest information')
    pdf.bullet_point('Optimize for mobile viewing')
    pdf.bullet_point('Include a clear call-to-action for media inquiries')
    
    pdf.output(f'{output_dir}/press-kit-guide.pdf')
    print("✓ Created press-kit-guide.pdf")


# Template 6: Crisis Communication Template
def create_crisis_template():
    pdf = TemplatePDF()
    pdf.add_page()
    
    pdf.chapter_title('Crisis Communication Template')
    pdf.body_text('Use this template to respond quickly and effectively during a crisis situation.')
    pdf.ln(5)
    
    pdf.section_title('Immediate Response (First 24 Hours)')
    pdf.ln(2)
    
    pdf.body_text('1. Acknowledge the Situation\n"We are aware of [situation] and are taking it very seriously. Our team is currently investigating and will provide updates as soon as we have more information."')
    pdf.ln(3)
    
    pdf.body_text('2. Express Concern\n"Our top priority is [safety/security/wellbeing] of [customers/employees/community]. We understand the concern this has caused."')
    pdf.ln(3)
    
    pdf.body_text('3. Outline Immediate Actions\n"We have immediately [specific actions taken]. We are working with [relevant authorities/experts] to [resolve/investigate]."')
    pdf.ln(5)
    
    pdf.section_title('Follow-Up Statement (24-48 Hours)')
    pdf.ln(2)
    
    pdf.body_text('1. Provide Facts\n[Clear, factual description of what happened, when, and where. Avoid speculation.]')
    pdf.ln(3)
    
    pdf.body_text('2. Explain Actions Taken\n[Detailed steps your organization has taken to address the situation]')
    pdf.ln(3)
    
    pdf.body_text('3. Accountability\n[Take responsibility where appropriate. Avoid blame or excuses.]')
    pdf.ln(3)
    
    pdf.body_text('4. Prevention Measures\n[Outline steps being taken to prevent recurrence]')
    pdf.ln(3)
    
    pdf.body_text('5. Contact Information\n[Dedicated crisis hotline, email, or information center]')
    pdf.ln(5)
    
    pdf.section_title('Crisis Communication Principles')
    pdf.bullet_point('Respond quickly - silence creates speculation')
    pdf.bullet_point('Be transparent and honest - don\'t hide or minimize')
    pdf.bullet_point('Show empathy - acknowledge impact on stakeholders')
    pdf.bullet_point('Provide regular updates - even if "no new information"')
    pdf.bullet_point('Use consistent messaging across all channels')
    pdf.bullet_point('Monitor social media and respond to concerns')
    pdf.bullet_point('Designate a single spokesperson to avoid confusion')
    pdf.ln(5)
    
    pdf.section_title('Do\'s and Don\'ts')
    pdf.body_text('DO:\n- Prepare statements in advance\n- Coordinate with legal team\n- Monitor media coverage\n- Document all communications\n- Follow up after resolution')
    pdf.ln(3)
    
    pdf.body_text('DON\'T:\n- Speculate or guess\n- Use "no comment"\n- Blame others\n- Get defensive\n- Ignore social media')
    
    pdf.output(f'{output_dir}/crisis-communication-template.pdf')
    print("✓ Created crisis-communication-template.pdf")


# Generate all templates
if __name__ == "__main__":
    print("Generating PR template PDFs...")
    print()
    
    create_press_release_template()
    create_media_pitch_template()
    create_campaign_checklist()
    create_social_calendar()
    create_press_kit_guide()
    create_crisis_template()
    
    print()
    print("✅ All 6 template PDFs created successfully!")
    print(f"📁 Location: {output_dir}")
