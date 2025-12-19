import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Plus, Edit, Trash2, Eye, Palette, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmailTemplates() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    headerHtml: "",
    footerHtml: "",
    primaryColor: "#008080",
    secondaryColor: "#7FFF00",
    logoUrl: "",
  });

  const { data: business } = trpc.business.get.useQuery(undefined, {
    enabled: !!user,
  });

  // TODO: Add email template endpoints to routers
  // const { data: templates, isLoading, refetch } = trpc.emailTemplate.list.useQuery(undefined, {
  //   enabled: !!user && !!business,
  // });

  // const createMutation = trpc.emailTemplate.create.useMutation({
  //   onSuccess: () => {
  //     toast.success("Email template created!");
  //     setIsCreateOpen(false);
  //     resetForm();
  //     refetch();
  //   },
  //   onError: (error) => {
  //     toast.error(error.message || "Failed to create template");
  //   },
  // });

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      headerHtml: "",
      footerHtml: "",
      primaryColor: "#008080",
      secondaryColor: "#7FFF00",
      logoUrl: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Please enter a template name");
      return;
    }

    // createMutation.mutate({
    //   businessId: business!.id,
    //   ...formData,
    // });
    toast.info("Email template endpoints coming soon");
  };

  const handlePreview = (template?: any) => {
    setPreviewTemplate(template || formData);
    setIsPreviewOpen(true);
  };

  const generatePreviewHtml = (template: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background-color: ${template.primaryColor}; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .accent { color: ${template.secondaryColor}; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${template.logoUrl ? `<img src="${template.logoUrl}" alt="Logo" style="max-height: 50px; margin-bottom: 10px;">` : ''}
              ${template.headerHtml || '<h1>Your Company</h1>'}
            </div>
            <div class="content">
              <h2>Press Release Title</h2>
              <p><strong>Subtitle goes here</strong></p>
              <p>This is where your press release content will appear. The template will automatically apply your brand colors and styling.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div class="footer">
              ${template.footerHtml || '<p>&copy; 2025 Your Company. All rights reserved.</p>'}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (!business) {
    setLocation("/onboarding");
    return null;
  }

  // Mock templates for now
  const templates = [
    {
      id: 1,
      name: "Default Template",
      subject: "Press Release: {{title}}",
      primaryColor: "#008080",
      secondaryColor: "#7FFF00",
      isDefault: true,
    },
  ];

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
                { label: "Email Templates", href: "/email-templates" },
              ]}
            />
            <h1 className="text-3xl font-bold mt-2">Email Templates</h1>
            <p className="text-muted-foreground mt-1">
              Customize your press release distribution emails
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
                <DialogDescription>
                  Design a custom email template for your press release distributions
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Tech Press Release"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Use {{title}} for press release title"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Available variables: {"{"}{"{"} title {"}"}{"}"},  {"{"}{"{"} company {"}"}{"}"}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          placeholder="#008080"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          placeholder="#7FFF00"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="headerHtml">Header HTML (Optional)</Label>
                    <Textarea
                      id="headerHtml"
                      value={formData.headerHtml}
                      onChange={(e) => setFormData({ ...formData, headerHtml: e.target.value })}
                      placeholder="<h1>Your Company</h1>"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="footerHtml">Footer HTML (Optional)</Label>
                    <Textarea
                      id="footerHtml"
                      value={formData.footerHtml}
                      onChange={(e) => setFormData({ ...formData, footerHtml: e.target.value })}
                      placeholder="<p>&copy; 2025 Your Company</p>"
                      rows={4}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handlePreview()}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleCreate}>
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {template.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {template.subject}
                    </CardDescription>
                  </div>
                  {template.isDefault && (
                    <Badge variant="outline">Default</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: template.primaryColor }}
                    />
                    <span className="text-xs text-muted-foreground">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: template.secondaryColor }}
                    />
                    <span className="text-xs text-muted-foreground">Secondary</span>
                  </div>
                </div>
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
                  {!template.isDefault && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 1 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Palette className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Customize Your Email Templates</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Create custom email templates with your brand colors and styling for professional press release distributions.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              This is how your press release emails will look
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              srcDoc={previewTemplate ? generatePreviewHtml(previewTemplate) : ""}
              className="w-full h-[600px]"
              title="Email Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
