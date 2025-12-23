import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MessageSquare, Send, Trash2, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";

export default function IssueDetail() {
  const [, params] = useRoute("/issues/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  const issueId = params?.id ? parseInt(params.id) : 0;
  const [newComment, setNewComment] = useState("");
  
  const { data: issue, isLoading } = trpc.issues.getById.useQuery({ id: issueId });
  const { data: comments = [] } = trpc.issues.getComments.useQuery({ issueId });
  const { data: supportTeam = [] } = trpc.issues.getSupportTeam.useQuery();
  
  const updateStatusMutation = trpc.issues.updateStatus.useMutation({
    onSuccess: () => {
      toast({ title: "Status updated successfully" });
      utils.issues.getById.invalidate({ id: issueId });
      utils.issues.list.invalidate();
    },
    onError: (error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });
  
  const assignIssueMutation = trpc.issues.assignIssue.useMutation({
    onSuccess: () => {
      toast({ title: "Issue assigned successfully" });
      utils.issues.getById.invalidate({ id: issueId });
      utils.issues.list.invalidate();
    },
    onError: (error) => {
      toast({ title: "Failed to assign issue", description: error.message, variant: "destructive" });
    },
  });
  
  const addCommentMutation = trpc.issues.addComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.issues.getComments.invalidate({ issueId });
      toast({ title: "Comment added" });
    },
    onError: (error) => {
      toast({ title: "Failed to add comment", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteCommentMutation = trpc.issues.deleteComment.useMutation({
    onSuccess: () => {
      utils.issues.getComments.invalidate({ issueId });
      toast({ title: "Comment deleted" });
    },
  });
  
  const triggerInvestigationMutation = trpc.issues.triggerInvestigation.useMutation({
    onSuccess: () => {
      toast({ title: "Investigation started", description: "AI is analyzing this issue. Check comments for results." });
      utils.issues.getComments.invalidate({ issueId });
      utils.issues.getById.invalidate({ id: issueId });
    },
    onError: (error) => {
      toast({ title: "Investigation failed", description: error.message, variant: "destructive" });
    },
  });
  
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ issueId, comment: newComment });
  };
  
  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate({ id: issueId, status: status as any });
  };
  
  const handleAssignment = (assignedTo: string) => {
    if (assignedTo === "unassigned") return;
    assignIssueMutation.mutate({ issueId, assignedTo: parseInt(assignedTo) });
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "destructive", acknowledged: "secondary", in_progress: "default", resolved: "outline", closed: "outline", wont_fix: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };
  
  const getTypeBadge = (type: string) => {
    const icons: Record<string, string> = { bug: "🐛", feature_request: "✨", improvement: "🚀", question: "❓" };
    return <Badge variant="outline">{icons[type]} {type.replace("_", " ")}</Badge>;
  };
  
  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary", medium: "default", high: "default", critical: "destructive",
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }
  
  if (!issue) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Issue not found</h2>
          <Button onClick={() => setLocation("/issues")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Issues</Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/issues")}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Issue #{issue.id}</h1>
            <p className="text-muted-foreground">Created {formatDistanceToNow(new Date(issue.createdAt))} ago</p>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-2xl">{issue.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(issue.issueType)}
                      {getPriorityBadge(issue.priority)}
                      {getStatusBadge(issue.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
                </div>
                
                {issue.stepsToReproduce && (
                  <div>
                    <h3 className="font-semibold mb-2">Steps to Reproduce</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{issue.stepsToReproduce}</p>
                  </div>
                )}
                
                {issue.expectedBehavior && (
                  <div>
                    <h3 className="font-semibold mb-2">Expected Behavior</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{issue.expectedBehavior}</p>
                  </div>
                )}
                
                {issue.actualBehavior && (
                  <div>
                    <h3 className="font-semibold mb-2">Actual Behavior</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{issue.actualBehavior}</p>
                  </div>
                )}
                
                {issue.pageUrl && (
                  <div>
                    <h3 className="font-semibold mb-2">Page URL</h3>
                    <a href={issue.pageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{issue.pageUrl}</a>
                  </div>
                )}
                
                {issue.browserInfo && (
                  <div>
                    <h3 className="font-semibold mb-2">Browser Info</h3>
                    <p className="text-sm text-muted-foreground">{issue.browserInfo}</p>
                  </div>
                )}
                
                {issue.screenshotUrls && (
                  <div>
                    <h3 className="font-semibold mb-2">Attachments</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {issue.screenshotUrls.split(',').map((url: string, index: number) => (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                          <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em"%3EFile%3C/text%3E%3C/svg%3E'; }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Comments ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{comment.userName}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt))} ago</p>
                          </div>
                          {(user?.id === comment.userId || user?.role === "admin") && (
                            <Button variant="ghost" size="icon" onClick={() => deleteCommentMutation.mutate({ commentId: comment.id })}><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </div>
                        <p className="text-muted-foreground whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No comments yet</p>
                )}
                
                <div className="space-y-2 pt-4 border-t">
                  <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} />
                  <Button onClick={handleSubmitComment} disabled={!newComment.trim() || addCommentMutation.isPending}><Send className="mr-2 h-4 w-4" />Add Comment</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Status Management</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => triggerInvestigationMutation.mutate({ issueId })} 
                  disabled={triggerInvestigationMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {triggerInvestigationMutation.isPending ? "Investigating..." : "Trigger AI Investigation"}
                </Button>
                <div className="border-t pt-4" />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={issue.status} onValueChange={handleStatusChange} disabled={updateStatusMutation.isPending}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="wont_fix">Won't Fix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {user?.role === "admin" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign To</label>
                    <Select value={issue.assignedTo?.toString() || "unassigned"} onValueChange={handleAssignment} disabled={assignIssueMutation.isPending}>
                      <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {Array.isArray(supportTeam) && supportTeam.map((member: any) => (
                          <SelectItem key={member.id} value={member.id.toString()}>{member.name} ({member.support_role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="font-semibold">ID:</span> #{issue.id}</div>
                <div><span className="font-semibold">Type:</span> {issue.issueType.replace("_", " ")}</div>
                <div><span className="font-semibold">Priority:</span> {issue.priority}</div>
                <div><span className="font-semibold">Status:</span> {issue.status.replace("_", " ")}</div>
                <div><span className="font-semibold">Created:</span> {new Date(issue.createdAt).toLocaleString()}</div>
                <div><span className="font-semibold">Updated:</span> {new Date(issue.updatedAt).toLocaleString()}</div>
                {issue.resolvedAt && <div><span className="font-semibold">Resolved:</span> {new Date(issue.resolvedAt).toLocaleString()}</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
