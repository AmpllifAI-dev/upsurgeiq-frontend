import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload } from "lucide-react";

export default function WhiteLabelSettings() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Get current business
  const { data: business, isLoading: loadingBusinesses } = trpc.business.get.useQuery();

  const [enabled, setEnabled] = useState(business?.whiteLabelEnabled === 1);
  const [logoUrl, setLogoUrl] = useState(business?.whiteLabelLogoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(business?.whiteLabelPrimaryColor || "#0ea5e9");
  const [secondaryColor, setSecondaryColor] = useState(business?.whiteLabelSecondaryColor || "#06b6d4");
  const [companyName, setCompanyName] = useState(business?.whiteLabelCompanyName || "");
  const [previewMode, setPreviewMode] = useState(false);

  // Apply preview colors dynamically when preview mode is on
  useEffect(() => {
    if (previewMode && enabled) {
      const root = document.documentElement;
      root.style.setProperty('--wl-primary', primaryColor);
      root.style.setProperty('--wl-secondary', secondaryColor);
    } else if (!previewMode) {
      // Remove preview colors (will revert to saved settings or defaults)
      const root = document.documentElement;
      root.style.removeProperty('--wl-primary');
      root.style.removeProperty('--wl-secondary');
    }
    return () => {
      // Cleanup on unmount
      if (previewMode) {
        const root = document.documentElement;
        root.style.removeProperty('--wl-primary');
        root.style.removeProperty('--wl-secondary');
      }
    };
  }, [previewMode, enabled, primaryColor, secondaryColor]);

  const updateWhiteLabel = trpc.business.updateWhiteLabel.useMutation({
    onSuccess: () => {
      utils.business.get.invalidate();
      toast.success("White label settings updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!business) {
      toast.error("No business profile found");
      return;
    }

    if (enabled && (!logoUrl || !companyName)) {
      toast.error("Logo URL and Company Name are required when white label is enabled");
      return;
    }

    updateWhiteLabel.mutate({
      businessId: business.id,
      whiteLabelEnabled: enabled ? 1 : 0,
      whiteLabelLogoUrl: logoUrl,
      whiteLabelPrimaryColor: primaryColor,
      whiteLabelSecondaryColor: secondaryColor,
      whiteLabelCompanyName: companyName,
    });
  };

  if (loadingBusinesses) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">White Label Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize the platform branding to match your company's identity
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>White Label Configuration</CardTitle>
            <CardDescription>
              Enable white labeling to replace UpsurgeIQ branding with your own logo and colors.
              A "Delivered by UpsurgeIQ" footer will be added to maintain attribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Enable White Label</Label>
                <p className="text-sm text-muted-foreground">
                  Replace UpsurgeIQ branding with your own
                </p>
              </div>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
                disabled={!enabled}
              />
              <p className="text-sm text-muted-foreground">
                This name will appear in the header and throughout the platform
              </p>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={!enabled}
                />
                <Button variant="outline" size="icon" disabled={!enabled}>
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Recommended size: 180x40px (transparent PNG)
              </p>
              {logoUrl && (
                <div className="mt-2 p-4 border rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-2">Logo Preview:</p>
                  <img src={logoUrl} alt="Logo preview" className="h-10 object-contain" />
                </div>
              )}
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10"
                  disabled={!enabled}
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#0ea5e9"
                  disabled={!enabled}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Main brand color used for buttons and highlights
              </p>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-20 h-10"
                  disabled={!enabled}
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#06b6d4"
                  disabled={!enabled}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Accent color for secondary elements
              </p>
            </div>

            {/* Preview */}
            {enabled && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-6 border rounded-lg space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    {logoUrl && (
                      <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                    )}
                    <span className="font-semibold">{companyName || "Your Company"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button style={{ backgroundColor: primaryColor }}>
                      Primary Button
                    </Button>
                    <Button variant="outline" style={{ borderColor: secondaryColor, color: secondaryColor }}>
                      Secondary Button
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground pt-4 border-t">
                    Delivered by UpsurgeIQ
                  </p>
                </div>
              </div>
            )}

            {/* Preview Mode Toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="previewMode">Live Preview Mode</Label>
                <p className="text-sm text-muted-foreground">
                  See changes applied across the platform in real-time
                </p>
              </div>
              <Switch
                id="previewMode"
                checked={previewMode}
                onCheckedChange={setPreviewMode}
                disabled={!enabled}
              />
            </div>

            {previewMode && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Preview Mode Active
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Colors are being applied across the platform. Click "Save Settings" to make these changes permanent.
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              {previewMode && (
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(false)}
                >
                  Exit Preview
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={updateWhiteLabel.isPending}
              >
                {updateWhiteLabel.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {previewMode ? "Apply Changes" : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>White Label Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">What gets customized:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Platform logo in header and emails</li>
                <li>Primary and secondary brand colors</li>
                <li>Company name throughout the interface</li>
                <li>PDF export branding</li>
                <li>Email template branding</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">What stays the same:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>"Delivered by UpsurgeIQ" footer on all pages</li>
                <li>Core functionality and features</li>
                <li>URL structure (unless using custom domain)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
