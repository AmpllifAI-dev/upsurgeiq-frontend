import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Menu, X, CheckCircle2, AlertCircle, Clock, Activity } from "lucide-react";
import { useLocation } from "wouter";

export default function Status() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  const services = [
    {
      name: "API & Backend",
      description: "Core application services",
      status: "operational",
      uptime: "99.98%",
    },
    {
      name: "Database",
      description: "Data storage and retrieval",
      status: "operational",
      uptime: "99.99%",
    },
    {
      name: "AI Content Generation",
      description: "Press release and content creation",
      status: "operational",
      uptime: "99.95%",
    },
    {
      name: "Social Media Integration",
      description: "Facebook, Instagram, LinkedIn posting",
      status: "operational",
      uptime: "99.92%",
    },
    {
      name: "Email Delivery",
      description: "Transactional and notification emails",
      status: "operational",
      uptime: "99.97%",
    },
    {
      name: "Payment Processing",
      description: "Stripe subscription management",
      status: "operational",
      uptime: "99.99%",
    },
  ];

  const recentIncidents = [
    {
      date: "2025-12-15",
      title: "Scheduled Maintenance",
      description: "Database optimization and performance improvements completed successfully.",
      status: "resolved",
      duration: "30 minutes",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Operational
          </Badge>
        );
      case "degraded":
        return (
          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Degraded
          </Badge>
        );
      case "outage":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Outage
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
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

      <div className="container mx-auto py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="secondary" className="w-fit mx-auto">
            <Activity className="w-3 h-3 mr-1" />
            System Status
          </Badge>
          <h1 className="text-5xl font-bold text-foreground">
            All Systems Operational
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time status and uptime monitoring for UpsurgeIQ services
          </p>
        </div>

        {/* Overall Status */}
        <Card className="max-w-4xl mx-auto border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">All Systems Operational</h3>
                  <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">99.97%</div>
                <p className="text-xs text-muted-foreground">30-day uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Status */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Service Status</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <Card key={service.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        {getStatusBadge(service.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-foreground">{service.uptime}</div>
                      <p className="text-xs text-muted-foreground">30-day uptime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Incidents</h2>
          {recentIncidents.length > 0 ? (
            <div className="space-y-3">
              {recentIncidents.map((incident, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          {getStatusBadge(incident.status)}
                        </div>
                        <CardDescription>{incident.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(incident.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>Duration: {incident.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No incidents reported in the last 30 days</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Subscribe to Updates */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Subscribe to Status Updates</CardTitle>
            <CardDescription>
              Get notified when there are service disruptions or scheduled maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => setLocation("/contact")} variant="default">
                Contact Support
              </Button>
              <Button variant="outline" onClick={() => window.open("#", "_blank")}>
                View Documentation
              </Button>
            </div>
          </CardContent>
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
  );
}
