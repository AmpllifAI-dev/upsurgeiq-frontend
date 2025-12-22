import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, TrendingUp, Target, BarChart3, Lightbulb, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function CampaignLabSales() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "AI-Powered Strategy Generation",
      description: "Generate comprehensive campaign strategies in minutes with our advanced AI that analyzes your business goals, target audience, and market trends."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Psychological Angle Testing",
      description: "Test multiple psychological approaches simultaneously. Our system automatically identifies winning variations based on performance metrics."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Automatic Optimization",
      description: "Campaigns self-optimize in real-time. The system continuously monitors performance and automatically promotes winning variations."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Track CTR, conversion rates, cost efficiency, and ROI with real-time dashboards. Get actionable insights to improve campaign performance."
    }
  ];

  const benefits = [
    "Save 10+ hours per week on campaign planning and optimization",
    "Increase conversion rates by 30-50% with psychological angle testing",
    "Reduce cost per acquisition through automatic optimization",
    "Scale campaigns confidently with data-driven insights",
    "Test multiple strategies simultaneously without additional effort",
    "Get AI-powered recommendations for continuous improvement"
  ];

  const useCases = [
    {
      title: "Product Launches",
      description: "Test different messaging angles to find what resonates most with your target audience during critical launch periods."
    },
    {
      title: "Lead Generation",
      description: "Optimize lead capture campaigns by testing various value propositions and psychological triggers automatically."
    },
    {
      title: "Brand Awareness",
      description: "Build brand recognition with campaigns that continuously improve based on engagement metrics and audience response."
    },
    {
      title: "Seasonal Promotions",
      description: "Maximize ROI during peak seasons by running multiple campaign variations and automatically scaling winners."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UpsurgeIQ</span>
          </a>
          <div className="flex items-center gap-4">
            <Button onClick={() => setLocation("/")} variant="ghost">
              Home
            </Button>
            <Button onClick={() => setLocation("/subscribe")} variant="default">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="w-fit mx-auto">
            Intelligent Campaign Lab
          </Badge>
          <h1 className="text-6xl font-bold text-foreground">
            AI-Powered Campaign Optimization That Never Sleeps
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop guessing which campaign will work. Let our Intelligent Campaign Lab test multiple psychological angles simultaneously and automatically promote winners.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button onClick={() => setLocation("/subscribe")} size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
            <Button onClick={() => setLocation("/dashboard")} variant="outline" size="lg">
              View Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Available on Scale plan (£349/month) • 14-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-foreground">
              Everything You Need to Win
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features that work together to maximize your campaign performance
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-foreground">
              Real Results for Your Business
            </h2>
            <p className="text-xl text-muted-foreground">
              Join agencies and high-growth companies using Campaign Lab to scale their marketing
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-foreground">
              Perfect For Every Campaign Type
            </h2>
            <p className="text-xl text-muted-foreground">
              From product launches to seasonal promotions, Campaign Lab adapts to your needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-primary/5 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-4xl font-bold text-foreground">
            Ready to Transform Your Campaigns?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join the Scale plan today and get instant access to Intelligent Campaign Lab
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button onClick={() => setLocation("/subscribe")} size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            £349/month • Includes 15 campaigns, 10 media lists, and priority support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 UpsurgeIQ. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="/campaign-lab" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Campaign Lab
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
