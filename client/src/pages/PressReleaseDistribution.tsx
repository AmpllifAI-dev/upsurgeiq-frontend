import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowLeft, Send, Eye, MousePointerClick, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function PressReleaseDistribution() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const pressReleaseId = params.id ? parseInt(params.id) : 0;

  const { data: distributions, isLoading } = trpc.distribution.getByPressRelease.useQuery(
    { pressReleaseId },
    { enabled: !!user && pressReleaseId > 0 }
  );

  const { data: pressRelease } = trpc.pressRelease.getById.useQuery(
    { id: pressReleaseId },
    { enabled: !!user && pressReleaseId > 0 }
  );

  if (loading || isLoading) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "sending":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      sent: "default",
      sending: "secondary",
      pending: "outline",
      failed: "destructive",
    };
    return variants[status] || "outline";
  };

  const totalRecipients = distributions?.reduce((sum: number, d: any) => sum + (d.recipientCount || 0), 0) || 0;
  const totalOpens = distributions?.reduce((sum: number, d: any) => sum + (d.openCount || 0), 0) || 0;
  const totalClicks = distributions?.reduce((sum: number, d: any) => sum + (d.clickCount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UpsurgeIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/press-releases")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Press Releases
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2">
            <Send className="w-3 h-3 mr-1" />
            Distribution Report
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {pressRelease?.title || "Press Release Distribution"}
          </h1>
          <p className="text-muted-foreground">
            Track which publications received your press release and engagement metrics
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRecipients}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Across {distributions?.length || 0} media lists
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Opens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalOpens}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalRecipients > 0 ? ((totalOpens / totalRecipients) * 100).toFixed(1) : 0}% open rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalClicks}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : 0}% click-through rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribution List */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution History</CardTitle>
            <CardDescription>
              Publications that received this press release
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!distributions || distributions.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No distributions yet</h3>
                <p className="text-muted-foreground">
                  This press release hasn't been sent to any media lists yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {distributions.map((dist: any) => (
                  <div
                    key={dist.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(dist.status)}
                      <div>
                        <div className="font-medium">Media List #{dist.mediaListId}</div>
                        <div className="text-sm text-muted-foreground">
                          {dist.sentAt
                            ? new Date(dist.sentAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : "Not sent yet"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Recipients</div>
                        <div className="text-lg font-semibold">{dist.recipientCount || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Opens
                        </div>
                        <div className="text-lg font-semibold">{dist.openCount || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          Clicks
                        </div>
                        <div className="text-lg font-semibold">{dist.clickCount || 0}</div>
                      </div>
                      <Badge variant={getStatusBadge(dist.status)}>
                        {dist.status.charAt(0).toUpperCase() + dist.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
