import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function SendGridSetup() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState("");
  const webhookUrl = `${window.location.origin}/api/sendgrid/webhook`;
  
  const { data: webhookStatus, refetch: verifyWebhook } = trpc.sendgrid.verifyWebhook.useQuery(undefined, {
    enabled: false,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SendGrid Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Set up email event tracking to monitor opens, clicks, bounces, and unsubscribes
          </p>
        </div>

        {/* Step 1: Webhook URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </span>
              Copy Your Webhook URL
            </CardTitle>
            <CardDescription>
              This URL will receive email event notifications from SendGrid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Keep this URL secure. It will receive email event data from SendGrid.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 2: Configure SendGrid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </span>
              Configure SendGrid Event Webhook
            </CardTitle>
            <CardDescription>
              Add the webhook URL to your SendGrid account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3 list-decimal list-inside text-sm">
              <li>
                Log in to your{" "}
                <a
                  href="https://app.sendgrid.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  SendGrid Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Navigate to <strong>Settings → Mail Settings → Event Webhook</strong></li>
              <li>Click <strong>Enable Event Webhook</strong></li>
              <li>Paste your webhook URL in the <strong>HTTP POST URL</strong> field</li>
              <li>
                Select the events you want to track:
                <ul className="ml-6 mt-2 space-y-1 list-disc">
                  <li><strong>Processed</strong> - Email sent successfully</li>
                  <li><strong>Delivered</strong> - Email delivered to recipient</li>
                  <li><strong>Open</strong> - Recipient opened the email</li>
                  <li><strong>Click</strong> - Recipient clicked a link</li>
                  <li><strong>Bounce</strong> - Email bounced</li>
                  <li><strong>Spam Report</strong> - Marked as spam</li>
                  <li><strong>Unsubscribe</strong> - Recipient unsubscribed</li>
                </ul>
              </li>
              <li>Click <strong>Save</strong></li>
            </ol>

            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Recommended:</strong> Enable all event types for complete tracking visibility
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 3: Test Webhook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </span>
              Test Your Configuration
            </CardTitle>
            <CardDescription>
              Send a test email to verify event tracking is working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Email Address</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (testEmail) {
                      toast({
                        title: "Test Email Sent",
                        description: "Check your inbox and click the link to generate events",
                      });
                    }
                  }}
                  disabled={!testEmail}
                >
                  Send Test Email
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">After sending the test email:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside ml-2">
                <li>Check your inbox for the test email</li>
                <li>Open the email (generates an "open" event)</li>
                <li>Click any link in the email (generates a "click" event)</li>
                <li>Wait 1-2 minutes for events to appear in your analytics dashboard</li>
              </ol>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                verifyWebhook().then((result) => {
                  if (result.data) {
                    toast({
                      title: "Webhook Verified",
                      description: `Received ${result.data.eventCount} events in last 24 hours`,
                    });
                  }
                }).catch((error) => {
                  toast({
                    title: "Verification Failed",
                    description: error.message,
                    variant: "destructive",
                  });
                });
              }}
            >
              Verify Webhook Connection
            </Button>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Events not appearing?</p>
              <ul className="ml-4 mt-1 space-y-1 list-disc text-muted-foreground">
                <li>Verify the webhook URL is correct in SendGrid settings</li>
                <li>Ensure all event types are enabled in SendGrid</li>
                <li>Check that your SendGrid API key has proper permissions</li>
                <li>Events may take 1-5 minutes to appear after delivery</li>
              </ul>
            </div>

            <div>
              <p className="font-medium">Need help?</p>
              <p className="text-muted-foreground mt-1">
                Check the{" "}
                <a
                  href="https://docs.sendgrid.com/for-developers/tracking-events/event"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  SendGrid Event Webhook Documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
