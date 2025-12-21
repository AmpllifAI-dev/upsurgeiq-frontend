import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Zap, Menu, X, TrendingDown, Check } from "lucide-react";
import { useLocation } from "wouter";

export default function PricingCalculator() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Calculator inputs
  const [pressReleasesPerMonth, setPressReleasesPerMonth] = useState(4);
  const [socialPostsPerWeek, setSocialPostsPerWeek] = useState(10);
  const [mediaListsPerMonth, setMediaListsPerMonth] = useState(2);

  // Traditional agency costs (industry averages)
  const TRADITIONAL_COSTS = {
    pressReleaseWriting: 500, // £500 per press release
    pressReleaseDistribution: 300, // £300 per distribution
    socialMediaManagement: 800, // £800 per month for 10 posts/week
    mediaListResearch: 200, // £200 per list
    agencyRetainer: 2000, // £2000 monthly retainer
  };

  // Calculate traditional agency costs
  const traditionalMonthlyCost = 
    (pressReleasesPerMonth * (TRADITIONAL_COSTS.pressReleaseWriting + TRADITIONAL_COSTS.pressReleaseDistribution)) +
    TRADITIONAL_COSTS.socialMediaManagement +
    (mediaListsPerMonth * TRADITIONAL_COSTS.mediaListResearch) +
    TRADITIONAL_COSTS.agencyRetainer;

  // UpsurgeIQ pricing
  const UPSURGEIQ_PRICING = {
    starter: 49,
    pro: 99,
    scale: 349,
  };

  // Determine recommended tier
  const getRecommendedTier = () => {
    if (pressReleasesPerMonth > 10 || socialPostsPerWeek > 20) return "scale";
    if (pressReleasesPerMonth > 5 || socialPostsPerWeek > 10) return "pro";
    return "starter";
  };

  const recommendedTier = getRecommendedTier();
  const upsurgeiqCost = UPSURGEIQ_PRICING[recommendedTier as keyof typeof UPSURGEIQ_PRICING];
  
  // Calculate savings
  const monthlySavings = traditionalMonthlyCost - upsurgeiqCost;
  const annualSavings = monthlySavings * 12;
  const savingsPercentage = ((monthlySavings / traditionalMonthlyCost) * 100).toFixed(0);

  return (
    <>
      <SEO
        title="ROI Calculator - Calculate Your Savings"
        description="See how much you can save by switching from traditional PR agencies to UpsurgeIQ. Calculate your potential ROI and discover why businesses save up to 99% on PR costs."
        keywords="PR cost calculator, ROI calculator, PR agency savings, marketing cost comparison, PR pricing"
        canonicalUrl="https://upsurgeiq.com/pricing-calculator"
      />
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
            <div className="hidden md:flex items-center gap-6">
              <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
            </div>
            <Button onClick={() => setLocation("/dashboard")} variant="default" className="hidden sm:flex">Go to Dashboard</Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto py-6 space-y-6">
            <div className="space-y-3">
              <a href="/#features" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="/#pricing" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="/about" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
            </div>
            <div className="pt-4 sm:hidden">
              <Button onClick={() => setLocation("/dashboard")} variant="default" className="w-full">Go to Dashboard</Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            ROI Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how much you can save by switching from traditional PR agencies to UpsurgeIQ's AI-powered platform.
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Your PR Needs</CardTitle>
              <CardDescription>
                Adjust the sliders to match your monthly PR requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Press Releases */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Press Releases per Month</Label>
                  <span className="font-bold text-primary">{pressReleasesPerMonth}</span>
                </div>
                <Slider
                  value={[pressReleasesPerMonth]}
                  onValueChange={(value) => setPressReleasesPerMonth(value[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Traditional cost: £{((pressReleasesPerMonth * (TRADITIONAL_COSTS.pressReleaseWriting + TRADITIONAL_COSTS.pressReleaseDistribution))).toLocaleString()}/month
                </p>
              </div>

              {/* Social Media Posts */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Social Media Posts per Week</Label>
                  <span className="font-bold text-primary">{socialPostsPerWeek}</span>
                </div>
                <Slider
                  value={[socialPostsPerWeek]}
                  onValueChange={(value) => setSocialPostsPerWeek(value[0])}
                  min={3}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Traditional cost: £{TRADITIONAL_COSTS.socialMediaManagement.toLocaleString()}/month
                </p>
              </div>

              {/* Media Lists */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Media Lists per Month</Label>
                  <span className="font-bold text-primary">{mediaListsPerMonth}</span>
                </div>
                <Slider
                  value={[mediaListsPerMonth]}
                  onValueChange={(value) => setMediaListsPerMonth(value[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Traditional cost: £{(mediaListsPerMonth * TRADITIONAL_COSTS.mediaListResearch).toLocaleString()}/month
                </p>
              </div>

              {/* Agency Retainer */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Traditional Agency Retainer</span>
                  <span className="font-bold">£{TRADITIONAL_COSTS.agencyRetainer.toLocaleString()}/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Industry average monthly retainer fee
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* Savings Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-6 w-6 text-primary" />
                  Your Potential Savings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Monthly Savings</p>
                  <p className="text-4xl font-bold text-primary">
                    £{monthlySavings.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Save {savingsPercentage}% compared to traditional agencies
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Annual Savings</p>
                  <p className="text-3xl font-bold text-foreground">
                    £{annualSavings.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Traditional Agency</p>
                    <p className="text-2xl font-bold text-muted-foreground line-through">
                      £{traditionalMonthlyCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">UpsurgeIQ ({recommendedTier.charAt(0).toUpperCase() + recommendedTier.slice(1)})</p>
                    <p className="text-2xl font-bold text-primary">
                      £{upsurgeiqCost}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Plan: {recommendedTier.charAt(0).toUpperCase() + recommendedTier.slice(1)}</CardTitle>
                <CardDescription>
                  Based on your requirements, we recommend the {recommendedTier} plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Unlimited press releases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">AI-powered content generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Social media post creation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Media list management</span>
                  </div>
                  {recommendedTier !== "starter" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">Advanced analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">Priority support</span>
                      </div>
                    </>
                  )}
                  {recommendedTier === "scale" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">Campaign Lab with A/B testing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">White-label options</span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setLocation("/subscribe")}
                >
                  Start Free Trial
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  No credit card required • Cancel anytime
                </p>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What Makes UpsurgeIQ Different?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-1">🤖 AI-Powered Efficiency</p>
                  <p className="text-muted-foreground">Generate professional press releases in minutes, not hours</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">📊 Data-Driven Insights</p>
                  <p className="text-muted-foreground">Track performance and optimize campaigns in real-time</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">🎯 Targeted Distribution</p>
                  <p className="text-muted-foreground">Reach the right journalists with personalized pitches</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">💰 Transparent Pricing</p>
                  <p className="text-muted-foreground">No hidden fees or surprise charges—just predictable monthly costs</p>
                </div>
              </CardContent>
            </Card>
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
      </>
  );
}
