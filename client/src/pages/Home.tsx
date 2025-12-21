import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Sparkles, TrendingUp, Users, Zap, MessageSquare, BarChart3, Globe, Menu, X } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { featureContent, addOnContent } from "@/data/featureContent";
import { getFeatureKey, getAddOnKey } from "@/utils/featureMapping";
import { Info } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const pricingTiers = [
    {
      name: "Starter",
      price: "£49",
      period: "/month",
      description: "Perfect for solopreneurs and small businesses",
      features: [
        "2 campaigns per month (AI-drafted copy + own imagery)",
        "3 social media platforms (Facebook, Instagram, LinkedIn)",
        "Unlimited user-composed social posts",
        "3 media lists (default)",
        "Email support",
      ],
      addOns: [
        "AI Chat: £39/month",
        "AI Call-in: £59/month",
        "AI Generated Image Packs: £3.99-24.99",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "£99",
      period: "/month",
      description: "Most popular for growing businesses",
      features: [
        "5 campaigns per month (AI-drafted copy + own imagery)",
        "3 social media platforms (Facebook, Instagram, LinkedIn)",
        "Unlimited user-composed social posts",
        "5 media lists (3 default + 2 optional)",
        "Priority support",
      ],
      addOns: [
        "AI Chat: £39/month",
        "AI Call-in: £59/month",
        "AI Generated Image Packs: £3.99-24.99",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Scale",
      price: "£349",
      period: "/month",
      description: "For agencies and high-growth companies",
      features: [
        "15 campaigns per month (AI-drafted copy + own imagery)",
        "3 social media platforms (Facebook, Instagram, LinkedIn)",
        "Unlimited user-composed social posts",
        "10 media lists (3 default + 7 optional)",
        "Intelligent Campaign Lab included",
        "Priority support",
      ],
      addOns: [
        "AI Chat: £39/month",
        "AI Call-in: £59/month",
        "AI Generated Image Packs: £3.99-24.99",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Multilingual AI Content",
      description: "Generate professional content in 16 languages including English, Spanish, French, German, Chinese, Japanese, and more. AI adapts to your preferred language automatically.",
      image: null,
    },
    {
      icon: Users,
      title: "Know-Your-Client Dossier",
      description: "Build comprehensive client profiles with calendar integration. AI tailors every press release and campaign to your client's unique business context and schedule.",
      image: null,
    },
    {
      icon: Globe,
      title: "Multi-Platform Distribution",
      description: "Distribute to Facebook, Instagram, LinkedIn, X, and journalist media lists automatically.",
      image: "/images/feature-social-media.jpg",
    },
    {
      icon: BarChart3,
      title: "Campaign Optimization",
      description: "Test multiple ad variations and automatically deploy winning campaigns with our Campaign Lab.",
      image: "/images/feature-analytics-dashboard.jpg",
    },
    {
      icon: MessageSquare,
      title: "Conversational AI",
      description: "Refine content through natural conversation, or call in to draft content on the go.",
      image: null,
    },
    {
      icon: Globe,
      title: "Journalist Networks",
      description: "Access curated media lists by industry and region, or upload your own contacts.",
      image: "/images/feature-media-relations.jpg",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track engagement, reach, and campaign performance across all channels in real-time.",
      image: null,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI-Powered PR & Marketing Platform"
        description="Transform your PR strategy with UpsurgeIQ's AI-powered platform. Generate professional press releases, manage media lists, and amplify your brand voice at a fraction of traditional agency costs."
        keywords="AI PR, press release generator, media relations, marketing automation, PR software, journalist database, content marketing"
        canonicalUrl="https://upsurgeiq.com"
      />
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex flex-col sm:flex-row items-centre justify-between py-4 gap-4">
          <a href="/" className="flex items-centre gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-centre justify-centre w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UpsurgeIQ</span>
          </a>
          <div className="flex items-centre gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-centre gap-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colours">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colours">
                Pricing
              </a>
            </div>
            
            {/* CTA Button */}
            {isAuthenticated ? (
              <Button onClick={() => setLocation("/dashboard")} variant="default" className="hidden sm:flex">
                Go to Dashboard
              </Button>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()} variant="default" className="hidden sm:flex">
                Get Started
              </Button>
            )}
            
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
            {/* Quick Links */}
            <div className="space-y-3">
              <a
                href="#features"
                className="block text-sm font-medium text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-sm font-medium text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
            </div>

            {/* Product Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</h3>
              <a
                href="#features"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Integrations
              </a>
            </div>

            {/* Company Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</h3>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Careers
              </a>
            </div>

            {/* Legal Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Legal</h3>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Privacy
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Terms
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colours"
                onClick={() => setMobileMenuOpen(false)}
              >
                Security
              </a>
            </div>

            {/* CTA Button for Mobile */}
            <div className="pt-4 sm:hidden">
              {isAuthenticated ? (
                <Button onClick={() => { setLocation("/dashboard"); setMobileMenuOpen(false); }} variant="default" className="w-full">
                  Go to Dashboard
                </Button>
              ) : (
                <Button onClick={() => { window.location.href = getLoginUrl(); setMobileMenuOpen(false); }} variant="default" className="w-full">
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-centre">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit text-sm px-4 py-1.5">
              Intelligence That Drives Growth
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              AI-Powered PR & Marketing to{" "}
              <span className="text-primary">Grow Your Business</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Amplify your voice across press releases, social media, and journalist networks. Professional content creation and distribution at a fraction of traditional agency costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={handleGetStarted} className="text-base">
                Start Free Trial
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behaviour: "smooth" })}>
                Learn More
              </Button>
            </div>
            <div className="flex items-centre gap-8 pt-4">
              <div className="text-centre">
                <div className="text-3xl font-bold text-foreground">2x</div>
                <div className="text-sm text-muted-foreground">Faster Content</div>
              </div>
              <div className="text-centre">
                <div className="text-3xl font-bold text-foreground">4+</div>
                <div className="text-sm text-muted-foreground">Platforms</div>
              </div>
              <div className="text-centre">
                <div className="text-3xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">Cost Savings</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
              <img 
                src="/images/hero-business-professional.jpg" 
                alt="Business professional managing communications" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-centre space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Everything You Need to Amplify Your Brand
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional PR and marketing tools powered by AI, designed for businesses that want to grow.
            </p>
          </div>
          
          {/* Feature Cards with Images */}
          <div className="space-y-24">
            {features.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-centre ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-centre justify-centre">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
                <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  {feature.image ? (
                    <div className="relative rounded-xl overflow-hidden shadow-xl border border-border">
                      <img 
                        src={feature.image} 
                        alt={feature.title} 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative bg-card border border-border rounded-xl p-8 shadow-xl">
                      <div className="space-y-4">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                        <div className="h-32 bg-muted rounded mt-6"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto">
          <div className="text-centre space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Pricing
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative ${
                  tier.highlighted
                    ? "border-primary shadow-2xl scale-105"
                    : "border-border"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-centre pb-8">
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 pb-4">
                    {tier.features.map((feature, featureIndex) => {
                      const featureKey = getFeatureKey(feature);
                      const isClickable = featureKey && featureContent[featureKey];
                      
                      return (
                        <div 
                          key={featureIndex} 
                          className={`flex items-start gap-3 ${isClickable ? 'cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded-md transition-colours' : ''}`}
                          onClick={() => isClickable && setActiveModal(featureKey)}
                        >
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground flex-1">{feature}</span>
                          {isClickable && <Info className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                  {tier.addOns && tier.addOns.length > 0 && (
                    <div className="pt-4 border-t border-border space-y-3">
                      <div className="flex items-centre gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">Optional Add-ons</Badge>
                      </div>
                      {tier.addOns.map((addOn, addOnIndex) => {
                        const addOnKey = getAddOnKey(addOn);
                        const isClickable = addOnKey && addOnContent[addOnKey];
                        
                        return (
                          <div 
                            key={addOnIndex} 
                            className={`flex items-start gap-3 ${isClickable ? 'cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded-md transition-colours' : ''}`}
                            onClick={() => isClickable && setActiveModal(`addon_${addOnKey}`)}
                          >
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex-1">{addOn}</span>
                            {isClickable && <Info className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 mt-0.5" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    onClick={handleGetStarted}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* White Label Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="text-centre pb-6">
                <Badge variant="secondary" className="w-fit mx-auto mb-4">For Organizations</Badge>
                <CardTitle className="text-3xl">White Label Solution</CardTitle>
                <CardDescription className="text-base mt-2">
                  Standalone product for agencies and organisations. Offer upsurgeIQ under your own brand.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">What's Included:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Full platform access under your brand</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Custom domain and branding</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Resell to your clients</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">All features from Scale plan</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Pricing Structure:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">20% commission on all sales</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">No setup charges</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Set your own pricing</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Dedicated partner support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" size="lg" onClick={() => window.location.href = 'mailto:partners@upsurgeiq.com?subject=White Label Inquiry'}>
                  Contact Sales
                </Button>
                <p className="text-xs text-centre text-muted-foreground">
                  Perfect for agencies, consultancies, and organisations serving multiple clients
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto text-centre space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to Amplify Your Brand?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join hundreds of businesses using UpsurgeIQ to scale their PR and marketing efforts.
          </p>
          <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-base">
            Start Your Free Trial
            <Sparkles className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="space-y-4">
              <div className="flex items-centre gap-2">
                <div className="flex items-centre justify-centre w-8 h-8 rounded-lg bg-primary">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">UpsurgeIQ</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Intelligence That Drives Growth
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colours">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colours">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colours">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colours">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colours">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colours">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colours">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colours">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colours">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-centre text-sm text-muted-foreground">
            © 2025 UpsurgeIQ. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Feature Modals */}
      {activeModal && !activeModal.startsWith('addon_') && featureContent[activeModal] && (
        <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{featureContent[activeModal].title}</DialogTitle>
              <DialogDescription className="text-base pt-2">
                {featureContent[activeModal].description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div>
                <h4 className="font-semibold mb-3">Key Benefits:</h4>
                <ul className="space-y-2">
                  {featureContent[activeModal].benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {featureContent[activeModal].useCases && featureContent[activeModal].useCases!.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Perfect For:</h4>
                  <ul className="space-y-2">
                    {featureContent[activeModal].useCases!.map((useCase, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                        <span className="text-sm text-muted-foreground">{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add-on Modals */}
      {activeModal && activeModal.startsWith('addon_') && (() => {
        const addOnKey = activeModal.replace('addon_', '');
        const addOn = addOnContent[addOnKey];
        if (!addOn) return null;
        
        return (
          <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">{addOn.title}</DialogTitle>
                <DialogDescription className="text-base pt-2">
                  {addOn.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div>
                  <h4 className="font-semibold mb-3">What You Get:</h4>
                  <ul className="space-y-2">
                    {addOn.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-centre justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Pricing</p>
                    <p className="text-2xl font-bold text-foreground">{addOn.pricing}</p>
                  </div>
                  <Button onClick={() => setLocation(addOn.ctaLink)} size="lg">
                    {addOn.ctaText}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
