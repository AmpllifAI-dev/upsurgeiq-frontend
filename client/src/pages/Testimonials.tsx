import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Menu, X, Star, Quote } from "lucide-react";
import { useLocation } from "wouter";

export default function Testimonials() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Placeholder testimonials - will be replaced with real data from tRPC
  const testimonials = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      customerTitle: "Marketing Director",
      companyName: "TechVenture Ltd",
      companyLogo: null,
      customerPhoto: null,
      quote: "UpsurgeIQ transformed our PR strategy completely. We went from struggling to get media coverage to being featured in top-tier publications every month. The AI-powered press releases are indistinguishable from what our agency used to charge £500 for.",
      rating: 5,
      metricsAchieved: "300% increase in media placements",
      category: "Technology",
      featured: 1,
    },
    {
      id: 2,
      customerName: "Michael Chen",
      customerTitle: "CEO",
      companyName: "HealthTech Innovations",
      companyLogo: null,
      customerPhoto: null,
      quote: "The ROI is incredible. We're saving over £3,000 per month compared to our previous agency, and getting better results. The platform is intuitive, the AI understands our brand voice perfectly, and the analytics help us optimize every campaign.",
      rating: 5,
      metricsAchieved: "£36,000 annual savings",
      category: "Healthcare",
      featured: 1,
    },
    {
      id: 3,
      customerName: "Emma Williams",
      customerTitle: "Head of Communications",
      companyName: "GreenEnergy Solutions",
      companyLogo: null,
      customerPhoto: null,
      quote: "What impressed me most is how quickly we can create and distribute content. Press releases that used to take days now take minutes. The social media integration is seamless, and the journalist database has opened doors we didn't even know existed.",
      rating: 5,
      metricsAchieved: "10x faster content creation",
      category: "Energy",
      featured: 1,
    },
    {
      id: 4,
      customerName: "David Thompson",
      customerTitle: "Founder",
      companyName: "FinanceFirst Consulting",
      companyLogo: null,
      customerPhoto: null,
      quote: "As a small business, we couldn't afford a traditional PR agency. UpsurgeIQ gave us enterprise-level capabilities at a fraction of the cost. We've been featured in Financial Times, Bloomberg, and major industry publications—something we never thought possible.",
      rating: 5,
      metricsAchieved: "Featured in 15+ major publications",
      category: "Finance",
      featured: 1,
    },
    {
      id: 5,
      customerName: "Lisa Martinez",
      customerTitle: "VP of Marketing",
      companyName: "RetailPro Group",
      companyLogo: null,
      customerPhoto: null,
      quote: "The Campaign Lab feature is a game-changer. We can test multiple messaging angles, see what resonates, and optimize in real-time. Our conversion rates have doubled since we started using UpsurgeIQ's A/B testing capabilities.",
      rating: 5,
      metricsAchieved: "2x conversion rate improvement",
      category: "Retail",
      featured: 1,
    },
    {
      id: 6,
      customerName: "James Anderson",
      customerTitle: "Communications Manager",
      companyName: "EduTech Academy",
      companyLogo: null,
      customerPhoto: null,
      quote: "The quality of AI-generated content is outstanding. It captures our brand voice, includes relevant data, and follows best practices automatically. Our media coverage has increased by 250% in just three months.",
      rating: 5,
      metricsAchieved: "250% more media coverage",
      category: "Education",
      featured: 0,
    },
  ];

  const featuredTestimonials = testimonials.filter(t => t.featured === 1);
  const categories = ["All", ...Array.from(new Set(testimonials.map(t => t.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTestimonials = selectedCategory === "All" 
    ? testimonials 
    : testimonials.filter(t => t.category === selectedCategory);

  return (
    <>
      <SEO
        title="Customer Success Stories & Testimonials"
        description="Read how businesses across industries achieve better PR results with UpsurgeIQ. Real customer testimonials showcasing increased media coverage and significant cost savings."
        keywords="UpsurgeIQ reviews, customer testimonials, PR success stories, case studies, client results"
        canonicalUrl="https://upsurgeiq.com/testimonials"
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
            Trusted by Growing Businesses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how companies across industries are achieving better PR results at a fraction of traditional agency costs.
          </p>
        </div>
      </div>

      {/* Featured Testimonials */}
      <div className="container mx-auto py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Success Stories</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {featuredTestimonials.slice(0, 3).map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/10" />
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                {testimonial.metricsAchieved && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-semibold text-primary">{testimonial.metricsAchieved}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                    {testimonial.customerName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.customerName}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.customerTitle}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.companyName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Testimonials */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">What Our Customers Say</h2>
          
          {/* Category Filter */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {testimonial.category}
                    </span>
                  </div>
                  <p className="text-foreground mb-4">"{testimonial.quote}"</p>
                  {testimonial.metricsAchieved && (
                    <div className="mb-4 p-2 bg-muted rounded">
                      <p className="text-sm font-medium text-primary">📈 {testimonial.metricsAchieved}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {testimonial.customerName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.customerName}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.customerTitle}, {testimonial.companyName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="p-12 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your free trial today and see why businesses are switching from traditional PR agencies to UpsurgeIQ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation("/subscribe")}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/pricing-calculator")}>
                Calculate Your Savings
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Cancel anytime
            </p>
          </div>
        </Card>
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
                <li><a href="/testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
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
