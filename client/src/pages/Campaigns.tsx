import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Plus, Megaphone, FileSpreadsheet } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Campaigns() {
  const [, setLocation] = useLocation();

  const exportCSVMutation = trpc.csvExport.exportCampaignAnalytics.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaigns-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Campaigns exported to CSV');
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
          <h1 className="text-4xl font-bold mb-2">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your press releases and social media campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setLocation("/press-releases/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Coming soon placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
          <CardDescription>
            A campaign includes a press release and coordinated social media posts across all platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Megaphone className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Create your first campaign by starting with a press release
          </p>
          <Button onClick={() => setLocation("/press-releases/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Press Release
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
