import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, Twitter, Check, X, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast as showToast } from "sonner";
import { useState } from "react";

export default function SocialMediaConnections() {
  const { user } = useAuth();
  const [disconnectDialog, setDisconnectDialog] = useState<{ open: boolean; connectionId: number | null; platform: string | null }>({ 
    open: false, 
    connectionId: null, 
    platform: null 
  });
  
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
    setDisconnectDialog({ open: true, connectionId, platform });
  };

  const confirmDisconnect = () => {
    if (disconnectDialog.connectionId) {
      disconnectMutation.mutate({ connectionId: disconnectDialog.connectionId });
      setDisconnectDialog({ open: false, connectionId: null, platform: null });
    }
  };

  // Check connection health based on token expiration
  const getConnectionHealth = (connection: any) => {
    if (!connection?.tokenExpiresAt) {
      return { status: 'healthy', message: 'Connected', variant: 'default' as const };
    }

    const expiresAt = new Date(connection.tokenExpiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', message: 'Token Expired', variant: 'destructive' as const };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', message: `Expires in ${daysUntilExpiry}d`, variant: 'secondary' as const };
    } else {
      return { status: 'healthy', message: 'Connected', variant: 'default' as const };
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
    // Twitter/X removed per user request
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
          Your subscription includes access to 3 social media platforms (Facebook, Instagram, LinkedIn) with unlimited posts. Connect the accounts you want to use.
        </AlertDescription>
      </Alert>

      {/* Expiration Warning */}
      {connections && connections.some(c => {
        const health = getConnectionHealth(c);
        return health.status === 'expiring' || health.status === 'expired';
      }) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required: Token Expiration</AlertTitle>
          <AlertDescription>
            One or more of your social media connections has an expired or expiring access token. 
            Please reconnect these accounts to continue posting. Click "Reconnect" on the affected platforms below.
          </AlertDescription>
        </Alert>
      )}

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          
          // Get connection data from backend
          const connection = connections?.find((c) => c.platform === platform.id);
          const isConnected = !!connection;
          
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
                  {isConnected && connection && (() => {
                    const health = getConnectionHealth(connection);
                    return (
                      <Badge variant={health.variant} className="flex items-center gap-1">
                        {health.status === 'healthy' && <Check className="w-3 h-3" />}
                        {health.status === 'expiring' && <AlertCircle className="w-3 h-3" />}
                        {health.status === 'expired' && <AlertTriangle className="w-3 h-3" />}
                        {health.message}
                      </Badge>
                    );
                  })()}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Connected Account Info */}
                {isConnected && connection && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {connection.profilePictureUrl ? (
                      <img
                        src={connection.profilePictureUrl}
                        alt={connection.platformUsername || ''}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{connection.platformUsername}</p>
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
                <h4 className="font-semibold text-sm">Authorize UpsurgeIQ</h4>
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

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={disconnectDialog.open} onOpenChange={(open) => !open && setDisconnectDialog({ open: false, connectionId: null, platform: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Disconnect {disconnectDialog.platform}?
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                Are you sure you want to disconnect your {disconnectDialog.platform} account? This will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Remove access to post on this platform</li>
                <li>Cancel any scheduled posts for this platform</li>
                <li>Require re-authorization to connect again</li>
              </ul>
              <p className="text-sm font-medium">
                You can reconnect this account anytime by clicking "Connect" again.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDisconnectDialog({ open: false, connectionId: null, platform: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDisconnect}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
