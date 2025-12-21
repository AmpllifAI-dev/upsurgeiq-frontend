import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Target, Award } from "lucide-react";
import { Link } from "wouter";
import { usePageTracking } from "../hooks/useTracking";

interface CaseStudy {
  id: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    icon: React.ReactNode;
  }[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
    image: string;
  };
  featured: boolean;
}

const caseStudies: CaseStudy[] = [
  {
    id: "techvision-ai",
    company: "TechVision AI",
    industry: "Artificial Intelligence",
    challenge: "A Series A AI startup struggling to break through the noise in a crowded market. Despite having innovative technology, they were getting zero media coverage and their thought leadership content wasn't reaching decision-makers.",
    solution: "We implemented a comprehensive PR strategy combining data-driven press releases, strategic media outreach to tier-1 tech publications, and a thought leadership campaign positioning their CEO as an AI ethics expert.",
    results: [
      {
        metric: "Media Mentions",
        value: "+340%",
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        metric: "Website Traffic",
        value: "+215%",
        icon: <Users className="h-5 w-5" />,
      },
      {
        metric: "Qualified Leads",
        value: "+180%",
        icon: <Target className="h-5 w-5" />,
      },
      {
        metric: "Tier-1 Features",
        value: "12",
        icon: <Award className="h-5 w-5" />,
      },
    ],
    testimonial: {
      quote: "UpsurgeIQ transformed our PR from a cost centre to a revenue driver. Within 6 months, we went from invisible to featured in TechCrunch, VentureBeat, and Forbes. The ROI has been exceptional.",
      author: "Sarah Chen",
      role: "CEO, TechVision AI",
      image: "/case-study-techvision.jpg",
    },
    featured: true,
  },
  {
    id: "greenleaf-organics",
    company: "GreenLeaf Organics",
    industry: "Consumer Goods",
    challenge: "A sustainable food brand trying to compete with established players. Their eco-friendly message was getting lost, and they needed to build credibility with both consumers and retail buyers.",
    solution: "We crafted a narrative around their founder's journey and sustainability impact, securing features in lifestyle and business publications. Combined this with strategic product launches timed to environmental awareness events.",
    results: [
      {
        metric: "Brand Awareness",
        value: "+265%",
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        metric: "Retail Partners",
        value: "+45",
        icon: <Users className="h-5 w-5" />,
      },
      {
        metric: "Social Engagement",
        value: "+320%",
        icon: <Target className="h-5 w-5" />,
      },
      {
        metric: "Press Features",
        value: "28",
        icon: <Award className="h-5 w-5" />,
      },
    ],
    testimonial: {
      quote: "The team at UpsurgeIQ understood our mission from day one. They didn't just get us press coverage—they helped us tell our story in a way that resonated with our values and attracted the right partners.",
      author: "Marcus Rodriguez",
      role: "Founder, GreenLeaf Organics",
      image: "/case-study-greenleaf.jpg",
    },
    featured: true,
  },
  {
    id: "fintech-solutions",
    company: "FinTech Solutions Inc.",
    industry: "Financial Technology",
    challenge: "A B2B fintech company with complex products struggling to explain their value proposition to non-technical audiences. They needed to establish thought leadership in a highly regulated industry.",
    solution: "We developed a content strategy that translated technical features into business benefits, secured speaking opportunities at industry conferences, and positioned executives as fintech innovators through strategic media placements.",
    results: [
      {
        metric: "Industry Recognition",
        value: "+290%",
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        metric: "Enterprise Clients",
        value: "+22",
        icon: <Users className="h-5 w-5" />,
      },
      {
        metric: "Speaking Engagements",
        value: "15",
        icon: <Target className="h-5 w-5" />,
      },
      {
        metric: "Industry Awards",
        value: "5",
        icon: <Award className="h-5 w-5" />,
      },
    ],
    testimonial: {
      quote: "UpsurgeIQ helped us break through in a crowded fintech market. Their strategic approach to thought leadership opened doors we couldn't access before. We're now seen as industry leaders.",
      author: "Jennifer Park",
      role: "CMO, FinTech Solutions Inc.",
      image: "/case-study-fintech.jpg",
    },
    featured: false,
  },
  {
    id: "healthtech-innovations",
    company: "HealthTech Innovations",
    industry: "Healthcare Technology",
    challenge: "A healthcare SaaS platform launching in a conservative industry where trust and credibility are paramount. They needed to build authority quickly to compete with established players.",
    solution: "We created a multi-channel PR campaign highlighting their clinical validation data, secured features in healthcare trade publications, and developed case studies showcasing patient outcome improvements.",
    results: [
      {
        metric: "Healthcare Coverage",
        value: "+380%",
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        metric: "Hospital Partnerships",
        value: "+18",
        icon: <Users className="h-5 w-5" />,
      },
      {
        metric: "Physician Signups",
        value: "+425%",
        icon: <Target className="h-5 w-5" />,
      },
      {
        metric: "Industry Publications",
        value: "22",
        icon: <Award className="h-5 w-5" />,
      },
    ],
    testimonial: {
      quote: "In healthcare, credibility is everything. UpsurgeIQ's strategic PR approach helped us build trust with hospitals and physicians faster than we thought possible. The results speak for themselves.",
      author: "Dr. Michael Thompson",
      role: "CEO, HealthTech Innovations",
      image: "/case-study-healthtech.jpg",
    },
    featured: false,
  },
];

export function CaseStudies() {
  usePageTracking();
  const featuredStudies = caseStudies.filter((study) => study.featured);
  const otherStudies = caseStudies.filter((study) => !study.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="text-centre mb-16">
            <Badge variant="outline" className="mb-4">
              Success Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Real Results for Real Businesses
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how we've helped companies across industries amplify their voice, build credibility, and drive measurable business outcomes through strategic PR and marketing.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-12 px-4">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Featured Success Stories</h2>
          <div className="space-y-12">
            {featuredStudies.map((study) => (
              <Card key={study.id} className="p-8 md:p-12 hover:shadow-xl transition-shadow">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Badge className="mb-4">{study.industry}</Badge>
                    <h3 className="text-3xl font-bold mb-4">{study.company}</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-lg mb-2 text-destructive">The Challenge</h4>
                        <p className="text-muted-foreground">{study.challenge}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg mb-2 text-primary">Our Solution</h4>
                        <p className="text-muted-foreground">{study.solution}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-6">Results Achieved</h4>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {study.results.map((result, index) => (
                        <Card key={index} className="p-4 bg-primary/5 border-primary/20">
                          <div className="flex items-centre gap-2 mb-2 text-primary">
                            {result.icon}
                            <span className="text-2xl font-bold">{result.value}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.metric}</p>
                        </Card>
                      ))}
                    </div>

                    <Card className="p-6 bg-muted/50">
                      <p className="text-lg italic mb-4">"{study.testimonial.quote}"</p>
                      <div className="flex items-centre gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-centre justify-centre text-primary font-bold">
                          {study.testimonial.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold">{study.testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">{study.testimonial.role}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Case Studies */}
      <section className="py-12 px-4">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">More Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {otherStudies.map((study) => (
              <Card key={study.id} className="p-6 hover:shadow-lg transition-shadow">
                <Badge className="mb-3">{study.industry}</Badge>
                <h3 className="text-2xl font-bold mb-3">{study.company}</h3>
                
                <p className="text-muted-foreground mb-4 line-clamp-3">{study.challenge}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {study.results.slice(0, 2).map((result, index) => (
                    <div key={index} className="text-centre p-3 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">{result.value}</div>
                      <div className="text-xs text-muted-foreground">{result.metric}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm italic mb-3 line-clamp-2">"{study.testimonial.quote}"</p>
                  <p className="text-sm font-semibold">{study.testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{study.testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl">
          <Card className="p-12 text-centre bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the companies that have transformed their PR and marketing results with UpsurgeIQ's AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-centre">
              <Link href="/subscribe">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Schedule a Demo
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
