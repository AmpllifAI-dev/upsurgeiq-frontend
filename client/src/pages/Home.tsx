import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Users, Zap, MessageSquare, BarChart3, Globe, Menu, X } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        "2 press releases per month",
        "1 social media channel",
        "3 default media lists",
        "AI-powered content generation",
        "Basic analytics",
        "Email support",
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
        "5 press releases per month",
        "3 social media channels",
        "5 media lists included",
        "AI-powered content generation",
        "Conversational AI assistant",
        "AI call-in feature",
        "Advanced analytics",
        "Priority support",
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
        "15 press releases per month",
        "All 4 social media channels",
        "10 media lists included",
        "AI-powered content generation",
        "Conversational AI assistant",
        "AI call-in feature",
        "Intelligent Campaign Lab",
        "Advanced analytics & reporting",
        "Priority support",
        "Dedicated account manager",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Content",
      description: "Generate professional press releases and social media posts in seconds with our advanced AI.",
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
      icon: Users,
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
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
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
                className="block text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colors"
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
                className="block text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colors"
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
                className="block text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Privacy
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Terms
              </a>
              <a
                href="#"
                className="block text-sm text-foreground hover:text-primary transition-colors"
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
              <Button size="lg" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                Learn More
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">2x</div>
                <div className="text-sm text-muted-foreground">Faster Content</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">4+</div>
                <div className="text-sm text-muted-foreground">Platforms</div>
              </div>
              <div className="text-center">
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
          <div className="text-center space-y-4 mb-16">
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
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
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
          <div className="text-center space-y-4 mb-16">
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
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-8">
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
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
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
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 UpsurgeIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
