import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Send, Calendar, BarChart3, Eye, MousePointerClick } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function EmailCampaigns() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");

  const { data: campaigns, isLoading, refetch } = trpc.campaigns.list.useQuery();
  const createCampaign = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Campaign created",
        description: "Your email campaign has been created successfully. You can now edit and schedule it.",
      });
      setIsCreateOpen(false);
      setCampaignName("");
      setSubject("");
      setPreviewText("");
      setEmailContent("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to create campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!campaignName || !subject) {
      toast({
        title: "Missing required fields",
        description: "Please provide a campaign name and subject line.",
        variant: "destructive",
      });
      return;
    }

    const template = getTemplateContent(selectedTemplate, subject, emailContent);

    createCampaign.mutate({
      name: campaignName,
      subject,
      previewText: previewText || undefined,
      emailTemplate: template,
    });
  };

  const getTemplateContent = (template: string, subject: string, content: string) => {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; colour: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-colour: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="colour: #2563eb; margin-bottom: 20px;">${subject}</h1>
          <div style="colour: #374151; font-size: 16px; margin-bottom: 25px;">
            ${content || "Your campaign content goes here..."}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="colour: #9ca3af; font-size: 14px; margin-bottom: 10px;">
            You're receiving this because you subscribed to UpsurgeIQ updates.
          </p>
          <p style="colour: #9ca3af; font-size: 14px;">
            <a href="${process.env.FRONTEND_URL}/unsubscribe?email={{email}}" style="colour: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `;

    return baseTemplate;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      scheduled: { variant: "default", label: "Scheduled" },
      sending: { variant: "default", label: "Sending" },
      sent: { variant: "default", label: "Sent" },
      failed: { variant: "destructive", label: "Failed" },
    };

    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage targeted email campaigns for your subscribers
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Email Campaign</DialogTitle>
                <DialogDescription>
                  Design a new email campaign to send to your subscribers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Monthly Newsletter - January 2025"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., New Features & Updates from UpsurgeIQ"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preview">Preview Text (Optional)</Label>
                  <Input
                    id="preview"
                    placeholder="Text shown in email preview..."
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blank">Blank Template</SelectItem>
                      <SelectItem value="newsletter">Newsletter Template</SelectItem>
                      <SelectItem value="announcement">Announcement Template</SelectItem>
                      <SelectItem value="promotion">Promotion Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your email content here..."
                    rows={8}
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    You can use HTML for formatting. Variables: {"{email}"} for recipient email
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign} disabled={createCampaign.isPending}>
                  {createCampaign.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns List */}
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Campaigns</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your email campaigns and track performance
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Recipients</TableHead>
                  <TableHead className="text-right">Opens</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading campaigns...
                    </TableCell>
                  </TableRow>
                ) : !campaigns || campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Send className="w-12 h-12 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-lg">No campaigns yet</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create your first email campaign to engage your subscribers
                          </p>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="mt-2">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Campaign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.subject}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell className="text-right">{campaign.recipientCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {campaign.openCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                          {campaign.clickCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                <p className="text-3xl font-bold mt-2">
                  {campaigns?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Open Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {campaigns && campaigns.length > 0
                    ? `${Math.round(
                        (campaigns.reduce((sum, c) => sum + c.openCount, 0) /
                          campaigns.reduce((sum, c) => sum + c.recipientCount, 0)) *
                          100
                      )}%`
                    : "0%"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Click Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {campaigns && campaigns.length > 0
                    ? `${Math.round(
                        (campaigns.reduce((sum, c) => sum + c.clickCount, 0) /
                          campaigns.reduce((sum, c) => sum + c.recipientCount, 0)) *
                          100
                      )}%`
                    : "0%"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
