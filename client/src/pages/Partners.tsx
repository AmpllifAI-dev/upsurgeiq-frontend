import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap, Users, Plus, ArrowLeft, Building2, TrendingUp, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Partners() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");

  const { data: partners, isLoading, refetch } = trpc.partner.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const createMutation = trpc.partner.create.useMutation({
    onSuccess: () => {
      toast.success("Partner created successfully");
      setIsCreateOpen(false);
      setPartnerName("");
      setPartnerType("");
      setContactEmail("");
      setContactName("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create partner");
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  // Only admins can access partner management
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto py-16 max-w-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">Admin Access Required</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Partner management is only available to administrators
              </p>
              <Button onClick={() => setLocation("/dashboard")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCreatePartner = () => {
    if (!partnerName || !contactEmail) {
      toast.error("Please enter partner name and contact email");
      return;
    }

    createMutation.mutate({
      name: partnerName,
      type: partnerType || undefined,
      contactEmail,
      contactName: contactName || undefined,
      commissionRate: 20, // Default 20% commission
      status: "active",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2">
              <Users className="w-3 h-3 mr-1" />
              Partnership Program
            </Badge>
            <h1 className="text-4xl font-bold text-foreground">White-Label Partners</h1>
            <p className="text-muted-foreground mt-2">
              Manage chambers of commerce and business network partnerships
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Partner</DialogTitle>
                <DialogDescription>
                  Register a new white-label partner organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerName">Organization Name *</Label>
                  <Input
                    id="partnerName"
                    placeholder="e.g., London Chamber of Commerce"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerType">Partner Type</Label>
                  <Input
                    id="partnerType"
                    placeholder="e.g., Chamber of Commerce, Business Network"
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    placeholder="Primary contact person"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@partner.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Default Commission:</strong> 20% recurring on all member subscriptions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleCreatePartner}
                    disabled={createMutation.isPending}
                  >
                    Add Partner
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Program Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Building2 className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Co-Branding</CardTitle>
              <CardDescription>
                Partners get white-label portals with their branding
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <DollarSign className="w-8 h-8 text-primary mb-2" />
              <CardTitle>20% Commission</CardTitle>
              <CardDescription>
                Recurring revenue share on all member subscriptions
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Member Analytics</CardTitle>
              <CardDescription>
                Track member engagement and subscription metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Partners List */}
        {!partners || partners.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No partners yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Add your first white-label partner to start the partnership program
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={partner.status === "active" ? "default" : "secondary"}
                    >
                      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                    </Badge>
                    {partner.organizationType && (
                      <Badge variant="outline">{partner.organizationType}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{partner.organizationName}</CardTitle>
                  {partner.organizationType && (
                    <CardDescription>Type: {partner.organizationType}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Commission Rate</span>
                      <span className="font-semibold text-primary">
                        {partner.commissionRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={partner.status === "active" ? "default" : "secondary"}>
                        {partner.status}
                      </Badge>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        View Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
