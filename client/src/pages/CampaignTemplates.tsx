import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  TrendingUp,
  Users,
  Target,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignTemplates() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const utils = trpc.useUtils();

  // Fetch templates
  const { data: templates, isLoading } = trpc.campaign.listTemplates.useQuery();

  // Delete template mutation
  const deleteTemplateMutation = trpc.campaign.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template deleted successfully");
      utils.campaign.listTemplates.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });

  // Use template mutation
  const useTemplateMutation = trpc.campaign.useTemplate.useMutation({
    onSuccess: (template) => {
      toast.success("Template loaded! Redirecting to campaign wizard...");
      // Store template data in session storage for wizard to pick up
      sessionStorage.setItem("campaignTemplate", JSON.stringify(template));
      setLocation("/dashboard/campaign-lab?useTemplate=true");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to load template");
    },
  });

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleUseTemplate = (templateId: number) => {
    useTemplateMutation.mutate({ templateId });
  };

  const handleDeleteTemplate = (templateId: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate({ id: templateId });
    }
  };

  // Filter templates
  const filteredTemplates = templates?.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group templates by category
  const groupedTemplates = filteredTemplates?.reduce((acc, template) => {
    const category = template.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactElement> = {
      "Product Launch": <Sparkles className="w-4 h-4" />,
      "Brand Awareness": <TrendingUp className="w-4 h-4" />,
      "Lead Generation": <Users className="w-4 h-4" />,
      "Event Promotion": <Target className="w-4 h-4" />,
    };
    return icons[category] || <Target className="w-4 h-4" />;
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Templates</h1>
          <p className="text-muted-foreground mt-1">
            Start your campaign with proven templates or create your own
          </p>
        </div>
        <Button onClick={() => setLocation("/dashboard/campaign-lab")}>
          <Plus className="w-4 h-4 mr-2" />
          Create from Scratch
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedTemplates || {}).map(([category, categoryTemplates]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                {getCategoryIcon(category)}
                <h2 className="text-xl font-semibold">{category}</h2>
                <Badge variant="secondary">{categoryTemplates?.length || 0}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTemplates?.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          {template.description && (
                            <CardDescription className="mt-2 line-clamp-2">
                              {template.description}
                            </CardDescription>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(template)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            {!template.isPublic && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        {template.suggestedBudget && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget:</span>
                            <span className="font-medium">
                              £{parseFloat(template.suggestedBudget).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {template.suggestedDuration && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{template.suggestedDuration} days</span>
                          </div>
                        )}
                        {template.isPublic === 1 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Used:</span>
                            <span className="font-medium">{template.usageCount || 0} times</span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={useTemplateMutation.isPending}
                      >
                        {useTemplateMutation.isPending ? "Loading..." : "Use Template"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search query"
                : "Start by creating a campaign from scratch"}
            </p>
            <Button onClick={() => setLocation("/dashboard/campaign-lab")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.category && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                    <p>{selectedTemplate.category}</p>
                  </div>
                )}
                {selectedTemplate.suggestedBudget && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Suggested Budget
                    </h4>
                    <p>£{parseFloat(selectedTemplate.suggestedBudget).toLocaleString()}</p>
                  </div>
                )}
                {selectedTemplate.suggestedDuration && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                    <p>{selectedTemplate.suggestedDuration} days</p>
                  </div>
                )}
                {selectedTemplate.platforms && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Platforms</h4>
                    <p>{selectedTemplate.platforms}</p>
                  </div>
                )}
              </div>

              {/* Goal */}
              {selectedTemplate.goal && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Campaign Goal</h4>
                  <p className="text-sm">{selectedTemplate.goal}</p>
                </div>
              )}

              {/* Target Audience */}
              {selectedTemplate.targetAudience && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Target Audience
                  </h4>
                  <p className="text-sm">{selectedTemplate.targetAudience}</p>
                </div>
              )}

              {/* Strategy */}
              {selectedTemplate.strategy && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Strategy</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedTemplate.strategy}</p>
                </div>
              )}

              {/* Key Messages */}
              {selectedTemplate.keyMessages && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Messages</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedTemplate.keyMessages}</p>
                </div>
              )}

              {/* Success Metrics */}
              {selectedTemplate.successMetrics && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Success Metrics
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedTemplate.successMetrics}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleUseTemplate(selectedTemplate.id);
                    setIsPreviewOpen(false);
                  }}
                  disabled={useTemplateMutation.isPending}
                >
                  {useTemplateMutation.isPending ? "Loading..." : "Use This Template"}
                </Button>
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
