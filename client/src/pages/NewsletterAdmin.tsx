import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Mail,
  Users,
  UserX,
  TrendingUp,
  Download,
  Trash2,
  Search,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export function NewsletterAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "unsubscribed" | undefined>(undefined);

  const { data: stats, isLoading: statsLoading } = trpc.newsletter.getStats.useQuery();
  const { data: subscribers, isLoading: subscribersLoading, refetch } = trpc.newsletter.getAll.useQuery({
    status: statusFilter,
  });

  const deleteSubscriber = trpc.newsletter.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const filteredSubscribers = subscribers?.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number, email: string) => {
    if (confirm(`Are you sure you want to delete subscriber ${email}?`)) {
      deleteSubscriber.mutate({ id });
    }
  };

  const handleExport = () => {
    if (!filteredSubscribers) return;

    const csv = [
      ["Email", "Name", "Status", "Source", "Subscribed At", "Unsubscribed At"].join(","),
      ...filteredSubscribers.map((sub) =>
        [
          sub.email,
          sub.name || "",
          sub.status,
          sub.source || "",
          sub.subscribedAt ? format(new Date(sub.subscribedAt), "yyyy-MM-dd HH:mm:ss") : "",
          sub.unsubscribedAt ? format(new Date(sub.unsubscribedAt), "yyyy-MM-dd HH:mm:ss") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your newsletter subscribers and campaigns
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
                <p className="text-3xl font-bold mt-2">
                  {statsLoading ? "..." : stats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscribers</p>
                <p className="text-3xl font-bold mt-2">
                  {statsLoading ? "..." : stats?.active || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unsubscribed</p>
                <p className="text-3xl font-bold mt-2">
                  {statsLoading ? "..." : stats?.unsubscribed || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Subscribers Table */}
        <Card>
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(undefined)}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "unsubscribed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("unsubscribed")}
                >
                  Unsubscribed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={!filteredSubscribers || filteredSubscribers.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading subscribers...
                    </TableCell>
                  </TableRow>
                ) : !filteredSubscribers || filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No subscribers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subscriber.source || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subscriber.subscribedAt
                          ? format(new Date(subscriber.subscribedAt), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(subscriber.id, subscriber.email)}
                          disabled={deleteSubscriber.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Coming Soon: Email Campaigns */}
        <Card className="p-8 text-center bg-muted/30">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Email Campaigns Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create and send email campaigns to your subscribers. Track opens, clicks, and engagement metrics.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
