import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailTemplateBuilderProps {
  initialTemplate?: string;
  onSave: (html: string) => void;
}

/**
 * Generate responsive email HTML from template data
 */
function generateEmailHTML(data: {
  layout: string;
  headerText: string;
  headerColor: string;
  bodyText: string;
  ctaText: string;
  ctaUrl: string;
  ctaColor: string;
  footerText: string;
  backgroundColor: string;
}): string {
  const baseStyles = `
    <style>
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: ${data.backgroundColor}; }
      .header { background-color: ${data.headerColor}; color: white; padding: 30px 20px; text-align: center; }
      .body { padding: 30px 20px; }
      .cta-button { display: inline-block; background-color: ${data.ctaColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
  `;

  if (data.layout === "simple") {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>${data.headerText}</h1>
          </div>
          <div class="body">
            <p>${data.bodyText.replace(/\n/g, "<br>")}</p>
            ${data.ctaText && data.ctaUrl ? `<a href="${data.ctaUrl}" class="cta-button">${data.ctaText}</a>` : ""}
          </div>
          <div class="footer">
            <p>${data.footerText}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Two-column layout
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
      <style>
        .two-column { display: flex; gap: 20px; }
        .column { flex: 1; }
        @media (max-width: 600px) {
          .two-column { flex-direction: column; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>${data.headerText}</h1>
        </div>
        <div class="body">
          <div class="two-column">
            <div class="column">
              <p>${data.bodyText.split("\n\n")[0]?.replace(/\n/g, "<br>") || ""}</p>
            </div>
            <div class="column">
              <p>${data.bodyText.split("\n\n")[1]?.replace(/\n/g, "<br>") || ""}</p>
            </div>
          </div>
          ${data.ctaText && data.ctaUrl ? `<div style="text-align: center;"><a href="${data.ctaUrl}" class="cta-button">${data.ctaText}</a></div>` : ""}
        </div>
        <div class="footer">
          <p>${data.footerText}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function EmailTemplateBuilder({
  initialTemplate,
  onSave,
}: EmailTemplateBuilderProps) {
  const [layout, setLayout] = useState("simple");
  const [headerText, setHeaderText] = useState("Welcome to Our Newsletter");
  const [headerColor, setHeaderColor] = useState("#2563eb");
  const [bodyText, setBodyText] = useState(
    "Thank you for subscribing! We're excited to share our latest updates with you."
  );
  const [ctaText, setCtaText] = useState("Learn More");
  const [ctaUrl, setCtaUrl] = useState("https://upsurgeiq.com");
  const [ctaColor, setCtaColor] = useState("#10b981");
  const [footerText, setFooterText] = useState(
    "© 2025 UpsurgeIQ. All rights reserved."
  );
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [previewHTML, setPreviewHTML] = useState("");

  const handleGeneratePreview = () => {
    const html = generateEmailHTML({
      layout,
      headerText,
      headerColor,
      bodyText,
      ctaText,
      ctaUrl,
      ctaColor,
      footerText,
      backgroundColor,
    });
    setPreviewHTML(html);
  };

  const handleSave = () => {
    const html = generateEmailHTML({
      layout,
      headerText,
      headerColor,
      bodyText,
      ctaText,
      ctaUrl,
      ctaColor,
      footerText,
      backgroundColor,
    });
    onSave(html);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <Label>Layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple (Single Column)</SelectItem>
                  <SelectItem value="two-column">Two Column</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Header Text</Label>
              <Input
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="Email header title"
              />
            </div>

            <div>
              <Label>Header Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="w-20"
                />
                <Input
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div>
              <Label>Body Text</Label>
              <Textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Email body content"
                rows={6}
              />
              {layout === "two-column" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Separate columns with double line breaks
                </p>
              )}
            </div>

            <div>
              <Label>Call-to-Action Button Text</Label>
              <Input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Learn More"
              />
            </div>

            <div>
              <Label>Call-to-Action URL</Label>
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label>Button Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={ctaColor}
                  onChange={(e) => setCtaColor(e.target.value)}
                  className="w-20"
                />
                <Input
                  value={ctaColor}
                  onChange={(e) => setCtaColor(e.target.value)}
                  placeholder="#10b981"
                />
              </div>
            </div>

            <div>
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <Label>Footer Text</Label>
              <Input
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2025 Your Company"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGeneratePreview} variant="outline">
                Generate Preview
              </Button>
              <Button onClick={handleSave}>Save Template</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-6">
            {previewHTML ? (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={previewHTML}
                  className="w-full h-[600px]"
                  title="Email Preview"
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Click "Generate Preview" to see your email template
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
