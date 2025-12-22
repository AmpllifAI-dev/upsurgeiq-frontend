import { Download, FileText, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Link } from 'wouter';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { usePageTracking } from '../hooks/useTracking';

export function Resources() {
  usePageTracking();
  const resources = [
    {
      title: 'Press Release Template',
      description: 'Professional press release template following AP style guidelines. Includes structure for headline, dateline, body, boilerplate, and media contact information.',
      fileSize: '45 KB',
      format: 'PDF',
      downloadUrl: '/templates/press-release-template.pdf',
      features: [
        'AP Style compliant format',
        'Editable sections with guidance',
        'Media contact template',
        'Boilerplate examples'
      ]
    },
    {
      title: 'Media Pitch Email Template',
      description: 'Proven email template for pitching stories to journalists. Includes subject line formulas, opening hooks, and follow-up sequences that get responses.',
      fileSize: '38 KB',
      format: 'PDF',
      downloadUrl: '/templates/media-pitch-template.pdf',
      features: [
        'Subject line formulas',
        'Personalization framework',
        'Follow-up sequence',
        'Timing best practices'
      ]
    },
    {
      title: 'PR Campaign Checklist',
      description: 'Complete checklist for planning and executing successful PR campaigns. Covers strategy, content creation, distribution, and measurement.',
      fileSize: '52 KB',
      format: 'PDF',
      downloadUrl: '/templates/campaign-planning-checklist.pdf',
      features: [
        'Pre-launch planning checklist',
        'Content creation workflow',
        'Distribution channel matrix',
        'Success metrics framework'
      ]
    },
    {
      title: 'Social Media Content Calendar',
      description: 'Monthly planning template for coordinating social media posts across platforms. Includes content themes, posting schedules, and engagement tracking.',
      fileSize: '128 KB',
      format: 'PDF',
      downloadUrl: '/templates/social-media-calendar-template.pdf',
      features: [
        'Multi-platform planning grid',
        'Content theme tracker',
        'Optimal posting times',
        'Engagement metrics dashboard'
      ]
    },
    {
      title: 'Press Kit Guide',
      description: 'Comprehensive guide to creating professional press kits that make journalists\' jobs easier. Includes essential components, visual assets, and distribution tips.',
      fileSize: '1.2 MB',
      format: 'PDF',
      downloadUrl: '/templates/press-kit-guide.pdf',
      features: [
        'Essential components checklist',
        'Visual asset requirements',
        'Distribution best practices',
        'Media contact guidelines'
      ]
    },
    {
      title: 'Crisis Communication Playbook',
      description: 'Essential framework for handling PR crises effectively. Includes response templates, escalation procedures, and post-crisis analysis.',
      fileSize: '890 KB',
      format: 'PDF',
      downloadUrl: '/templates/crisis-communication-template.pdf',
      features: [
        'Crisis severity assessment',
        'Response templates by scenario',
        'Stakeholder communication matrix',
        'Post-crisis review framework'
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Free PR Resources & Templates | UpsurgeIQ"
        description="Download free PR templates, guides, and checklists. Professional press release templates, media pitch emails, campaign checklists, and crisis communication playbooks."
        keywords="PR templates, press release template, media pitch template, PR checklist, social media calendar, crisis communication"
      />

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-centre justify-between">
          <Link href="/">
            <a className="flex items-centre space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                UpsurgeIQ
              </span>
            </a>
          </Link>

          <nav className="hidden md:flex items-centre space-x-6">
            <Link href="/about"><a className="text-sm font-medium hover:text-primary transition-colours">About</a></Link>
            <Link href="/blog"><a className="text-sm font-medium hover:text-primary transition-colours">Blog</a></Link>
            <Link href="/pricing-calculator"><a className="text-sm font-medium hover:text-primary transition-colours">Pricing</a></Link>
            <Link href="/resources"><a className="text-sm font-medium text-primary">Resources</a></Link>
            <Link href="/contact"><a className="text-sm font-medium hover:text-primary transition-colours">Contact</a></Link>
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          </nav>

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <span className="sr-only">Menu</span>
              ☰
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-4xl text-centre">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Free PR Resources & Templates
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Professional templates, guides, and checklists to elevate your PR and marketing efforts. Download instantly and start implementing proven strategies today.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-muted rounded">
                    {resource.format}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {resource.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {resource.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-centre justify-between pt-4 border-t">
                  <span className="text-xs text-muted-foreground">{resource.fileSize}</span>
                  <a href={resource.downloadUrl} download>
                    <Button size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container max-w-4xl text-centre text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for AI-Powered PR Automation?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            These templates are just the beginning. UpsurgeIQ automates your entire PR workflow with AI-powered content generation, intelligent media targeting, and campaign optimisation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-centre">
            <Link href="/subscribe">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing-calculator">
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 border-white/20">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="container py-16">
        <NewsletterSignup 
          source="resources_page"
          title="Get More Free PR & Marketing Resources"
          description="Join thousands of PR professionals receiving exclusive templates, guides, and industry insights. No spam, unsubscribe anytime."
        />
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-24">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/"><a className="hover:text-primary transition-colours">Features</a></Link></li>
                <li><Link href="/pricing-calculator"><a className="hover:text-primary transition-colours">Pricing</a></Link></li>
                <li><Link href="/testimonials"><a className="hover:text-primary transition-colours">Testimonials</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about"><a className="hover:text-primary transition-colours">About Us</a></Link></li>
                <li><Link href="/blog"><a className="hover:text-primary transition-colours">Blog</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-primary transition-colours">Contact</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy"><a className="hover:text-primary transition-colours">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="hover:text-primary transition-colours">Terms of Service</a></Link></li>
                <li><Link href="/cookie-policy"><a className="hover:text-primary transition-colours">Cookie Policy</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq"><a className="hover:text-primary transition-colours">FAQ</a></Link></li>
                <li><Link href="/status"><a className="hover:text-primary transition-colours">Status</a></Link></li>
                <li><Link href="/report-issue"><a className="hover:text-primary transition-colours">Report Issue</a></Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-centre text-sm text-muted-foreground">
            <p>© 2025 Life's Passions Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
