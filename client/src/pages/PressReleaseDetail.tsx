import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Download, Share2, Calendar } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Streamdown } from "streamdown";

export default function PressReleaseDetail() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/press-releases/:id");
  const prId = params?.id ? parseInt(params.id) : null;

  const { data: pressReleases, isLoading } = trpc.pressRelease.list.useQuery(undefined, {
    enabled: !!user && !authLoading,
  });

  const pressRelease = pressReleases?.find((pr: any) => pr.id === prId);

  const handleExportPDF = async () => {
    if (!pressRelease) return;
    
    toast.info("PDF export coming soon!", {
      description: "This feature will be available in the next update.",
    });
  };

  const handleShare = () => {
    if (!pressRelease) return;
    
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  if (authLoading || isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (!pressRelease) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Press Release Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The press release you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => setLocation("/press-releases")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Press Releases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "scheduled":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <>
      <DashboardHeader currentPage="Press Releases" />
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => setLocation(`/press-releases/${pressRelease.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          </div>
        </div>

      {/* Press Release Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(pressRelease.status)}>
                  {pressRelease.status}
                </Badge>
                {pressRelease.scheduledFor && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    Scheduled for {format(new Date(pressRelease.scheduledFor), "PPP")}
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl">{pressRelease.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Created {format(new Date(pressRelease.createdAt), "PPP")} • 
                Updated {format(new Date(pressRelease.updatedAt), "PPP")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Featured Image */}
          {pressRelease.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={pressRelease.imageUrl}
                alt={pressRelease.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <Streamdown>{pressRelease.body}</Streamdown>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
