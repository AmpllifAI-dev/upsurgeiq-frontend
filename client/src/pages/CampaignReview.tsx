import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, FileText, Facebook, Instagram, Linkedin, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CampaignReview() {
  const params = useParams();
  const pressReleaseId = params.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<{ id: number; content: string } | null>(null);

  // Fetch press release
  const { data: pressRelease, isLoading: loadingPR } = trpc.pressRelease.getById.useQuery(
    { id: pressReleaseId },
    { enabled: pressReleaseId > 0 }
  );

  // Fetch social media posts for this press release
  const { data: socialPosts, isLoading: loadingSocial, refetch: refetchPosts } = trpc.socialMedia.list.useQuery();

  // Filter posts linked to this press release
  const campaignPosts = socialPosts?.filter((post) => post.pressReleaseId === pressReleaseId) || [];

  // Generate social posts mutation
  const generatePostsMutation = trpc.pressRelease.generateSocialPosts.useMutation({
    onSuccess: () => {
      toast.success("Social media posts generated!");
      refetchPosts();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate social posts");
    },
  });

  // Update social post mutation
  const updatePostMutation = trpc.socialMedia.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated!");
      setEditingPost(null);
      refetchPosts();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update post");
    },
  });

  // Publish mutations
  const publishPRMutation = trpc.pressRelease.update.useMutation();
  const publishPostMutation = trpc.socialMedia.update.useMutation();

  const isLoading = loadingPR || loadingSocial;

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = new Set<string>();
    allIds.add(`pr-${pressReleaseId}`);
    campaignPosts.forEach((post) => allIds.add(`post-${post.id}`));
    setSelectedItems(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handlePublish = async () => {
    setShowConfirmDialog(false);

    const promises: Promise<any>[] = [];

    // Publish press release if selected
    if (selectedItems.has(`pr-${pressReleaseId}`)) {
      promises.push(
        publishPRMutation.mutateAsync({
          id: pressReleaseId,
          status: "published",
        })
      );
    }

    // Publish selected social posts
    campaignPosts.forEach((post) => {
      if (selectedItems.has(`post-${post.id}`)) {
        promises.push(
          publishPostMutation.mutateAsync({
            id: post.id,
            status: "published",
          })
        );
      }
    });

    try {
      await Promise.all(promises);
      toast.success("Campaign published!", {
        description: `Published ${selectedItems.size} item(s) successfully.`,
      });
      setSelectedItems(new Set());
      setLocation("/press-releases");
    } catch (error: any) {
      toast.error("Failed to publish campaign", {
        description: error.message || "Some items may not have been published.",
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editingPost) return;

    updatePostMutation.mutate({
      id: editingPost.id,
      content: editingPost.content,
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "bg-blue-500";
      case "instagram":
        return "bg-pink-500";
      case "linkedin":
        return "bg-blue-700";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pressRelease) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Press release not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Campaign Review</h1>
        <p className="text-muted-foreground">
          Review and approve content before publishing
        </p>
      </div>

      {/* Action Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
            <div className="flex gap-2">
              {campaignPosts.length === 0 && (
                <Button
                  onClick={() => generatePostsMutation.mutate({ pressReleaseId })}
                  disabled={generatePostsMutation.isPending}
                  variant="outline"
                >
                  {generatePostsMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Generate Social Posts
                </Button>
              )}
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={selectedItems.size === 0}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve & Publish ({selectedItems.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Press Release */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id={`pr-${pressReleaseId}`}
                checked={selectedItems.has(`pr-${pressReleaseId}`)}
                onCheckedChange={() => handleToggleItem(`pr-${pressReleaseId}`)}
              />
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Press Release</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  {pressRelease.title}
                </CardDescription>
              </div>
            </div>
            <Badge variant={pressRelease.status === "published" ? "default" : "secondary"}>
              {pressRelease.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pressRelease.imageUrl && (
            <img
              src={pressRelease.imageUrl}
              alt={pressRelease.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {pressRelease.body.substring(0, 300)}...
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Posts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Social Media Posts</h2>
        
        {campaignPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <p className="mb-4">No social media posts generated yet</p>
                <Button
                  onClick={() => generatePostsMutation.mutate({ pressReleaseId })}
                  disabled={generatePostsMutation.isPending}
                >
                  {generatePostsMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Generate Social Posts
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          campaignPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`post-${post.id}`}
                      checked={selectedItems.has(`post-${post.id}`)}
                      onCheckedChange={() => handleToggleItem(`post-${post.id}`)}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded ${getPlatformColor(post.platform)}`}>
                          {getPlatformIcon(post.platform)}
                        </div>
                        <CardTitle className="capitalize">{post.platform}</CardTitle>
                      </div>
                    </div>
                  </div>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={`${post.platform} post`}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-sm whitespace-pre-wrap mb-4">{post.content}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPost({ id: post.id, content: post.content })}
                >
                  Edit Content
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Publication</DialogTitle>
            <DialogDescription>
              You are about to publish {selectedItems.size} item(s). This action cannot be undone.
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish}>
              Publish Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post Content</DialogTitle>
            <DialogDescription>
              Make changes to the post content before publishing
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editingPost?.content || ""}
            onChange={(e) =>
              setEditingPost(editingPost ? { ...editingPost, content: e.target.value } : null)
            }
            rows={10}
            className="font-mono text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updatePostMutation.isPending}>
              {updatePostMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
