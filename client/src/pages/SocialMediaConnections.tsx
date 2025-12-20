import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, Twitter, Check, X, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast as showToast } from "sonner";

export default function SocialMediaConnections() {
  const { user } = useAuth();
  
  const { data: connections, isLoading } = trpc.socialConnections.getConnections.useQuery();
  const disconnectMutation = trpc.socialConnections.disconnect.useMutation({
    onSuccess: () => {
      trpc.useUtils().socialConnections.getConnections.invalidate();
      showToast.success("Account disconnected successfully");
    },
    onError: (error) => {
      showToast.error(error.message || "Failed to disconnect account");
    },
  });

  const handleConnect = (platform: string) => {
    const userId = user?.id;
    if (!userId) {
      showToast.error("Please log in to connect accounts");
      return;
    }

    showToast.info(`Redirecting to ${platform} for authorization...`);
    window.location.href = `/api/oauth/${platform.toLowerCase()}/authorize?userId=${userId}`;
  };

  const handleDisconnect = (connectionId: number, platform: string) => {
    if (confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      disconnectMutation.mutate({ connectionId });
    }
  };

  const platforms = [
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Connect your Facebook Page to post updates automatically",
      features: [
        "Auto-post press releases",
        "Schedule posts in advance",
        "Track engagement metrics",
        "Manage multiple pages",
      ],
      connected: false,
      accountName: null,
      accountImage: null,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "Connect your Instagram Business account for visual content",
      features: [
        "Auto-post with images",
        "Story integration",
        "Hashtag optimization",
        "Analytics tracking",
      ],
      connected: false,
      accountName: null,
      accountImage: null,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      description: "Connect your LinkedIn profile or company page",
      features: [
        "Professional networking",
        "Company page posting",
        "B2B audience reach",
        "Industry targeting",
      ],
      connected: false,
      accountName: null,
      accountImage: null,
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: Twitter,
      color: "text-gray-900",
      bgColor: "bg-gray-100",
      description: "Connect your X account for real-time updates",
      features: [
        "Real-time posting",
        "Thread creation",
        "Trending topics",
        "Retweet automation",
      ],
      connected: false,
      accountName: null,
      accountImage: null,
    },
  ];

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Badge variant="secondary">Social Media</Badge>
        <h1 className="text-4xl font-bold">Connected Accounts</h1>
        <p className="text-xl text-muted-foreground">
          Connect your social media accounts to enable automatic posting and distribution. All plans include all 4 platforms.
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>All Platforms Included</AlertTitle>
        <AlertDescription>
          Your subscription includes access to all 4 social media platforms with unlimited posts. Connect the accounts you want to use.
        </AlertDescription>
      </Alert>

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          
          return (
            <Card key={platform.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${platform.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{platform.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </div>
                  {platform.connected && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Connected Account Info */}
                {platform.connected && platform.accountName && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {platform.accountImage ? (
                      <img
                        src={platform.accountImage}
                        alt={platform.accountName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{platform.accountName}</p>
                      <p className="text-xs text-muted-foreground">Connected account</p>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Features:</h4>
                  <ul className="space-y-1">
                    {platform.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-2">
                  {(() => {
                    const connection = connections?.find(
                      (c) => c.platform === platform.id
                    );
                    const isConnected = !!connection;
                    
                    return isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDisconnect(connection.id, platform.name)}
                          disabled={disconnectMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleConnect(platform.id)}
                        >
                          Reconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleConnect(platform.id)}
                      >
                        Connect {platform.name}
                      </Button>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help Connecting?</CardTitle>
          <CardDescription>
            Follow these steps to connect your social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-sm">Click "Connect" on your desired platform</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll be redirected to the platform's authorization page
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-sm">Authorize upsurgeIQ</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Grant permissions to post on your behalf and read basic analytics
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-sm">Start posting automatically</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Once connected, you can distribute press releases and schedule posts to all connected platforms
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Note:</strong> We only request the minimum permissions needed to post content. 
              We never access your private messages or personal data. You can disconnect at any time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
