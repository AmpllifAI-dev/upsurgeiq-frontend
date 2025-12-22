import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { AlertCircle, AlertTriangle, Info, Bug, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function ErrorLogs() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const { data: logs, isLoading, refetch } = trpc.errorLogs.list.useQuery({
    level: levelFilter === "all" ? undefined : (levelFilter as any),
    limit: 100,
  });

  const { data: stats } = trpc.errorLogs.stats.useQuery();

  // Redirect non-admin users
  if (!authLoading && user?.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      case "warn":
        return <AlertTriangle className="w-4 h-4" />;
      case "debug":
        return <Bug className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warn":
        return "default";
      case "debug":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Error Logs</h1>
            <p className="text-sm text-slate-600">Monitor and debug system errors</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.byLevel.error || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-600">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.byLevel.warn || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-600">Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.byLevel.info || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Logs</CardTitle>
                <CardDescription>Last 100 log entries</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
                    <SelectItem value="warn">Warnings</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={getLevelColor(log.level) as any} className="gap-1">
                            {getLevelIcon(log.level)}
                            {log.level.toUpperCase()}
                          </Badge>
                          {log.component && (
                            <Badge variant="outline">{log.component}</Badge>
                          )}
                          {log.action && (
                            <Badge variant="secondary">{log.action}</Badge>
                          )}
                          <span className="text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900">{log.message}</p>
                        {expandedLog === log.id && (
                          <div className="mt-3 space-y-2">
                            {log.errorStack && (
                              <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono overflow-x-auto">
                                <pre>{log.errorStack}</pre>
                              </div>
                            )}
                            {log.metadata && (
                              <div className="bg-slate-100 p-3 rounded text-xs">
                                <strong>Metadata:</strong>
                                <pre className="mt-1 overflow-x-auto">{log.metadata}</pre>
                              </div>
                            )}
                            {log.userId && (
                              <div className="text-xs text-slate-600">
                                User ID: {log.userId}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      >
                        {expandedLog === log.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No error logs found</p>
                <p className="text-sm">This is a good sign! Your system is running smoothly.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component Breakdown */}
        {stats && Object.keys(stats.byComponent).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Errors by Component</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byComponent)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([component, count]) => (
                    <div key={component} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm font-medium text-slate-700">{component}</span>
                      <Badge variant="secondary">{String(count)}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
