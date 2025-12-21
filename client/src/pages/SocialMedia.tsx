import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Plus, Calendar, Share2, FileSpreadsheet } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SocialMedia() {
  const [, setLocation] = useLocation();

  const exportCSVMutation = trpc.csvExport.exportSocialMediaAnalytics.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-media-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Social media posts exported to CSV');
    },
    onError: (error) => {
      toast.error('Failed to export CSV', {
        description: error.message
      });
    },
  });

  const handleExportCSV = () => {
    exportCSVMutation.mutate({});
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Social Media Posts</h1>
          <p className="text-muted-foreground">
            Manage and schedule your social media content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setLocation("/social-media/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Coming soon placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Management</CardTitle>
          <CardDescription>
            View and manage all your scheduled and published social media posts
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Share2 className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Create your first social media post or generate posts from a press release
          </p>
          <div className="flex gap-4">
            <Button onClick={() => setLocation("/social-media/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
            <Button variant="outline" onClick={() => setLocation("/press-releases")}>
              <Calendar className="w-4 h-4 mr-2" />
              View Press Releases
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
