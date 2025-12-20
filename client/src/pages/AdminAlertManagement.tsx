import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell, Plus, Trash2, RefreshCw, AlertTriangle } from "lucide-react";

export default function AdminAlertManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newThreshold, setNewThreshold] = useState({
    name: "",
    thresholdType: "daily" as "daily" | "weekly" | "monthly" | "total",
    thresholdValue: "",
    notifyEmails: "",
  });

  const utils = trpc.useUtils();
  const { data: thresholds = [], isLoading } = trpc.admin.getAlertThresholds.useQuery();
  const { data: alertHistory = [] } = trpc.admin.getAlertHistory.useQuery({ limit: 20 });

  const createMutation = trpc.admin.createAlertThreshold.useMutation({
    onSuccess: () => {
      toast.success("Alert threshold created successfully");
      utils.admin.getAlertThresholds.invalidate();
      setIsCreateDialogOpen(false);
      setNewThreshold({
        name: "",
        thresholdType: "daily",
        thresholdValue: "",
        notifyEmails: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to create threshold: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.updateAlertThreshold.useMutation({
    onSuccess: () => {
      toast.success("Alert threshold updated successfully");
      utils.admin.getAlertThresholds.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update threshold: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.deleteAlertThreshold.useMutation({
    onSuccess: () => {
      toast.success("Alert threshold deleted successfully");
      utils.admin.getAlertThresholds.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete threshold: ${error.message}`);
    },
  });

  const triggerCheckMutation = trpc.admin.triggerAlertCheck.useMutation({
    onSuccess: () => {
      toast.success("Alert check triggered successfully");
      utils.admin.getAlertHistory.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to trigger alert check: ${error.message}`);
    },
  });

  const handleCreateThreshold = () => {
    if (!newThreshold.name || !newThreshold.thresholdValue || !newThreshold.notifyEmails) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      name: newThreshold.name,
      thresholdType: newThreshold.thresholdType,
      thresholdValue: parseFloat(newThreshold.thresholdValue),
      notifyEmails: newThreshold.notifyEmails,
    });
  };

  const handleToggleActive = (id: number, currentActive: number) => {
    updateMutation.mutate({
      id,
      isActive: currentActive === 0,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this alert threshold?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleTriggerCheck = () => {
    triggerCheckMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading alert configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Credit Alert Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure thresholds and receive email notifications when Manus credit usage exceeds limits
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTriggerCheck}
            disabled={triggerCheckMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${triggerCheckMutation.isPending ? "animate-spin" : ""}`} />
            Check Now
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Threshold
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Alert Threshold</DialogTitle>
                <DialogDescription>
                  Set up a new credit usage threshold with email notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Threshold Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Daily Credit Limit"
                    value={newThreshold.name}
                    onChange={(e) => setNewThreshold({ ...newThreshold, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Threshold Type</Label>
                  <Select
                    value={newThreshold.thresholdType}
                    onValueChange={(value: any) => setNewThreshold({ ...newThreshold, thresholdType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="total">Total (All Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Credit Limit</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="e.g., 100"
                    value={newThreshold.thresholdValue}
                    onChange={(e) => setNewThreshold({ ...newThreshold, thresholdValue: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Alert will trigger when usage reaches this amount
                  </p>
                </div>
                <div>
                  <Label htmlFor="emails">Notification Emails</Label>
                  <Input
                    id="emails"
                    placeholder="admin@example.com, team@example.com"
                    value={newThreshold.notifyEmails}
                    onChange={(e) => setNewThreshold({ ...newThreshold, notifyEmails: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Comma-separated email addresses
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateThreshold} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Threshold"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Active Thresholds</CardTitle>
          <CardDescription>
            Manage your credit usage alert thresholds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {thresholds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alert thresholds configured. Create one to start monitoring credit usage.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Notify</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thresholds.map((threshold: any) => (
                  <TableRow key={threshold.id}>
                    <TableCell className="font-medium">{threshold.name}</TableCell>
                    <TableCell className="capitalize">{threshold.thresholdType}</TableCell>
                    <TableCell>{parseFloat(threshold.thresholdValue).toFixed(2)} credits</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {threshold.notifyEmails.split(",").length} email(s)
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={threshold.isActive === 1}
                          onCheckedChange={() => handleToggleActive(threshold.id, threshold.isActive)}
                        />
                        <span className="text-sm">
                          {threshold.isActive === 1 ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(threshold.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            Recent credit usage alerts that were triggered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alertHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alerts have been triggered yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Triggered At</TableHead>
                  <TableHead>Credits Used</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Email Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertHistory.map((alert: any) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {alert.thresholdName || `Threshold #${alert.thresholdId}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(alert.triggeredAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-amber-600 font-semibold">
                      {parseFloat(alert.creditsUsed).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {parseFloat(alert.thresholdValue).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {alert.emailSent === 1 ? (
                        <span className="text-green-600">✓ Sent</span>
                      ) : (
                        <span className="text-red-600">✗ Failed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
