import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  GitBranch,
  Clock,
  Mail,
  Users
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function EmailWorkflows() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  
  // Form state
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [triggerType, setTriggerType] = useState<string>("subscription");
  
  // Step form state
  const [stepName, setStepName] = useState("");
  const [stepSubject, setStepSubject] = useState("");
  const [stepContent, setStepContent] = useState("");
  const [stepDelayDays, setStepDelayDays] = useState("0");
  const [stepDelayHours, setStepDelayHours] = useState("0");

  // Queries
  const { data: workflows, isLoading } = trpc.workflows.list.useQuery();
  const { data: workflowDetails } = trpc.workflows.getDetails.useQuery(
    { workflowId: selectedWorkflow! },
    { enabled: !!selectedWorkflow }
  );

  // Mutations
  const createWorkflow = trpc.workflows.create.useMutation({
    onSuccess: () => {
      toast({ title: "Workflow created successfully" });
      setIsCreateDialogOpen(false);
      resetForm();
      trpc.useUtils().workflows.list.invalidate();
    },
    onError: (error) => {
      toast({ title: "Error creating workflow", description: error.message, variant: "destructive" });
    },
  });

  const addStep = trpc.workflows.addStep.useMutation({
    onSuccess: () => {
      toast({ title: "Step added successfully" });
      setIsStepDialogOpen(false);
      resetStepForm();
      trpc.useUtils().workflows.getDetails.invalidate();
    },
    onError: (error) => {
      toast({ title: "Error adding step", description: error.message, variant: "destructive" });
    },
  });

  const toggleWorkflow = trpc.workflows.toggle.useMutation({
    onSuccess: (data) => {
      toast({ 
        title: data.isActive ? "Workflow activated" : "Workflow paused",
        description: data.isActive ? "Workflow is now running" : "Workflow has been paused"
      });
      trpc.useUtils().workflows.list.invalidate();
    },
  });

  const deleteWorkflow = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Workflow deleted successfully" });
      trpc.useUtils().workflows.list.invalidate();
    },
  });

  const resetForm = () => {
    setWorkflowName("");
    setWorkflowDescription("");
    setTriggerType("subscription");
  };

  const resetStepForm = () => {
    setStepName("");
    setStepSubject("");
    setStepContent("");
    setStepDelayDays("0");
    setStepDelayHours("0");
  };

  const handleCreateWorkflow = () => {
    if (!workflowName.trim()) {
      toast({ title: "Please enter a workflow name", variant: "destructive" });
      return;
    }

    createWorkflow.mutate({
      name: workflowName,
      description: workflowDescription,
      triggerType: triggerType as any,
    });
  };

  const handleAddStep = () => {
    if (!selectedWorkflow) return;
    
    if (!stepName.trim() || !stepSubject.trim() || !stepContent.trim()) {
      toast({ title: "Please fill in all step fields", variant: "destructive" });
      return;
    }

    addStep.mutate({
      workflowId: selectedWorkflow,
      name: stepName,
      subject: stepSubject,
      emailTemplate: stepContent,
      delayDays: parseInt(stepDelayDays),
      delayHours: parseInt(stepDelayHours),
    });
  };

  const getTriggerBadge = (trigger: string) => {
    const colors: Record<string, string> = {
      subscription: "bg-green-100 text-green-800",
      time_delay: "bg-blue-100 text-blue-800",
      subscriber_action: "bg-purple-100 text-purple-800",
      date_based: "bg-orange-100 text-orange-800",
      manual: "bg-gray-100 text-gray-800",
    };
    return colors[trigger] || "bg-gray-100 text-gray-800";
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      subscription: "New Subscription",
      time_delay: "Time Delay",
      subscriber_action: "Subscriber Action",
      date_based: "Date Based",
      manual: "Manual",
    };
    return labels[trigger] || trigger;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Workflows</h1>
            <p className="text-muted-foreground mt-2">
              Create automated email sequences and drip campaigns
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* Workflows List */}
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Workflows</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your automated email sequences
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading workflows...</p>
            </div>
          ) : !workflows || workflows.length === 0 ? (
            <div className="p-8 text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No workflows yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first automated email sequence
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow: any) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">{workflow.name}</TableCell>
                    <TableCell>
                      <Badge className={getTriggerBadge(workflow.triggerType)}>
                        {getTriggerLabel(workflow.triggerType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={workflow.isActive ? "default" : "secondary"}>
                        {workflow.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell>{workflow.stepCount || 0} steps</TableCell>
                    <TableCell>{workflow.enrollmentCount || 0} subscribers</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkflow(workflow.id);
                            setIsStepDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWorkflow.mutate({ workflowId: workflow.id })}
                        >
                          {workflow.isActive ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this workflow?")) {
                              deleteWorkflow.mutate({ workflowId: workflow.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Workflow Details */}
        {selectedWorkflow && workflowDetails && (
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">{workflowDetails.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {workflowDetails.description || "No description"}
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold mb-4">Workflow Steps</h3>
              {workflowDetails.steps && workflowDetails.steps.length > 0 ? (
                <div className="space-y-4">
                  {workflowDetails.steps.map((step: any, index: number) => (
                    <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{step.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Subject: {step.subject}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {step.delayDays > 0 && `${step.delayDays}d `}
                              {step.delayHours > 0 && `${step.delayHours}h`}
                              {step.delayDays === 0 && step.delayHours === 0 && "Immediate"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No steps added yet. Click the + button to add your first step.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Create Workflow Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Set up an automated email sequence that triggers based on subscriber actions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g., Welcome Series"
                />
              </div>

              <div>
                <Label htmlFor="workflow-description">Description (Optional)</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what this workflow does..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="trigger-type">Trigger Type</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger id="trigger-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">New Subscription</SelectItem>
                    <SelectItem value="time_delay">Time Delay</SelectItem>
                    <SelectItem value="subscriber_action">Subscriber Action</SelectItem>
                    <SelectItem value="date_based">Date Based</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  When should this workflow start for subscribers?
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow} disabled={createWorkflow.isPending}>
                {createWorkflow.isPending ? "Creating..." : "Create Workflow"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Step Dialog */}
        <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Workflow Step</DialogTitle>
              <DialogDescription>
                Add an email to this workflow sequence
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="step-name">Step Name</Label>
                <Input
                  id="step-name"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="e.g., Welcome Email"
                />
              </div>

              <div>
                <Label htmlFor="step-subject">Email Subject</Label>
                <Input
                  id="step-subject"
                  value={stepSubject}
                  onChange={(e) => setStepSubject(e.target.value)}
                  placeholder="e.g., Welcome to UpsurgeIQ!"
                />
              </div>

              <div>
                <Label htmlFor="step-content">Email Content</Label>
                <Textarea
                  id="step-content"
                  value={stepContent}
                  onChange={(e) => setStepContent(e.target.value)}
                  placeholder="Write your email content here..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delay-days">Delay (Days)</Label>
                  <Input
                    id="delay-days"
                    type="number"
                    min="0"
                    value={stepDelayDays}
                    onChange={(e) => setStepDelayDays(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="delay-hours">Delay (Hours)</Label>
                  <Input
                    id="delay-hours"
                    type="number"
                    min="0"
                    max="23"
                    value={stepDelayHours}
                    onChange={(e) => setStepDelayHours(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                How long to wait after the previous step before sending this email
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStepDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStep} disabled={addStep.isPending}>
                {addStep.isPending ? "Adding..." : "Add Step"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
