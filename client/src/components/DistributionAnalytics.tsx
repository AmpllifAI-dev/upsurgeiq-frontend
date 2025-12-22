import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, MousePointerClick, TrendingUp } from "lucide-react";

interface Distribution {
  id: number;
  status: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  sentAt: Date | null;
  createdAt: Date;
}

interface DistributionAnalyticsProps {
  distributions: Distribution[];
}

export function DistributionAnalytics({ distributions }: DistributionAnalyticsProps) {
  const totalSent = distributions.filter(d => d.status === "sent").length;
  const totalRecipients = distributions.reduce((sum, d) => sum + d.recipientCount, 0);
  const totalOpens = distributions.reduce((sum, d) => sum + d.openCount, 0);
  const totalClicks = distributions.reduce((sum, d) => sum + d.clickCount, 0);

  const openRate = totalRecipients > 0 ? ((totalOpens / totalRecipients) * 100).toFixed(1) : "0";
  const clickRate = totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sent</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              {totalSent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalRecipients} total recipients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Rate</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-500" />
              {openRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalOpens} opens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Click Rate</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <MousePointerClick className="w-6 h-6 text-green-500" />
              {clickRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalClicks} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Engagement</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              {((totalOpens + totalClicks) / 2).toFixed(0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Combined score
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
          <CardDescription>Recent press release distributions</CardDescription>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No distributions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {distributions.map((dist) => (
                <div
                  key={dist.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={dist.status === "sent" ? "default" : "secondary"}>
                        {dist.status}
                      </Badge>
                      {dist.sentAt && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(dist.sentAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>
                        <Mail className="w-3 h-3 inline mr-1" />
                        {dist.recipientCount} recipients
                      </span>
                      <span>
                        <Eye className="w-3 h-3 inline mr-1" />
                        {dist.openCount} opens
                      </span>
                      <span>
                        <MousePointerClick className="w-3 h-3 inline mr-1" />
                        {dist.clickCount} clicks
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {dist.recipientCount > 0
                        ? ((dist.openCount / dist.recipientCount) * 100).toFixed(1)
                        : "0"}%
                    </div>
                    <div className="text-xs text-muted-foreground">open rate</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
