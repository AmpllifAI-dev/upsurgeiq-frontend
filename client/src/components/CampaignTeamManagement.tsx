import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, Shield, Eye, Edit } from "lucide-react";
import { toast } from "sonner";

interface CampaignTeamManagementProps {
  campaignId: number;
  isOwner: boolean;
}

export function CampaignTeamManagement({ campaignId, isOwner }: CampaignTeamManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"viewer" | "editor" | "owner">("viewer");

  const { data: teamMembers = [], refetch } = trpc.campaign.getTeamMembers.useQuery({
    campaignId,
  });

  const addMemberMutation = trpc.campaign.addTeamMember.useMutation({
    onSuccess: () => {
      toast.success("Team member added successfully");
      setIsAddDialogOpen(false);
      setNewMemberEmail("");
      setNewMemberRole("viewer");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add team member: ${error.message}`);
    },
  });

  const removeMemberMutation = trpc.campaign.removeTeamMember.useMutation({
    onSuccess: () => {
      toast.success("Team member removed");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    },
  });

  const updateRoleMutation = trpc.campaign.updateTeamMemberRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  const handleAddMember = () => {
    // In a real implementation, you'd look up the user by email first
    // For now, we'll show a placeholder
    toast.info("User lookup by email will be implemented in the next update");
  };

  const handleRemoveMember = (memberId: number) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      removeMemberMutation.mutate({ id: memberId, campaignId });
    }
  };

  const handleUpdateRole = (memberId: number, role: "owner" | "editor" | "viewer") => {
    updateRoleMutation.mutate({ id: memberId, campaignId, role });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case "editor":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "viewer":
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "editor":
        return "Editor";
      case "viewer":
        return "Viewer";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members</h3>
        {isOwner && (
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {teamMembers.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No team members yet. Add collaborators to work together on this campaign.
          </Card>
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <div>
                      <p className="font-medium">{member.userName || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          handleUpdateRole(member.id, value as "owner" | "editor" | "viewer")
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {getRoleLabel(member.role)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Invite a team member to collaborate on this campaign.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Can view campaign details</SelectItem>
                  <SelectItem value="editor">
                    Editor - Can edit milestones and deliverables
                  </SelectItem>
                  <SelectItem value="owner">Owner - Full access including team management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!newMemberEmail}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
