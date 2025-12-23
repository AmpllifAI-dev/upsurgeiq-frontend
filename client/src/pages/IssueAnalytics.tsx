import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

export default function IssueAnalytics() {
  const { data: stats, isLoading } = trpc.issues.stats.useQuery();
  const { data: issues = [] } = trpc.issues.list.useQuery({});
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading analytics...</div>
      </DashboardLayout>
    );
  }
  
  // Calculate resolution time averages
  const resolvedIssues = Array.isArray(issues) ? issues.filter((i: any) => i.resolvedAt) : [];
  const avgResolutionTime = resolvedIssues.length > 0
    ? resolvedIssues.reduce((acc: number, issue: any) => {
        const created = new Date(issue.createdAt).getTime();
        const resolved = new Date(issue.resolvedAt).getTime();
        return acc + (resolved - created);
      }, 0) / resolvedIssues.length / (1000 * 60 * 60) // Convert to hours
    : 0;
  
  // Type distribution
  const typeDistribution = Array.isArray(issues) ? issues.reduce((acc: any, issue: any) => {
    acc[issue.issueType] = (acc[issue.issueType] || 0) + 1;
    return acc;
  }, {}) : {};
  
  // Priority distribution
  const priorityDistribution = Array.isArray(issues) ? issues.reduce((acc: any, issue: any) => {
    acc[issue.priority] = (acc[issue.priority] || 0) + 1;
    return acc;
  }, {}) : {};
  
  const totalIssues = stats?.total || 0;
  const resolvedCount = stats?.resolved || 0;
  const resolutionRate = totalIssues > 0 ? ((resolvedCount / totalIssues) * 100).toFixed(1) : 0;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issue Analytics</h1>
          <p className="text-muted-foreground">Track issue trends and resolution performance</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIssues}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.open || 0}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">{resolvedCount} resolved</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">Time to resolve</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Issues by Type</CardTitle>
              <CardDescription>Distribution of issue categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(typeDistribution).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(count / totalIssues) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Issues by Priority</CardTitle>
              <CardDescription>Priority level distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(priorityDistribution).map(([priority, count]: [string, any]) => {
                  const colors: Record<string, string> = {
                    critical: 'bg-red-500',
                    high: 'bg-orange-500',
                    medium: 'bg-yellow-500',
                    low: 'bg-green-500',
                  };
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors[priority] || 'bg-primary'}`} />
                        <span className="text-sm capitalize">{priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${colors[priority] || 'bg-primary'}`} style={{ width: `${(count / totalIssues) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Current issue status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Open', value: stats?.open || 0, color: 'text-red-500' },

                { label: 'In Progress', value: stats?.inProgress || 0, color: 'text-blue-500' },
                { label: 'Resolved', value: stats?.resolved || 0, color: 'text-green-500' },
                { label: 'Closed', value: stats?.closed || 0, color: 'text-gray-500' },

              ].map((status) => (
                <div key={status.label} className="text-center p-4 border rounded-lg">
                  <div className={`text-3xl font-bold ${status.color}`}>{status.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{status.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
