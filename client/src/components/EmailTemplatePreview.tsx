import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface EmailTemplatePreviewProps {
  logoUrl?: string;
  companyName?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function EmailTemplatePreview({
  logoUrl,
  companyName = "UpsurgeIQ",
  primaryColor = "#0ea5e9",
  secondaryColor = "#06b6d4",
}: EmailTemplatePreviewProps) {
  const renderEmailTemplate = (type: "welcome" | "notification" | "press_release") => {
    const templates = {
      welcome: {
        subject: "Welcome to " + companyName,
        body: `
          <h2>Welcome to ${companyName}!</h2>
          <p>We're excited to have you on board. Get started by creating your first press release or campaign.</p>
          <a href="#" style="display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Get Started</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        `,
      },
      notification: {
        subject: "Usage Alert: Approaching Tier Limit",
        body: `
          <h2>Usage Alert</h2>
          <p>You've used 80% of your monthly press release allowance.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Current Usage:</strong> 4 of 5 press releases</p>
            <p style="margin: 8px 0 0 0;"><strong>Resets:</strong> January 1, 2025</p>
          </div>
          <a href="#" style="display: inline-block; padding: 12px 24px; background-color: ${secondaryColor}; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Upgrade Plan</a>
        `,
      },
      press_release: {
        subject: "Your Press Release Has Been Published",
        body: `
          <h2>Press Release Published</h2>
          <p>Your press release "<strong>Company Launches Revolutionary New Product</strong>" has been successfully published.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Published:</strong> December 21, 2024</p>
            <p style="margin: 8px 0 0 0;"><strong>Distribution:</strong> AI-Assisted</p>
          </div>
          <a href="#" style="display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Press Release</a>
        `,
      },
    };

    const template = templates[type];

    return (
      <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto", 
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden"
      }}>
        {/* Email Header */}
        <div style={{ 
          padding: "24px", 
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} style={{ height: "32px", objectFit: "contain" }} />
            ) : (
              <div style={{ 
                width: "32px", 
                height: "32px", 
                backgroundColor: primaryColor, 
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                {companyName.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
              {companyName}
            </span>
          </div>
        </div>

        {/* Email Body */}
        <div style={{ padding: "32px 24px" }}>
          <div style={{ color: "#374151", lineHeight: "1.6" }} dangerouslySetInnerHTML={{ __html: template.body }} />
        </div>

        {/* Email Footer */}
        <div style={{ 
          padding: "24px", 
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          textAlign: "center"
        }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280" }}>
            Delivered by UpsurgeIQ
          </p>
          <p style={{ margin: "0", fontSize: "12px", color: "#9ca3af" }}>
            © 2024 {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Template Preview
        </CardTitle>
        <CardDescription>
          See how your white-label branding will appear in transactional emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="welcome" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
            <TabsTrigger value="notification">Notification</TabsTrigger>
            <TabsTrigger value="press_release">Press Release</TabsTrigger>
          </TabsList>
          
          <TabsContent value="welcome" className="mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <strong>Subject:</strong> Welcome to {companyName}
              </div>
              <div className="border rounded-lg p-4 bg-muted/30">
                {renderEmailTemplate("welcome")}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notification" className="mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <strong>Subject:</strong> Usage Alert: Approaching Tier Limit
              </div>
              <div className="border rounded-lg p-4 bg-muted/30">
                {renderEmailTemplate("notification")}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="press_release" className="mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <strong>Subject:</strong> Your Press Release Has Been Published
              </div>
              <div className="border rounded-lg p-4 bg-muted/30">
                {renderEmailTemplate("press_release")}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Want to test how these emails look in your inbox?
          </p>
          <Button variant="outline" disabled>
            <Mail className="w-4 h-4 mr-2" />
            Send Test Email (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
