import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Search, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminCreditManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"aiChat" | "aiCallIn">("aiChat");

  const { data: allUsersCredits, isLoading, refetch } = trpc.admin.getAllUsersCredits.useQuery();
  const { data: stats } = trpc.admin.getCreditStats.useQuery();
  const adjustCreditsMutation = trpc.admin.adjustCredits.useMutation({
    onSuccess: () => {
      toast.success("Credits adjusted successfully");
      refetch();
      setSelectedUserId(null);
      setAdjustmentAmount("");
    },
    onError: (error) => {
      toast.error(`Failed to adjust credits: ${error.message}`);
    },
  });

  const exportMutation = trpc.admin.exportCreditUsage.useMutation({
    onSuccess: (data) => {
      // Create CSV download
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `credit-usage-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    },
  });

  const filteredUsers = allUsersCredits?.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustCredits = () => {
    if (!selectedUserId || !adjustmentAmount) {
      toast.error("Please select a user and enter an amount");
      return;
    }

    const amount = parseInt(adjustmentAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid number");
      return;
    }

    adjustCreditsMutation.mutate({
      userId: selectedUserId,
      addonType: adjustmentType,
      amount,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Credit Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage AI Chat and AI Call-in usage across all users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Active Users</p>
              <p className="text-2xl font-bold">{stats?.totalActiveUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Chat Credits Used</p>
              <p className="text-2xl font-bold">{stats?.totalAiChatUsed || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Call-in Credits Used</p>
              <p className="text-2xl font-bold">{stats?.totalAiCallInUsed || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>AI Chat</TableHead>
              <TableHead>AI Call-in</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.userName}</TableCell>
                <TableCell>{user.userEmail}</TableCell>
                <TableCell>
                  {user.aiChatEnabled ? (
                    <span className="text-sm">
                      {user.aiChatUsed}/{user.aiChatTotal} used
                      <span className="text-muted-foreground ml-2">
                        ({user.aiChatRemaining} left)
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not subscribed</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.aiCallInEnabled ? (
                    <span className="text-sm">
                      {user.aiCallInUsed}/{user.aiCallInTotal} used
                      <span className="text-muted-foreground ml-2">
                        ({user.aiCallInRemaining} left)
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not subscribed</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.aiChatEnabled || user.aiCallInEnabled ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUserId(user.userId)}
                  >
                    Adjust
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Adjustment Dialog */}
      {selectedUserId && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Adjust Credits</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Add-on Type</label>
              <div className="flex gap-2">
                <Button
                  variant={adjustmentType === "aiChat" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("aiChat")}
                >
                  AI Chat
                </Button>
                <Button
                  variant={adjustmentType === "aiCallIn" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("aiCallIn")}
                >
                  AI Call-in
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Amount (positive to add, negative to subtract)
              </label>
              <Input
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="e.g., 10 or -5"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAdjustCredits}
                disabled={adjustCreditsMutation.isPending}
              >
                Apply Adjustment
              </Button>
              <Button variant="outline" onClick={() => setSelectedUserId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
