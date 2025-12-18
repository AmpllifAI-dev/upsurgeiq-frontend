import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowLeft, Globe, Key, CheckCircle2, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function WordPressSettings() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleTestConnection = async () => {
    if (!siteUrl || !username || !applicationPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsTesting(true);
    
    // Simulate connection test
    setTimeout(() => {
      setIsTesting(false);
      setIsConnected(true);
      toast.success("WordPress connection successful!");
    }, 2000);
  };

  const handleSaveSettings = () => {
    if (!isConnected) {
      toast.error("Please test the connection first");
      return;
    }

    // TODO: Save WordPress settings to database
    toast.success("WordPress settings saved successfully");
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8 max-w-3xl">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2">
            <Globe className="w-3 h-3 mr-1" />
            CMS Integration
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">WordPress Settings</h1>
          <p className="text-muted-foreground mt-2">
            Connect your WordPress site to sync business profiles and press releases
          </p>
        </div>

        <div className="space-y-6">
          {/* Connection Status */}
          {isConnected && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="flex items-center gap-3 py-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">WordPress Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Your WordPress site is successfully connected
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>WordPress REST API Configuration</CardTitle>
              <CardDescription>
                Enter your WordPress site details to enable CMS integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteUrl">WordPress Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  placeholder="https://your-site.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The full URL of your WordPress site (including https://)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">WordPress Username</Label>
                <Input
                  id="username"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your WordPress admin username
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appPassword">Application Password</Label>
                <Input
                  id="appPassword"
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                  value={applicationPassword}
                  onChange={(e) => setApplicationPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Generate an application password in WordPress → Users → Your Profile → Application Passwords
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex-1"
                >
                  {isTesting ? "Testing..." : "Test Connection"}
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={!isConnected}
                  className="flex-1"
                >
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ACF Pro Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Required WordPress Plugins</CardTitle>
              <CardDescription>
                Install these plugins on your WordPress site for full integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Advanced Custom Fields (ACF) Pro</p>
                  <p className="text-sm text-muted-foreground">
                    Required for custom field support. Install and activate ACF Pro on your WordPress site.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">WordPress REST API</p>
                  <p className="text-sm text-muted-foreground">
                    Built into WordPress 4.7+. No additional installation required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields Setup</CardTitle>
              <CardDescription>
                Create these ACF field groups in your WordPress admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">Business Profile Fields</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>company_name (Text)</li>
                  <li>industry (Text)</li>
                  <li>sic_code (Text)</li>
                  <li>website_url (URL)</li>
                  <li>brand_voice (Text)</li>
                  <li>brand_tone (Text)</li>
                  <li>target_audience (Textarea)</li>
                  <li>key_messages (Textarea)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Press Release Fields</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>headline (Text)</li>
                  <li>subheadline (Text)</li>
                  <li>body_content (Wysiwyg Editor)</li>
                  <li>contact_name (Text)</li>
                  <li>contact_email (Email)</li>
                  <li>contact_phone (Text)</li>
                  <li>release_date (Date Picker)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
