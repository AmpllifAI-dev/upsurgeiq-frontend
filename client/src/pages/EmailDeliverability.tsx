import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Mail, Ban, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function EmailDeliverability() {
  const [timeRange, setTimeRange] = useState("30");
  
  const { data: deliverabilityData, isLoading } = trpc.leadBehaviour.getDeliverability.useQuery({
    days: parseInt(timeRange),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container max-w-6xl py-8">
          <p>Loading deliverability data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const bounceRate = deliverabilityData?.bounceRate || 0;
  const spamRate = deliverabilityData?.spamRate || 0;
  const deliveryRate = deliverabilityData?.deliveryRate || 0;

  // Determine health status
  const getHealthStatus = () => {
    if (bounceRate > 5 || spamRate > 0.1) return "critical";
    if (bounceRate > 2 || spamRate > 0.05) return "warning";
    return "healthy";
  };

  const healthStatus = getHealthStatus();

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Deliverability</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your sender reputation and email health metrics
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Health Status Alert */}
        {healthStatus === "critical" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Critical:</strong> Your bounce or spam rate is too high. This can damage your sender reputation.
              Review your email list and content immediately.
            </AlertDescription>
          </Alert>
        )}

        {healthStatus === "warning" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Your deliverability metrics are approaching concerning levels.
              Consider cleaning your email list and reviewing your content.
            </AlertDescription>
          </Alert>
        )}

        {healthStatus === "healthy" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Healthy:</strong> Your email deliverability is in good shape. Keep up the great work!
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {deliveryRate >= 95 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Excellent
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Needs improvement
                  </span>
                )}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Target: &gt;95%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bounceRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                {bounceRate < 2 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Good
                  </span>
                ) : bounceRate < 5 ? (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Warning
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Critical
                  </span>
                )}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Target: &lt;2%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spam Complaint Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spamRate.toFixed(3)}%</div>
              <p className="text-xs text-muted-foreground">
                {spamRate < 0.05 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Excellent
                  </span>
                ) : spamRate < 0.1 ? (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Warning
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Critical
                  </span>
                )}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Target: &lt;0.05%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Email Volume</CardTitle>
              <CardDescription>Total emails sent in selected period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Sent</span>
                <span className="text-2xl font-bold">{deliverabilityData?.totalSent || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Successfully Delivered</span>
                <span className="text-lg font-semibold text-green-600">{deliverabilityData?.delivered || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bounced</span>
                <span className="text-lg font-semibold text-red-600">{deliverabilityData?.bounced || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Spam Complaints</span>
                <span className="text-lg font-semibold text-orange-600">{deliverabilityData?.spamComplaints || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sender Reputation Tips</CardTitle>
              <CardDescription>Best practices to maintain healthy deliverability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Clean Your List Regularly</p>
                  <p className="text-muted-foreground">Remove inactive subscribers and invalid emails</p>
                </div>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Use Double Opt-In</p>
                  <p className="text-muted-foreground">Confirm subscriptions to ensure valid addresses</p>
                </div>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Monitor Engagement</p>
                  <p className="text-muted-foreground">Track opens and clicks to identify inactive users</p>
                </div>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Avoid Spam Triggers</p>
                  <p className="text-muted-foreground">Use clear subject lines and authentic content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bounce Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Understanding Bounce Types</CardTitle>
            <CardDescription>Different types of bounces and what they mean</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Hard Bounces</h4>
                <p className="text-sm text-muted-foreground">
                  Permanent delivery failures (invalid email addresses, non-existent domains).
                  These should be removed from your list immediately.
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {deliverabilityData?.hardBounces || 0}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Soft Bounces</h4>
                <p className="text-sm text-muted-foreground">
                  Temporary delivery issues (full mailbox, server problems).
                  Monitor these addresses and remove if they persist.
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {deliverabilityData?.softBounces || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
