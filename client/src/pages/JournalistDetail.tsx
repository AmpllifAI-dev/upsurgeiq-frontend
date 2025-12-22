import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  Edit,
  Trash2,
  Twitter,
  Linkedin,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

export default function JournalistDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const journalistId = params.id ? parseInt(params.id) : null;

  const utils = trpc.useUtils();

  // Fetch journalist details
  const { data: journalist, isLoading } = trpc.journalists.getById.useQuery(
    { id: journalistId! },
    { enabled: !!journalistId }
  );

  // Fetch outreach history
  const { data: outreachHistory } = trpc.journalists.getOutreach.useQuery(
    { journalistId: journalistId! },
    { enabled: !!journalistId }
  );

  // Delete mutation
  const deleteMutation = trpc.journalists.delete.useMutation({
    onSuccess: () => {
      utils.journalists.list.invalidate();
      toast.success("Journalist deleted successfully");
      setLocation("/journalists");
    },
    onError: (error) => {
      toast.error(`Failed to delete journalist: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this journalist?")) {
      deleteMutation.mutate({ id: journalistId! });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!journalist) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Journalist not found</p>
          <Button onClick={() => setLocation("/journalists")}>
            Back to Journalists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation("/journalists")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Journalists
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {journalist.firstName} {journalist.lastName}
                  </CardTitle>
                  {journalist.title && (
                    <CardDescription className="text-base mt-1">
                      {journalist.title}
                    </CardDescription>
                  )}
                </div>
                <Badge
                  variant={
                    journalist.status === "active"
                      ? "default"
                      : journalist.status === "inactive"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {journalist.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="space-y-1">
                  <a
                    href={`mailto:${journalist.email}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {journalist.email}
                  </a>
                  {journalist.phone && (
                    <a
                      href={`tel:${journalist.phone}`}
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {journalist.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Social Media */}
              {(journalist.twitter || journalist.linkedin || journalist.website) && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Social Media & Web</h3>
                  <div className="space-y-1">
                    {journalist.twitter && (
                      <a
                        href={`https://twitter.com/${journalist.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <Twitter className="w-4 h-4" />
                        {journalist.twitter}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {journalist.linkedin && (
                      <a
                        href={journalist.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {journalist.website && (
                      <a
                        href={journalist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        Personal Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {journalist.bio && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Bio</h3>
                  <p className="text-sm text-muted-foreground">{journalist.bio}</p>
                </div>
              )}

              {/* Notes */}
              {journalist.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Internal Notes</h3>
                  <p className="text-sm text-muted-foreground">{journalist.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setLocation(`/journalists/${journalist.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Outreach History */}
          <Card>
            <CardHeader>
              <CardTitle>Outreach History</CardTitle>
              <CardDescription>
                Communication log with this journalist
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outreachHistory && outreachHistory.length > 0 ? (
                <div className="space-y-4">
                  {outreachHistory.map((outreach) => (
                    <div
                      key={outreach.id}
                      className="border-l-2 border-muted pl-4 py-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">{outreach.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(outreach.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                      {outreach.subject && (
                        <p className="font-medium text-sm">{outreach.subject}</p>
                      )}
                      {outreach.message && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {outreach.message}
                        </p>
                      )}
                      <Badge
                        variant={outreach.status === "replied" ? "default" : "secondary"}
                        className="mt-2"
                      >
                        {outreach.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No outreach history yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Last Contacted</p>
                <p className="font-medium">
                  {journalist.lastContactedAt
                    ? new Date(journalist.lastContactedAt).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outreach</p>
                <p className="font-medium">{outreachHistory?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="font-medium">
                  {outreachHistory && outreachHistory.length > 0
                    ? `${Math.round(
                        (outreachHistory.filter((o) => o.status === "replied")
                          .length /
                          outreachHistory.length) *
                          100
                      )}%`
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${journalist.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </a>
              </Button>
              {journalist.phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${journalist.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
