import { useState, useEffect } from "react";
import { useLocation, useParams, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function JournalistForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [isEditMode] = useRoute("/journalists/:id/edit");
  const journalistId = params.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    mediaOutletId: undefined as number | undefined,
    twitter: "",
    linkedin: "",
    website: "",
    bio: "",
    notes: "",
    status: "active" as "active" | "inactive" | "bounced",
  });

  const utils = trpc.useUtils();

  // Fetch journalist if editing
  const { data: journalist } = trpc.journalists.getById.useQuery(
    { id: journalistId! },
    { enabled: !!journalistId }
  );

  // Fetch media outlets for dropdown
  const { data: outlets } = trpc.mediaOutlets.list.useQuery();

  // Create mutation
  const createMutation = trpc.journalists.create.useMutation({
    onSuccess: () => {
      utils.journalists.list.invalidate();
      toast.success("Journalist created successfully");
      setLocation("/journalists");
    },
    onError: (error) => {
      toast.error(`Failed to create journalist: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = trpc.journalists.update.useMutation({
    onSuccess: () => {
      utils.journalists.list.invalidate();
      utils.journalists.getById.invalidate({ id: journalistId! });
      toast.success("Journalist updated successfully");
      setLocation(`/journalists/${journalistId}`);
    },
    onError: (error) => {
      toast.error(`Failed to update journalist: ${error.message}`);
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (journalist) {
      setFormData({
        firstName: journalist.firstName,
        lastName: journalist.lastName,
        email: journalist.email,
        phone: journalist.phone || "",
        title: journalist.title || "",
        mediaOutletId: journalist.mediaOutletId || undefined,
        twitter: journalist.twitter || "",
        linkedin: journalist.linkedin || "",
        website: journalist.website || "",
        bio: journalist.bio || "",
        notes: journalist.notes || "",
        status: journalist.status,
      });
    }
  }, [journalist]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && journalistId) {
      updateMutation.mutate({
        id: journalistId,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container max-w-3xl py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation("/journalists")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Journalists
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Edit Journalist" : "Add New Journalist"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update journalist information and contact details"
              : "Add a new media contact to your journalist database"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Technology Reporter"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="mediaOutlet">Media Outlet</Label>
                <Select
                  value={formData.mediaOutletId?.toString() || ""}
                  onValueChange={(value) =>
                    handleChange("mediaOutletId", value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select media outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {outlets?.map((outlet) => (
                      <SelectItem key={outlet.id} value={outlet.id.toString()}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleChange("status", value as "active" | "inactive" | "bounced")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div>
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Media & Web</h3>
              <div>
                <Label htmlFor="twitter">Twitter Handle</Label>
                <Input
                  id="twitter"
                  placeholder="@username"
                  value={formData.twitter}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief professional bio or background"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Private notes about this journalist (not visible to them)"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Update Journalist" : "Create Journalist"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/journalists")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
