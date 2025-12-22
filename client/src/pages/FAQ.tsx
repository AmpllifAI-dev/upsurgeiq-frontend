import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "wouter";

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openQuestions, setOpenQuestions] = useState<number[]>([0]); // First question open by default

  const toggleQuestion = (index: number) => {
    setOpenQuestions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How does the free trial work?",
          a: "Our free trial gives you full access to all features of your chosen plan for 14 days. No credit card required to start. You can create press releases, manage media lists, and explore all platform features. If you decide to continue after the trial, simply add your payment information."
        },
        {
          q: "What's included in each pricing tier?",
          a: "Starter (£49/month) includes 2 AI-generated campaigns, 3 social platforms, and unlimited user-composed posts. Pro (£99/month) adds 5 campaigns and 5 media lists with priority support. Scale (£349/month) includes 15 campaigns, 10 media lists, and our Campaign Lab feature for A/B testing. All plans include AI content generation, media list management, and analytics."
        },
        {
          q: "Can I change plans later?",
          a: "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades apply at the start of your next billing cycle. Your data and settings remain intact when switching plans."
        }
      ]
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          q: "How does the AI content generation work?",
          a: "Our AI analyzes your business profile, industry, and brand voice to generate professional press releases and social media content. You provide key details (announcement, quotes, facts), and the AI crafts publication-ready content in minutes. You can refine output through conversational prompts or manual editing."
        },
        {
          q: "What languages does UpsurgeIQ support?",
          a: "UpsurgeIQ supports 16 languages including English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Russian, Chinese (Simplified & Traditional), Japanese, Korean, Arabic, and Hindi. The AI automatically adapts to your preferred language for all content generation."
        },
        {
          q: "Can I upload my own journalist contacts?",
          a: "Absolutely! While we provide curated media lists by industry and region, you can also upload your own journalist contacts and media outlets. Our platform supports CSV imports and manual entry, and you can organize contacts into custom lists for targeted distribution."
        },
        {
          q: "Does UpsurgeIQ integrate with my existing tools?",
          a: "Yes! We integrate with major social media platforms (Facebook, Instagram, LinkedIn, X/Twitter), WordPress for automated publishing, and provide webhook support for custom integrations. Our API allows you to connect UpsurgeIQ with your existing marketing stack."
        }
      ]
    },
    {
      category: "Data & Security",
      questions: [
        {
          q: "Is my data secure?",
          a: "Yes. We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted on secure cloud servers with regular security audits. We're GDPR compliant and never share your data with third parties without explicit consent."
        },
        {
          q: "Who owns the content I create?",
          a: "You do! All content generated through UpsurgeIQ belongs to you. You have full rights to use, modify, and distribute it as you see fit. We don't claim any ownership over your press releases, social posts, or other content created on our platform."
        },
        {
          q: "Do you store my credit card information?",
          a: "No. All payment processing is handled securely through Stripe, a PCI-compliant payment processor. We never store your full credit card details on our servers—only a tokenized reference that Stripe provides."
        }
      ]
    },
    {
      category: "Billing & Payments",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe integration. We also support direct debit and bank transfers for annual subscriptions."
        },
        {
          q: "Can I pay annually for a discount?",
          a: "Yes! Annual subscriptions receive a 20% discount compared to monthly billing. For example, the Pro plan costs £99/month (£1,188/year) or £950/year when paid annually—a savings of £238."
        },
        {
          q: "What's your refund policy?",
          a: "We offer a 30-day money-back guarantee. If you're not satisfied with UpsurgeIQ within the first 30 days of your paid subscription, contact us for a full refund. After 30 days, refunds are evaluated on a case-by-case basis."
        },
        {
          q: "Are there any hidden fees?",
          a: "No. The price you see is the price you pay. There are no setup fees, cancellation fees, or surprise charges. Optional add-ons (AI Chat, AI Call-in, Image Packs) are clearly priced and only charged if you activate them."
        }
      ]
    },
    {
      category: "Support & Implementation",
      questions: [
        {
          q: "What kind of support do you offer?",
          a: "All plans include email support with responses within 24 hours on business days. Pro and Scale plans receive priority support with faster response times. We also provide comprehensive documentation, video tutorials, and a knowledge base for self-service help."
        },
        {
          q: "Do you offer training or onboarding?",
          a: "Yes! All new users receive access to our onboarding video series and interactive product tour. Scale plan customers can request a personalized onboarding call with our team to ensure you're set up for success."
        },
        {
          q: "Can you help migrate from my current PR tool?",
          a: "Absolutely. We provide migration assistance for customers moving from other PR platforms. Our team can help you import journalist contacts, transfer content templates, and set up your workflows to match your existing processes."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Frequently Asked Questions (FAQ)"
        description="Find answers to common questions about UpsurgeIQ's AI-powered PR platform. Learn about pricing, features, security, billing, and support."
        keywords="UpsurgeIQ FAQ, PR software questions, pricing questions, platform support, AI PR help"
        canonicalUrl="https://upsurgeiq.com/faq"
      />
      
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
          <a href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UpsurgeIQ</span>
          </a>
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </div>
            
            {/* CTA Button */}
            <Button onClick={() => setLocation("/dashboard")} variant="default" className="hidden sm:flex">
              Go to Dashboard
            </Button>
            
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto py-6 space-y-6">
            <div className="space-y-3">
              <a href="/#features" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="/#pricing" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="/about" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a href="/blog" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Blog</a>
              <a href="/contact" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            </div>
            <div className="pt-4 sm:hidden">
              <Button onClick={() => { setLocation("/dashboard"); setMobileMenuOpen(false); }} variant="default" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="secondary" className="w-fit mx-auto">
            FAQ
          </Badge>
          <h1 className="text-5xl font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about UpsurgeIQ. Can't find the answer you're looking for? 
            <a href="/contact" className="text-primary hover:underline ml-1">Contact our team</a>.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto space-y-12">
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-3">
                {section.category}
              </h2>
              
              <div className="space-y-4">
                {section.questions.map((faq, questionIndex) => {
                  const globalIndex = faqs.slice(0, sectionIndex).reduce((acc, s) => acc + s.questions.length, 0) + questionIndex;
                  const isOpen = openQuestions.includes(globalIndex);
                  
                  return (
                    <Card key={questionIndex} className="overflow-hidden">
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-foreground pr-4">
                          {faq.q}
                        </h3>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <CardContent className="px-6 pb-6 pt-0">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.a}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 max-w-2xl mx-auto py-12">
          <h2 className="text-3xl font-bold text-foreground">Still have questions?</h2>
          <p className="text-lg text-muted-foreground">
            Our team is here to help. Get in touch and we'll respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setLocation("/contact")} size="lg" variant="default">
              Contact Support
            </Button>
            <Button onClick={() => setLocation("/subscribe")} size="lg" variant="outline">
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-20">
        <div className="container mx-auto py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="/status" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} UpsurgeIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
