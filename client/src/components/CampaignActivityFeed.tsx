import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  CheckCircle,
  UserPlus,
  UserMinus,
  Edit,
  Trash,
  Plus,
  Shield,
} from "lucide-react";

interface CampaignActivityFeedProps {
  campaignId: number;
  limit?: number;
}

export function CampaignActivityFeed({ campaignId, limit = 50 }: CampaignActivityFeedProps) {
  const { data: activities = [] } = trpc.campaign.getActivityLog.useQuery({
    campaignId,
    limit,
  });

  const getActivityIcon = (action: string) => {
    if (action.includes("created")) return <Plus className="h-4 w-4 text-green-500" />;
    if (action.includes("updated")) return <Edit className="h-4 w-4 text-blue-500" />;
    if (action.includes("deleted")) return <Trash className="h-4 w-4 text-red-500" />;
    if (action.includes("completed")) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (action.includes("added_team_member")) return <UserPlus className="h-4 w-4 text-blue-500" />;
    if (action.includes("removed_team_member")) return <UserMinus className="h-4 w-4 text-red-500" />;
    if (action.includes("role")) return <Shield className="h-4 w-4 text-yellow-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const getActivityMessage = (activity: any) => {
    const userName = activity.userName || "Someone";
    const action = activity.action;

    if (action === "created_campaign") return `${userName} created this campaign`;
    if (action === "updated_campaign") return `${userName} updated campaign details`;
    if (action === "created_milestone") return `${userName} added a milestone`;
    if (action === "updated_milestone") return `${userName} updated a milestone`;
    if (action === "deleted_milestone") return `${userName} deleted a milestone`;
    if (action === "completed_milestone") return `${userName} completed a milestone`;
    if (action === "created_deliverable") return `${userName} added a deliverable`;
    if (action === "updated_deliverable") return `${userName} updated a deliverable`;
    if (action === "deleted_deliverable") return `${userName} deleted a deliverable`;
    if (action === "added_team_member") return `${userName} added a team member`;
    if (action === "removed_team_member") return `${userName} removed a team member`;
    if (action === "updated_team_member_role") return `${userName} updated a team member's role`;

    return `${userName} performed an action`;
  };

  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No activity yet. Actions on this campaign will appear here.
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">{getActivityIcon(activity.action)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{getActivityMessage(activity)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
                {activity.changes && Object.keys(activity.changes).length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                    <details>
                      <summary className="cursor-pointer">View changes</summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {JSON.stringify(activity.changes, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
