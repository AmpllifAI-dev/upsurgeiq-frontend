import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PressReleaseEdit() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/press-releases/:id/edit");
  const prId = params?.id ? parseInt(params.id) : null;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published" | "archived">("draft");
  const [scheduledFor, setScheduledFor] = useState("");

  const { data: pressReleases, isLoading } = trpc.pressRelease.list.useQuery(undefined, {
    enabled: !!user && !authLoading,
  });

  const pressRelease = pressReleases?.find((pr: any) => pr.id === prId);

  const updateMutation = trpc.pressRelease.update.useMutation({
    onSuccess: () => {
      toast.success("Press release updated successfully!");
      setLocation(`/press-releases/${prId}`);
    },
    onError: (error) => {
      toast.error("Failed to update press release", {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (pressRelease) {
      setTitle(pressRelease.title);
      setBody(pressRelease.body);
      setStatus(pressRelease.status);
      if (pressRelease.scheduledFor) {
        const date = new Date(pressRelease.scheduledFor);
        setScheduledFor(date.toISOString().slice(0, 16));
      }
    }
  }, [pressRelease]);

  const handleSave = () => {
    if (!prId) return;

    updateMutation.mutate({
      id: prId,
      title,
      content: body,
      status: status === "archived" ? "draft" : status,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (!pressRelease) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Press Release Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The press release you're trying to edit doesn't exist or has been deleted.
            </p>
            <Button onClick={() => setLocation("/press-releases")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Press Releases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader currentPage="Press Releases" />
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation(`/press-releases/${prId}/distribute`)}>
              <Send className="w-4 h-4 mr-2" />
              Prepare to Send
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Press Release</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter press release title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Content</Label>
            <RichTextEditor
              content={body}
              onChange={setBody}
              placeholder="Edit your press release content..."
              minHeight="500px"
            />
            <p className="text-xs text-muted-foreground">
              Use the toolbar above to format your content with headings, lists, links, and more.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="scheduledFor">Schedule For</Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
