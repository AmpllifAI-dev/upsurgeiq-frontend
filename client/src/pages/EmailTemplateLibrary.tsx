import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Eye, 
  Copy, 
  Trash2, 
  Mail,
  Search,
  Filter
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function EmailTemplateLibrary() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("newsletter");
  const [templateContent, setTemplateContent] = useState("");

  // Queries
  const { data: templates, isLoading } = trpc.templates.list.useQuery();

  // Mutations
  const createTemplate = trpc.templates.create.useMutation({
    onSuccess: () => {
      toast({ title: "Template created successfully" });
      setIsCreateDialogOpen(false);
      resetForm();
      trpc.useUtils().templates.list.invalidate();
    },
    onError: (error) => {
      toast({ title: "Error creating template", description: error.message, variant: "destructive" });
    },
  });

  const deleteTemplate = trpc.templates.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Template deleted successfully" });
      trpc.useUtils().templates.list.invalidate();
    },
  });

  const duplicateTemplate = trpc.templates.duplicate.useMutation({
    onSuccess: () => {
      toast({ title: "Template duplicated successfully" });
      trpc.useUtils().templates.list.invalidate();
    },
  });

  const resetForm = () => {
    setTemplateName("");
    setTemplateDescription("");
    setTemplateCategory("newsletter");
    setTemplateContent("");
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim() || !templateContent.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createTemplate.mutate({
      name: templateName,
      description: templateDescription,
      category: templateCategory,
      htmlContent: templateContent,
    });
  };

  const filteredTemplates = templates?.filter((template: any) => {
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    const matchesSearch = 
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      newsletter: "bg-blue-100 text-blue-800",
      promotional: "bg-green-100 text-green-800",
      transactional: "bg-purple-100 text-purple-800",
      announcement: "bg-orange-100 text-orange-800",
      welcome: "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Template Library</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage reusable email templates for campaigns
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="transactional">Transactional</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-48 bg-muted rounded mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        ) : !filteredTemplates || filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No templates found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first email template"}
            </p>
            {!searchQuery && categoryFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: any) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-muted h-48 flex items-center justify-center border-b">
                  <Mail className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <Badge className={getCategoryBadge(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>Used {template.usageCount || 0} times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsPreviewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateTemplate.mutate({ templateId: template.id })}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this template?")) {
                          deleteTemplate.mutate({ templateId: template.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Template Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>
                Create a reusable email template for your campaigns
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Monthly Newsletter"
                />
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe this template..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select value={templateCategory} onValueChange={setTemplateCategory}>
                  <SelectTrigger id="template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-content">HTML Content *</Label>
                <Textarea
                  id="template-content"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Paste your HTML email template here..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use HTML to create your email template. You can use variables like {"{subscriber_name}"} and {"{unsubscribe_url}"}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={createTemplate.isPending}>
                {createTemplate.isPending ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.name}</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.description || "Template preview"}
              </DialogDescription>
            </DialogHeader>

            <div className="border rounded-lg p-4 bg-white max-h-[60vh] overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{ __html: selectedTemplate?.htmlContent || "" }}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(selectedTemplate?.htmlContent || "");
                  toast({ title: "HTML copied to clipboard" });
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
