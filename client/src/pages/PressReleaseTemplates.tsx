import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Rocket, Megaphone, Calendar, Trophy, Users, ArrowLeft, Eye, Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  titleTemplate: string;
  subtitleTemplate: string;
  bodyTemplate: string;
}

const templates: Template[] = [
  {
    id: "product-launch",
    name: "Product Launch",
    category: "Product",
    description: "Announce a new product or service to the market",
    icon: Rocket,
    titleTemplate: "[Company Name] Launches [Product Name]: [Key Benefit]",
    subtitleTemplate: "[Product Name] revolutionizes [industry/market] with [unique feature]",
    bodyTemplate: `[CITY, STATE] - [Date] - [Company Name], a leading [industry descriptor], today announced the launch of [Product Name], a groundbreaking [product category] designed to [primary benefit].

[Product Name] addresses the growing need for [market need] by offering [key features]. With [unique selling proposition], the product sets a new standard in [industry/category].

"[Quote from CEO/Founder about vision and impact]," said [Name], [Title] of [Company Name]. "[Additional context about market opportunity or customer pain point]."

Key features of [Product Name] include:
• [Feature 1]: [Brief description]
• [Feature 2]: [Brief description]
• [Feature 3]: [Brief description]
• [Feature 4]: [Brief description]

[Product Name] is available starting [date] at [price point/availability]. For more information, visit [website].

About [Company Name]:
[Company Name] is [brief company description, mission, and key achievements]. Founded in [year], the company serves [customer base] with [core offerings].`,
  },
  {
    id: "funding-announcement",
    name: "Funding Announcement",
    category: "Company News",
    description: "Share news about investment rounds and funding",
    icon: Trophy,
    titleTemplate: "[Company Name] Raises [$X Million] in [Series X] Funding",
    subtitleTemplate: "Investment led by [Lead Investor] to accelerate [growth area]",
    bodyTemplate: `[CITY, STATE] - [Date] - [Company Name], [brief company description], today announced it has raised [$X million] in [Series X] funding led by [Lead Investor], with participation from [Other Investors].

The funding will be used to [primary use of funds], [secondary use], and [tertiary use]. This brings [Company Name]'s total funding to [$X million] since its founding in [year].

"[Quote from CEO about what this funding enables and company vision]," said [CEO Name], CEO and [Co-]Founder of [Company Name]. "[Additional context about market opportunity or traction]."

Since [last milestone/funding round], [Company Name] has achieved [key metrics: revenue growth, customer growth, product milestones]. The company currently serves [number] customers across [markets/regions].

"[Quote from lead investor about why they invested]," said [Investor Name], [Title] at [Investment Firm]. "[Additional perspective on market or company potential]."

The new capital will enable [Company Name] to [specific initiatives], positioning the company to [strategic goal].

About [Company Name]:
[Company Name] [mission statement]. Founded in [year] by [founders], the company has [key achievements and current status].`,
  },
  {
    id: "event-announcement",
    name: "Event Announcement",
    category: "Events",
    description: "Promote conferences, webinars, and company events",
    icon: Calendar,
    titleTemplate: "[Company Name] to Host [Event Name] on [Date]",
    subtitleTemplate: "[Event type] brings together [audience] to explore [theme]",
    bodyTemplate: `[CITY, STATE] - [Date] - [Company Name] today announced [Event Name], a [event type] taking place on [date] at [location/virtual platform]. The event will bring together [target audience] to [event purpose].

[Event Name] will feature [keynote speakers, sessions, activities]. Attendees will have the opportunity to [key benefits of attending].

"[Quote from organizer about event significance and what attendees will gain]," said [Name], [Title] at [Company Name]. "[Additional context about timing or relevance]."

Event highlights include:
• [Session/Speaker 1]: [Description]
• [Session/Speaker 2]: [Description]
• [Session/Speaker 3]: [Description]
• [Networking/Special Activity]: [Description]

Registration is now open at [registration URL]. [Early bird pricing/special offers if applicable]. The event is [free/paid] and [open to all/limited to specific audience].

For more information about [Event Name], visit [website] or contact [contact information].

About [Company Name]:
[Company Name] [brief description and relevant credentials for hosting this type of event].`,
  },
  {
    id: "partnership",
    name: "Partnership Announcement",
    category: "Company News",
    description: "Announce strategic partnerships and collaborations",
    icon: Users,
    titleTemplate: "[Company A] and [Company B] Partner to [Outcome]",
    subtitleTemplate: "Strategic collaboration aims to [benefit for customers/market]",
    bodyTemplate: `[CITY, STATE] - [Date] - [Company A] and [Company B] today announced a strategic partnership to [partnership goal]. The collaboration will [key outcomes for customers/market].

Through this partnership, [Company A] will [their contribution] while [Company B] will [their contribution]. Together, the companies will [combined offering or capability].

"[Quote from Company A executive about partnership value and strategic fit]," said [Name], [Title] at [Company A]. "[Additional context about what this enables]."

The partnership addresses [market need or opportunity] by combining [Company A's strength] with [Company B's strength]. Customers will benefit from [specific benefits].

"[Quote from Company B executive about complementary strengths and shared vision]," said [Name], [Title] at [Company B]. "[Additional perspective on market impact]."

The partnership will launch with [initial offering/program] available [timeframe]. [Additional details about rollout or availability].

About [Company A]:
[Company A description, focus, and relevant achievements]

About [Company B]:
[Company B description, focus, and relevant achievements]`,
  },
  {
    id: "company-milestone",
    name: "Company Milestone",
    category: "Company News",
    description: "Celebrate achievements, anniversaries, and growth",
    icon: Megaphone,
    titleTemplate: "[Company Name] Reaches [Milestone]: [Context]",
    subtitleTemplate: "[Achievement] marks significant growth in [area]",
    bodyTemplate: `[CITY, STATE] - [Date] - [Company Name] today announced it has reached [milestone], marking a significant achievement in the company's [growth area/mission].

[Milestone context: what it means, how long it took, comparison to previous milestones]. This achievement reflects [what it demonstrates about the company or market].

"[Quote from CEO about what the milestone means and what's next]," said [CEO Name], [Title] of [Company Name]. "[Additional context about journey or future plans]."

Key factors contributing to this milestone include:
• [Factor 1]: [Description]
• [Factor 2]: [Description]
• [Factor 3]: [Description]

[Company Name] has experienced [growth metrics] over the past [timeframe], driven by [growth drivers]. The company now [current status: market position, geographic reach, customer base].

Looking ahead, [Company Name] plans to [future initiatives] to build on this momentum.

About [Company Name]:
[Company Name] [mission and description]. Founded in [year], the company [key achievements and current focus].`,
  },
];

export default function PressReleaseTemplates() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAIFillerOpen, setIsAIFillerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [aiFormData, setAiFormData] = useState({
    companyName: "",
    industry: "",
    productName: "",
    keyBenefit: "",
    uniqueFeature: "",
    ceoName: "",
    ceoTitle: "",
    website: "",
    additionalContext: "",
  });

  const categories = ["all", "Product", "Company News", "Events"];

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template: Template) => {
    // Store template in localStorage for use in press release creation
    localStorage.setItem("selectedPRTemplate", JSON.stringify(template));
    setLocation("/press-releases/new");
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleAIFill = (template: Template) => {
    setSelectedTemplate(template);
    setIsAIFillerOpen(true);
  };

  const fillTemplateMutation = trpc.aiTemplate.fillTemplate.useMutation({
    onSuccess: (data) => {
      // Store filled template in localStorage
      localStorage.setItem("selectedPRTemplate", JSON.stringify({
        ...selectedTemplate,
        titleTemplate: data.title,
        subtitleTemplate: data.subtitle,
        bodyTemplate: data.body,
      }));
      toast.success("Template filled with AI!", {
        description: "Your press release is ready to edit and publish.",
      });
      setLocation("/press-releases/new");
    },
    onError: (error) => {
      toast.error("AI fill failed", {
        description: error.message || "Unable to fill template. Please try again.",
      });
    },
  });

  const handleSubmitAIFill = () => {
    if (!selectedTemplate) return;
    
    fillTemplateMutation.mutate({
      templateBody: selectedTemplate.bodyTemplate,
      templateTitle: selectedTemplate.titleTemplate,
      templateSubtitle: selectedTemplate.subtitleTemplate,
      data: aiFormData,
    });
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Press Release Templates", href: "/press-release-templates" },
              ]}
            />
            <h1 className="text-3xl font-bold mt-2">Press Release Templates</h1>
            <p className="text-muted-foreground mt-1">
              Start with professional templates for common press release types
            </p>
          </div>
          <Button onClick={() => setLocation("/press-releases/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Start from Scratch
          </Button>
        </div>

        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category === "all" ? "All Templates" : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{template.description}</CardDescription>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleAIFill(template)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Fill with AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && (
                <>
                  {<selectedTemplate.icon className="w-5 h-5" />}
                  {selectedTemplate.name} Template
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Preview the template structure and customize it for your needs
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Title Format</h3>
                <p className="text-sm bg-muted p-3 rounded">{selectedTemplate.titleTemplate}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Subtitle Format</h3>
                <p className="text-sm bg-muted p-3 rounded">{selectedTemplate.subtitleTemplate}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Body Template</h3>
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap font-sans">
                  {selectedTemplate.bodyTemplate}
                </pre>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleUseTemplate(selectedTemplate)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Use This Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Filler Dialog */}
      <Dialog open={isAIFillerOpen} onOpenChange={setIsAIFillerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Fill Template with AI
            </DialogTitle>
            <DialogDescription>
              Provide your company details and AI will customize the template for you
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Inc."
                  value={aiFormData.companyName}
                  onChange={(e) => setAiFormData({ ...aiFormData, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  placeholder="SaaS, Healthcare, etc."
                  value={aiFormData.industry}
                  onChange={(e) => setAiFormData({ ...aiFormData, industry: e.target.value })}
                />
              </div>
            </div>
            
            {selectedTemplate?.id === "product-launch" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="Your product name"
                    value={aiFormData.productName}
                    onChange={(e) => setAiFormData({ ...aiFormData, productName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyBenefit">Key Benefit</Label>
                  <Input
                    id="keyBenefit"
                    placeholder="Main value proposition"
                    value={aiFormData.keyBenefit}
                    onChange={(e) => setAiFormData({ ...aiFormData, keyBenefit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uniqueFeature">Unique Feature</Label>
                  <Input
                    id="uniqueFeature"
                    placeholder="What makes it special"
                    value={aiFormData.uniqueFeature}
                    onChange={(e) => setAiFormData({ ...aiFormData, uniqueFeature: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ceoName">CEO/Founder Name</Label>
                <Input
                  id="ceoName"
                  placeholder="John Doe"
                  value={aiFormData.ceoName}
                  onChange={(e) => setAiFormData({ ...aiFormData, ceoName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ceoTitle">CEO Title</Label>
                <Input
                  id="ceoTitle"
                  placeholder="CEO & Founder"
                  value={aiFormData.ceoTitle}
                  onChange={(e) => setAiFormData({ ...aiFormData, ceoTitle: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                value={aiFormData.website}
                onChange={(e) => setAiFormData({ ...aiFormData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
              <Textarea
                id="additionalContext"
                placeholder="Any additional information to help AI customize the template..."
                rows={4}
                value={aiFormData.additionalContext}
                onChange={(e) => setAiFormData({ ...aiFormData, additionalContext: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsAIFillerOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitAIFill}
                disabled={!aiFormData.companyName || !aiFormData.industry || fillTemplateMutation.isPending}
              >
                {fillTemplateMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Press Release
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
