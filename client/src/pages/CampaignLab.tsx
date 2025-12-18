import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Zap, Beaker, Plus, ArrowLeft, Play, Pause, TrendingUp, Eye, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CampaignLab() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [campaignBudget, setCampaignBudget] = useState("");

  const { data: campaigns, isLoading, refetch } = trpc.campaign.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.campaign.create.useMutation({
    onSuccess: () => {
      toast.success("Campaign created successfully");
      setIsCreateOpen(false);
      setCampaignName("");
      setCampaignGoal("");
      setCampaignBudget("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create campaign");
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

  const handleCreateCampaign = () => {
    if (!campaignName) {
      toast.error("Please enter a campaign name");
      return;
    }

    createMutation.mutate({
      name: campaignName,
      goal: campaignGoal || undefined,
      budget: campaignBudget ? parseFloat(campaignBudget) : undefined,
      status: "draft",
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
              <Beaker className="w-3 h-3 mr-1" />
              Campaign Lab
            </Badge>
            <h1 className="text-4xl font-bold text-foreground">Intelligent Campaign Lab</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered A/B testing and campaign optimization
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new A/B testing campaign
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g., Summer Product Launch"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignGoal">Campaign Goal</Label>
                  <Textarea
                    id="campaignGoal"
                    placeholder="What do you want to achieve with this campaign?"
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignBudget">Budget (£)</Label>
                  <Input
                    id="campaignBudget"
                    type="number"
                    placeholder="1000"
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleCreateCampaign}
                    disabled={createMutation.isPending}
                  >
                    Create Campaign
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

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Beaker className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Multi-Variant Testing</CardTitle>
              <CardDescription>
                Test multiple ad variations simultaneously to find the best performer
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Real-Time Monitoring</CardTitle>
              <CardDescription>
                Track performance metrics and engagement in real-time
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Auto-Optimization</CardTitle>
              <CardDescription>
                Automatically deploy winning variations for maximum ROI
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Campaigns List */}
        {!campaigns || campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Beaker className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first campaign to start testing and optimizing your marketing efforts
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            campaign.status === "active"
                              ? "default"
                              : campaign.status === "completed"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                        {campaign.platforms && (
                          <Badge variant="secondary">{campaign.platforms}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl mb-2">{campaign.name}</CardTitle>
                      {campaign.goal && (
                        <CardDescription className="text-base">{campaign.goal}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaign.budget && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Budget</span>
                          <span className="font-semibold">
                            £{campaign.budget.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={0} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>Spent: £0</span>
                          <span>0%</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>
                        <Eye className="w-4 h-4 mr-2" />
                        View Variants
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                      {campaign.status === "active" ? (
                        <Button variant="outline" size="sm" disabled>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
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
