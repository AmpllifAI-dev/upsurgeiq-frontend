import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignAnalyticsCharts } from "@/components/CampaignAnalyticsCharts";

export default function CampaignDetail() {
  const [, params] = useRoute("/dashboard/campaign/:id");
  const [, setLocation] = useLocation();
  const campaignId = params?.id ? parseInt(params.id) : null;

  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isAddDeliverableOpen, setIsAddDeliverableOpen] = useState(false);

  // Milestone form state
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");

  // Deliverable form state
  const [deliverableTitle, setDeliverableTitle] = useState("");
  const [deliverableType, setDeliverableType] = useState<string>("");
  const [deliverableMilestoneId, setDeliverableMilestoneId] = useState<string>("");
  const [deliverableDueDate, setDeliverableDueDate] = useState("");

  const utils = trpc.useUtils();

  // Fetch campaign details
  const { data: campaign, isLoading: campaignLoading } = trpc.campaign.get.useQuery(
    { id: campaignId! },
    { enabled: !!campaignId }
  );

  // Fetch milestones
  const { data: milestones, isLoading: milestonesLoading } = trpc.campaign.getMilestones.useQuery(
    { campaignId: campaignId! },
    { enabled: !!campaignId }
  );

  // Fetch deliverables
  const { data: deliverables, isLoading: deliverablesLoading } =
    trpc.campaign.getDeliverables.useQuery(
      { campaignId: campaignId! },
      { enabled: !!campaignId }
    );

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = trpc.campaign.getAnalytics.useQuery(
    { campaignId: campaignId! },
    { enabled: !!campaignId }
  );

  // Create milestone mutation
  const createMilestoneMutation = trpc.campaign.createMilestone.useMutation({
    onSuccess: () => {
      toast.success("Milestone created successfully");
      utils.campaign.getMilestones.invalidate({ campaignId: campaignId! });
      setIsAddMilestoneOpen(false);
      setMilestoneTitle("");
      setMilestoneDescription("");
      setMilestoneDueDate("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create milestone");
    },
  });

  // Create deliverable mutation
  const createDeliverableMutation = trpc.campaign.createDeliverable.useMutation({
    onSuccess: () => {
      toast.success("Deliverable created successfully");
      utils.campaign.getDeliverables.invalidate({ campaignId: campaignId! });
      setIsAddDeliverableOpen(false);
      setDeliverableTitle("");
      setDeliverableType("");
      setDeliverableMilestoneId("");
      setDeliverableDueDate("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create deliverable");
    },
  });

  // Update milestone status mutation
  const updateMilestoneStatusMutation = trpc.campaign.updateMilestone.useMutation({
    onSuccess: () => {
      toast.success("Milestone updated");
      utils.campaign.getMilestones.invalidate({ campaignId: campaignId! });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update milestone");
    },
  });

  // Update deliverable status mutation
  const updateDeliverableStatusMutation = trpc.campaign.updateDeliverable.useMutation({
    onSuccess: () => {
      toast.success("Deliverable updated");
      utils.campaign.getDeliverables.invalidate({ campaignId: campaignId! });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update deliverable");
    },
  });

  const handleCreateMilestone = () => {
    if (!milestoneTitle) {
      toast.error("Please enter a milestone title");
      return;
    }

    createMilestoneMutation.mutate({
      campaignId: campaignId!,
      title: milestoneTitle,
      description: milestoneDescription,
      dueDate: milestoneDueDate || undefined,
      status: "pending",
    });
  };

  const handleCreateDeliverable = () => {
    if (!deliverableTitle || !deliverableType) {
      toast.error("Please enter title and select type");
      return;
    }

    createDeliverableMutation.mutate({
      campaignId: campaignId!,
      milestoneId: deliverableMilestoneId ? parseInt(deliverableMilestoneId) : undefined,
      title: deliverableTitle,
      type: deliverableType as any,
      dueDate: deliverableDueDate || undefined,
      status: "draft",
    });
  };

  const handleMilestoneStatusChange = (milestoneId: number, newStatus: string) => {
    updateMilestoneStatusMutation.mutate({
      id: milestoneId,
      status: newStatus as any,
      completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
    });
  };

  const handleDeliverableStatusChange = (deliverableId: number, newStatus: string) => {
    updateDeliverableStatusMutation.mutate({
      id: deliverableId,
      status: newStatus as any,
      publishedAt: newStatus === "published" ? new Date().toISOString() : undefined,
    });
  };

  // Calculate progress
  const campaignProgress = useMemo(() => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.status === "completed").length;
    return Math.round((completed / milestones.length) * 100);
  }, [milestones]);

  if (!campaignId) {
    return <div>Invalid campaign ID</div>;
  }

  if (campaignLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      planning: "bg-blue-500",
      active: "bg-green-500",
      paused: "bg-yellow-500",
      completed: "bg-purple-500",
      archived: "bg-gray-400",
    };
    return colors[status] || "bg-gray-500";
  };

  const getMilestoneStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactElement> = {
      pending: <Clock className="w-4 h-4 text-gray-500" />,
      in_progress: <Clock className="w-4 h-4 text-blue-500" />,
      completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      blocked: <AlertCircle className="w-4 h-4 text-red-500" />,
    };
    return icons[status] || icons.pending;
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/campaign-lab")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">{campaign.goal}</p>
          </div>
        </div>
        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{campaignProgress}%</div>
              <Progress value={campaignProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{campaign.budget ? parseFloat(campaign.budget).toLocaleString() : "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {campaign.startDate && campaign.endDate ? (
                <>
                  {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                  {new Date(campaign.endDate).toLocaleDateString()}
                </>
              ) : (
                "Not set"
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm line-clamp-2">{campaign.targetAudience || "Not specified"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="milestones" className="space-y-6">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Campaign Milestones</h2>
            <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Milestone</DialogTitle>
                  <DialogDescription>Create a milestone to track campaign progress</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="milestoneTitle">Title *</Label>
                    <Input
                      id="milestoneTitle"
                      placeholder="e.g., Launch press release"
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestoneDescription">Description</Label>
                    <Textarea
                      id="milestoneDescription"
                      placeholder="Describe what needs to be accomplished"
                      value={milestoneDescription}
                      onChange={(e) => setMilestoneDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestoneDueDate">Due Date</Label>
                    <Input
                      id="milestoneDueDate"
                      type="date"
                      value={milestoneDueDate}
                      onChange={(e) => setMilestoneDueDate(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateMilestone}
                    disabled={createMilestoneMutation.isPending}
                    className="w-full"
                  >
                    {createMilestoneMutation.isPending ? "Creating..." : "Create Milestone"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {milestonesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : milestones && milestones.length > 0 ? (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <Card key={milestone.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getMilestoneStatusIcon(milestone.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                          {milestone.dueDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Select
                        value={milestone.status}
                        onValueChange={(value) => handleMilestoneStatusChange(milestone.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No milestones yet. Add your first milestone to start tracking progress.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Deliverables Tab */}
        <TabsContent value="deliverables" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Campaign Deliverables</h2>
            <Dialog open={isAddDeliverableOpen} onOpenChange={setIsAddDeliverableOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deliverable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Deliverable</DialogTitle>
                  <DialogDescription>Create a deliverable for this campaign</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliverableTitle">Title *</Label>
                    <Input
                      id="deliverableTitle"
                      placeholder="e.g., Product launch press release"
                      value={deliverableTitle}
                      onChange={(e) => setDeliverableTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliverableType">Type *</Label>
                    <Select value={deliverableType} onValueChange={setDeliverableType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="press_release">Press Release</SelectItem>
                        <SelectItem value="social_post">Social Post</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="blog_post">Blog Post</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="infographic">Infographic</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliverableMilestone">Link to Milestone (Optional)</Label>
                    <Select
                      value={deliverableMilestoneId}
                      onValueChange={setDeliverableMilestoneId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select milestone" />
                      </SelectTrigger>
                      <SelectContent>
                        {milestones?.map((milestone) => (
                          <SelectItem key={milestone.id} value={milestone.id.toString()}>
                            {milestone.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliverableDueDate">Due Date</Label>
                    <Input
                      id="deliverableDueDate"
                      type="date"
                      value={deliverableDueDate}
                      onChange={(e) => setDeliverableDueDate(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateDeliverable}
                    disabled={createDeliverableMutation.isPending}
                    className="w-full"
                  >
                    {createDeliverableMutation.isPending ? "Creating..." : "Create Deliverable"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {deliverablesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : deliverables && deliverables.length > 0 ? (
            <div className="space-y-4">
              {deliverables.map((deliverable) => (
                <Card key={deliverable.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{deliverable.title}</h3>
                            <Badge variant="outline">{deliverable.type.replace("_", " ")}</Badge>
                          </div>
                          {deliverable.dueDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Select
                        value={deliverable.status}
                        onValueChange={(value) =>
                          handleDeliverableStatusChange(deliverable.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No deliverables yet. Add your first deliverable to start tracking content.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Campaign Analytics</h2>
          {analyticsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : analytics && analytics.length > 0 ? (
            <CampaignAnalyticsCharts analytics={analytics} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No analytics data yet. Analytics will appear once your campaign is active.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4">
          <h2 className="text-xl font-semibold">Campaign Strategy</h2>
          <div className="grid gap-4">
            {campaign.aiGeneratedStrategy && (
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{campaign.aiGeneratedStrategy}</p>
                </CardContent>
              </Card>
            )}
            {campaign.keyMessages && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{campaign.keyMessages}</p>
                </CardContent>
              </Card>
            )}
            {campaign.successMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Success Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{campaign.successMetrics}</p>
                </CardContent>
              </Card>
            )}
            {!campaign.aiGeneratedStrategy && !campaign.keyMessages && !campaign.successMetrics && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No strategy information available. Use the AI planning wizard to generate a comprehensive strategy.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
