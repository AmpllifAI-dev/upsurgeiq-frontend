import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Share2, Users, Sparkles, BarChart3, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      icon: <FileText className="w-5 h-5" />,
      label: "New Press Release",
      description: "Create AI-powered press release",
      href: "/press-releases/new",
      variant: "default" as const,
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      label: "Social Post",
      description: "Schedule social media content",
      href: "/social-media/new",
      variant: "outline" as const,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Media List",
      description: "Manage journalist contacts",
      href: "/media-lists",
      variant: "outline" as const,
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: "AI Assistant",
      description: "Chat with AI for help",
      href: "/ai-assistant",
      variant: "outline" as const,
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Analytics",
      description: "View performance metrics",
      href: "/analytics",
      variant: "outline" as const,
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Campaign Lab",
      description: "A/B test your campaigns",
      href: "/campaigns",
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => setLocation(action.href)}
            >
              <div className="flex items-center gap-2 w-full">
                {action.icon}
                <span className="font-semibold text-sm">{action.label}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left w-full">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
