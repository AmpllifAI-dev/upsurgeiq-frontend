import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Bug, Plus, Search } from "lucide-react";
import { IssueReportDialog } from "@/components/IssueReportDialog";
import { formatDistanceToNow } from "date-fns";

export default function Issues() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: issues, isLoading } = trpc.issues.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
  });

  const { data: stats } = trpc.issues.stats.useQuery();

  const filteredIssues = issues?.filter((issue) =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "destructive", acknowledged: "secondary", in_progress: "default", resolved: "outline", closed: "outline", wont_fix: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const icons: Record<string, string> = { bug: "🐛", feature_request: "✨", improvement: "🚀", question: "❓" };
    return <Badge variant="outline">{icons[type]} {type.replace("_", " ")}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Issue Tracker</h1>
            <p className="text-muted-foreground">Report bugs and request features</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Report Issue</Button>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.open}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.inProgress}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.resolved}</div></CardContent></Card>
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Issues</CardTitle><CardDescription>{filteredIssues?.length || 0} issue(s) found</CardDescription></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredIssues && filteredIssues.length > 0 ? (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{issue.title}</h3>
                          {getStatusBadge(issue.status)}
                          {getTypeBadge(issue.issueType)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>#{issue.id}</span>
                          <span>• Created {formatDistanceToNow(new Date(issue.createdAt))} ago</span>
                        </div>
                      </div>
                      <Bug className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bug className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No issues found</h3>
                <p className="text-muted-foreground mb-4">Report your first issue to get started</p>
                <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Report Issue</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <IssueReportDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardLayout>
  );
}
