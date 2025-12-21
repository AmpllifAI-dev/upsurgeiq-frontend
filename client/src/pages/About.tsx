import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Menu, X, Award, Target, Users2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <SEO
        title="About Us - Meet Christopher Logue"
        description="Learn about Christopher Logue, founder of UpsurgeIQ. With extensive experience in PR, marketing, and AI innovation, Christopher is transforming how businesses communicate."
        keywords="Christopher Logue, UpsurgeIQ founder, PR expert, marketing consultant, AI communications"
        canonicalUrl="https://upsurgeiq.com/about"
      />
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
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
              <a href="/about" className="text-sm font-medium text-foreground transition-colors">
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
            {/* Quick Links */}
            <div className="space-y-3">
              <a
                href="/#features"
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="/#pricing"
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="/about"
                className="block text-sm font-medium text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
            </div>

            {/* Product Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</h3>
              <a
                href="/#features"
                className="block text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="/#pricing"
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
                href="/about"
                className="block text-sm text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="/contact"
                className="block text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
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

            {/* Mobile CTA */}
            <div className="pt-4 sm:hidden">
              <Button onClick={() => setLocation("/dashboard")} variant="default" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto py-16 space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="secondary" className="w-fit mx-auto">
            About UpsurgeIQ
          </Badge>
          <h1 className="text-5xl font-bold text-foreground">
            Putting a Human Face on AI-Powered Marketing
          </h1>
          <p className="text-xl text-muted-foreground">
            At UpsurgeIQ, we believe that the best AI tools are built by people who understand your challenges. 
            We're not just another faceless tech platform—we're a team committed to your success.
          </p>
        </div>

        {/* Founder Section */}
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Founder Photo */}
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-12 flex items-center justify-center min-h-[400px]">
                  <img 
                    src="/christopher-lembke.jpg" 
                    alt="Christopher Lembke, Founder & CEO of UpsurgeIQ"
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                </div>

                {/* Bio Content */}
                <div className="p-8 md:p-12 space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Christopher Lembke</h2>
                    <p className="text-lg text-primary font-medium">Founder & CEO</p>
                  </div>

                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      I founded UpsurgeIQ with a mission to democratize professional PR and marketing for businesses of all sizes. 
                      With nearly two decades of experience transforming businesses through strategic innovation, I've witnessed how 
                      traditional PR agencies price out the very businesses that need them most—small and medium-sized enterprises 
                      with ambitious growth goals.
                    </p>
                    <p>
                      My background is in pattern recognition and systems thinking. As the founder of The Alchemy Experience, I developed 
                      a methodology I call Fractal Analysis—identifying hidden patterns and leverage points that create multiplying effects 
                      throughout organizations. I've helped a boutique letting agency become a national leader without expanding headcount, 
                      enabled a company to achieve 1000% revenue growth in under a decade, and rescued businesses from the brink of collapse.
                    </p>
                    <p>
                      With UpsurgeIQ, I'm applying that same systems-thinking approach to AI-powered marketing. I'm putting my reputation 
                      on the line to deliver a platform that combines cutting-edge technology with strategic precision. Every feature we 
                      build is designed to create those multiplying effects—small, smart changes that ripple through your entire marketing 
                      ecosystem to drive real growth.
                    </p>
                    <p>
                      When you use UpsurgeIQ, you're not just getting software—you're getting a partner who understands business transformation 
                      and is committed to your success. I believe in transparency, quality, and building long-term relationships. Let's disrupt 
                      your marketing before someone else does it for you.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => setLocation("/contact")} variant="default">
                      Get in Touch
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Values */}
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Our Mission & Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're guided by principles that put your success first
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Quality First</h3>
                <p className="text-muted-foreground">
                  We never compromise on quality. Every AI-generated piece of content is designed to meet professional standards 
                  that reflect well on your brand.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Your Success</h3>
                <p className="text-muted-foreground">
                  Your growth is our growth. We measure our success by the results you achieve—more visibility, more engagement, 
                  more customers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Innovation</h3>
                <p className="text-muted-foreground">
                  We're constantly improving and adding new features based on your feedback. AI technology evolves fast, 
                  and so do we.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 max-w-2xl mx-auto py-12">
          <h2 className="text-3xl font-bold text-foreground">Ready to Amplify Your Brand?</h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of businesses using UpsurgeIQ to scale their PR and marketing efforts with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setLocation("/subscribe")} size="lg" variant="default">
              Start Free Trial
            </Button>
            <Button onClick={() => setLocation("/contact")} size="lg" variant="outline">
              Contact Us
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
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="/status" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} UpsurgeIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
      </>
  );
}
