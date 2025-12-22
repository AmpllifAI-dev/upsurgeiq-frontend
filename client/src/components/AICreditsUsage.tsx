import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AICreditsUsage() {
  const { data: usage, isLoading } = trpc.aiCredits.getUsage.useQuery();

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <Skeleton className="h-20 w-48" />
        <Skeleton className="h-20 w-48" />
      </div>
    );
  }

  if (!usage || (!usage.aiChatEnabled && !usage.aiCallInEnabled)) {
    return null;
  }

  const aiChatPercentage = usage.aiChatEnabled 
    ? (usage.aiChatUsed / usage.aiChatTotal) * 100 
    : 0;
  
  const aiCallInPercentage = usage.aiCallInEnabled 
    ? (usage.aiCallInUsed / usage.aiCallInTotal) * 100 
    : 0;

  return (
    <div className="flex flex-wrap gap-3">
      {usage.aiChatEnabled && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">AI Chat</span>
                  <Badge variant="secondary" className="text-xs">
                    {usage.aiChatRemaining}/{usage.aiChatTotal}
                  </Badge>
                </div>
                <Progress 
                  value={aiChatPercentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {usage.aiChatRemaining} messages remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {usage.aiCallInEnabled && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">AI Call-in</span>
                  <Badge variant="secondary" className="text-xs">
                    {usage.aiCallInRemaining}/{usage.aiCallInTotal}
                  </Badge>
                </div>
                <Progress 
                  value={aiCallInPercentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {usage.aiCallInRemaining} calls remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
