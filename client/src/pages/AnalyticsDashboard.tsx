import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  TrendingUp,
  Users,
  Target,
  Download,
  FileText,
  Flame,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export function AnalyticsDashboard() {
  const { data: summary, isLoading: summaryLoading } = trpc.analytics.getSummary.useQuery();
  const { data: topPages, isLoading: pagesLoading } = trpc.analytics.getTopPages.useQuery({ limit: 10 });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics & User Behaviour</h1>
          <p className="text-muted-foreground mt-2">
            Track visitor behaviour, lead scores, and user journeys
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold mt-2">
                  {summaryLoading ? "..." : summary?.totalEvents.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold mt-2">
                  {summaryLoading ? "..." : summary?.totalLeads.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hot Leads</p>
                <p className="text-3xl font-bold mt-2">
                  {summaryLoading ? "..." : summary?.hotLeads.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualified Leads</p>
                <p className="text-3xl font-bold mt-2">
                  {summaryLoading ? "..." : summary?.qualifiedLeads.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Top Pages */}
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Top Pages by Views</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Most visited pages on your website
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page URL</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagesLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      Loading top pages...
                    </TableCell>
                  </TableRow>
                ) : !topPages || topPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      No page views recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  topPages.map((page, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{page.pageUrl || "Unknown"}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{page.views.toLocaleString()}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Lead Scoring Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lead Scoring System</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-3">Event Points</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Page View</span>
                  <span className="font-medium">+1 point</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blog Read</span>
                  <span className="font-medium">+5 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Case Study View</span>
                  <span className="font-medium">+8 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resource Download</span>
                  <span className="font-medium">+10 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Newsletter Signup</span>
                  <span className="font-medium">+15 points</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Lead Tiers</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Cold</Badge>
                  <span className="text-muted-foreground">0-14 points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Warm
                  </Badge>
                  <span className="text-muted-foreground">15-29 points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                    Hot
                  </Badge>
                  <span className="text-muted-foreground">30-49 points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Qualified
                  </Badge>
                  <span className="text-muted-foreground">50+ points</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Coming Soon Features */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6 bg-muted/30">
            <TrendingUp className="w-8 h-8 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">User Journey Visualization</h3>
            <p className="text-sm text-muted-foreground">
              See the complete path users take from first visit to conversion
            </p>
          </Card>
          <Card className="p-6 bg-muted/30">
            <FileText className="w-8 h-8 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">Segment Management</h3>
            <p className="text-sm text-muted-foreground">
              Create custom segments based on behaviour and send targeted campaigns
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
