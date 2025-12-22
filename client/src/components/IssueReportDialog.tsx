import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

interface IssueReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "bug" | "feature_request" | "improvement" | "question";
}

export function IssueReportDialog({ open, onOpenChange, defaultType = "bug" }: IssueReportDialogProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: defaultType,
    priority: "medium" as "low" | "medium" | "high" | "critical",
    reproSteps: "",
    expectedBehavior: "",
    actualBehavior: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const createIssueMutation = trpc.issues.create.useMutation({
    onSuccess: () => {
      toast({ title: "Issue reported successfully", description: "Thank you for your feedback!" });
      utils.issues.list.invalidate();
      onOpenChange(false);
      setFormData({ title: "", description: "", type: defaultType, priority: "medium", reproSteps: "", expectedBehavior: "", actualBehavior: "" });
    },
    onError: (error) => {
      toast({ title: "Failed to report issue", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, skip file upload and just submit the issue
    // TODO: Implement proper file upload endpoint
    createIssueMutation.mutate({
      ...formData,
      browserInfo: navigator.userAgent,
      pageUrl: window.location.href,
      screenshotUrl: attachments.length > 0 ? `${attachments.length} file(s) attached (upload pending)` : "",
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>Help us improve by reporting bugs or requesting features.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Issue Type *</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">🐛 Bug Report</SelectItem>
                <SelectItem value="feature_request">✨ Feature Request</SelectItem>
                <SelectItem value="improvement">🚀 Improvement</SelectItem>
                <SelectItem value="question">❓ Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Brief summary" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required minLength={5} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" placeholder="Detailed information" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required minLength={10} rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (Screenshots, Logs)</Label>
            <div className="space-y-2">
              <label htmlFor="file-upload" className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="mr-2 h-4 w-4" />
                <span className="text-sm">Click to upload files</span>
                <input id="file-upload" type="file" multiple accept="image/*,.pdf,.txt,.log" onChange={handleFileChange} className="hidden" />
              </label>
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="truncate">{file.name}</span>
                      <button type="button" onClick={() => removeAttachment(index)} className="ml-2 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {formData.type === "bug" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reproSteps">Steps to Reproduce</Label>
                <Textarea id="reproSteps" placeholder="1. Go to...&#10;2. Click on..." value={formData.reproSteps} onChange={(e) => setFormData({ ...formData, reproSteps: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                <Textarea id="expectedBehavior" placeholder="What should happen?" value={formData.expectedBehavior} onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualBehavior">Actual Behavior</Label>
                <Textarea id="actualBehavior" placeholder="What actually happens?" value={formData.actualBehavior} onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })} rows={2} />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createIssueMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={createIssueMutation.isPending}>
              {createIssueMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Issue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
