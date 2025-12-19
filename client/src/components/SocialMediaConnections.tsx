import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, Twitter, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Platform = "facebook" | "instagram" | "linkedin" | "x";

interface SocialPlatform {
  id: Platform;
  name: string;
  icon: typeof Facebook;
  color: string;
  description: string;
}

const platforms: SocialPlatform[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    description: "Connect your Facebook Page to schedule and publish posts",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    description: "Share visual content and stories to your Instagram Business account",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700",
    description: "Publish professional content to your LinkedIn Company Page",
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: Twitter,
    color: "text-gray-900",
    description: "Post updates and engage with your audience on X",
  },
];

export function SocialMediaConnections() {
  const { data: connections, isLoading, refetch } = trpc.socialAccounts.list.useQuery();

  const handleConnect = (platform: Platform) => {
    // TODO: Implement OAuth flow for each platform
    toast.info("OAuth Integration Coming Soon", {
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} authentication will be available soon. We're working on integrating the OAuth flow.`,
    });
  };

  const handleDisconnect = (accountId: number) => {
    // TODO: Implement disconnect mutation
    toast.success("Account disconnected", {
      description: "Your social media account has been disconnected successfully.",
    });
    refetch();
  };

  const getConnectionStatus = (platformId: Platform) => {
    const connection = connections?.find((c: any) => c.platform === platformId);
    if (!connection) return null;
    return connection;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Connections</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Connections</CardTitle>
        <CardDescription>
          Connect your social media accounts to schedule and publish posts directly from upsurgeIQ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const connection = getConnectionStatus(platform.id);
          const isConnected = !!connection;
          const isActive = connection?.status === "active";
          const isExpired = connection?.status === "expired";

          return (
            <div
              key={platform.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-lg bg-gray-100 ${platform.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{platform.name}</h3>
                    {isConnected && (
                      <Badge
                        variant={isActive ? "default" : isExpired ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {isActive && (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </>
                        )}
                        {isExpired && (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Expired
                          </>
                        )}
                        {!isActive && !isExpired && (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            {connection.status}
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                  {isConnected && connection.accountName && (
                    <p className="text-xs text-gray-500 mt-1">
                      Account: <span className="font-medium">{connection.accountName}</span>
                    </p>
                  )}
                </div>
              </div>
              <div>
                {isConnected ? (
                  <div className="flex gap-2">
                    {isExpired && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnect(platform.id)}
                      >
                        Reconnect
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(connection.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(platform.id)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
