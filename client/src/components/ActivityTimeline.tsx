import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Share2, Megaphone, Send, Image, MessageSquare, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";

const getIcon = (entityType: string) => {
  switch (entityType) {
    case "press_release":
      return <FileText className="w-4 h-4" />;
    case "social_media_post":
      return <Share2 className="w-4 h-4" />;
    case "campaign":
      return <Megaphone className="w-4 h-4" />;
    case "distribution":
      return <Send className="w-4 h-4" />;
    case "ai_image":
      return <Image className="w-4 h-4" />;
    case "ai_chat":
      return <MessageSquare className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getTypeLabel = (entityType: string) => {
  switch (entityType) {
    case "press_release":
      return "Press Release";
    case "social_media_post":
      return "Social Media";
    case "campaign":
      return "Campaign";
    case "distribution":
      return "Distribution";
    case "ai_image":
      return "AI Image";
    case "ai_chat":
      return "AI Chat";
    default:
      return entityType.replace(/_/g, " ");
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "create":
      return "default";
    case "update":
      return "secondary";
    case "delete":
      return "destructive";
    default:
      return "outline";
  }
};

export function ActivityTimeline({ limit = 10 }: { limit?: number }) {
  const { data: activities, isLoading } = trpc.activityLog.recent.useQuery({ limit });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Your recent actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Your recent actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No recent activity</p>
            <p className="text-sm mt-1">Your actions will appear here as you use the platform</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>Your recent actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity: any) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                {getIcon(activity.entityType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={getActionColor(activity.action)} className="text-xs capitalize">
                    {activity.action}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(activity.entityType)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {activity.description}
                </p>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {Object.entries(activity.metadata).slice(0, 2).map(([key, value]) => (
                      <span key={key} className="mr-3">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
