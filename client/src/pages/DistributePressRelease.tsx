import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ArrowLeft, Send, Calendar as CalendarIcon, Users, Mail, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DistributePressRelease() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [selectedLists, setSelectedLists] = useState<number[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [sendImmediately, setSendImmediately] = useState(true);

  const { data: pressRelease, isLoading: prLoading } = trpc.pressRelease.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );

  const { data: mediaLists, isLoading: listsLoading } = trpc.mediaList.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: purchasedListIds = [] } = trpc.mediaList.getPurchasedListIds.useQuery(undefined, {
    enabled: !!user,
  });

  const createDistributionMutation = trpc.distribution.create.useMutation({
    onSuccess: () => {
      toast.success("Distribution created!", {
        description: sendImmediately 
          ? "Your press release is being sent to the selected media lists."
          : "Your press release has been scheduled for distribution.",
      });
      setLocation(`/press-releases/${id}`);
    },
    onError: (error) => {
      toast.error("Distribution failed", {
        description: error.message || "Unable to create distribution. Please try again.",
      });
    },
  });

  const handleToggleList = (listId: number) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const handleDistribute = () => {
    if (selectedLists.length === 0) {
      toast.error("No media lists selected", {
        description: "Please select at least one media list to distribute your press release.",
      });
      return;
    }

    if (!sendImmediately && !scheduleDate) {
      toast.error("No schedule date selected", {
        description: "Please select a date and time for scheduled distribution.",
      });
      return;
    }

    // For now, create distributions one by one for each media list
    selectedLists.forEach(listId => {
      createDistributionMutation.mutate({
        pressReleaseId: parseInt(id || "0"),
        mediaListId: listId,
        recipientCount: 0, // Will be calculated from actual contacts
      });
    });
  };

  const availableLists = mediaLists?.filter(list => 
    list.type === "custom" || purchasedListIds.includes(Number(list.id))
  ) || [];

  // For now, we'll show 0 contacts until we implement contact counting
  const totalContacts = 0;

  if (prLoading || listsLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pressRelease) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Press Release Not Found</CardTitle>
              <CardDescription>The press release you're looking for doesn't exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/press-releases")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Press Releases
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/press-releases/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Distribute Press Release</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <main id="main-content" className="container mx-auto py-8">
        <Breadcrumb
          items={[
            { label: "Press Releases", href: "/press-releases" },
            { label: pressRelease.title, href: `/press-releases/${id}` },
            { label: "Distribute" },
          ]}
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          {/* Left Column - Press Release Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Press Release Preview</CardTitle>
                <CardDescription>Review your press release before distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{pressRelease.title}</h3>
                  <div className="flex gap-2 mb-4">
                    <Badge>{pressRelease.status}</Badge>
                    <Badge variant="outline">{format(new Date(pressRelease.createdAt), "MMM d, yyyy")}</Badge>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground">{pressRelease.body}</p>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Options */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Schedule</CardTitle>
                <CardDescription>Choose when to send your press release</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send-now"
                    checked={sendImmediately}
                    onCheckedChange={(checked) => setSendImmediately(checked as boolean)}
                  />
                  <Label htmlFor="send-now" className="flex items-center gap-2 cursor-pointer">
                    <Send className="w-4 h-4" />
                    Send immediately
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schedule"
                    checked={!sendImmediately}
                    onCheckedChange={(checked) => setSendImmediately(!(checked as boolean))}
                  />
                  <Label htmlFor="schedule" className="flex items-center gap-2 cursor-pointer">
                    <Clock className="w-4 h-4" />
                    Schedule for later
                  </Label>
                </div>

                {!sendImmediately && (
                  <div className="ml-6 mt-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {scheduleDate ? format(scheduleDate, "PPP 'at' p") : "Pick a date and time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Media List Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Media Lists</CardTitle>
                <CardDescription>Choose which journalist lists to send to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableLists.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No media lists available. Purchase default lists or create custom ones.
                    </p>
                    <Button onClick={() => setLocation("/media-lists")}>
                      View Media Lists
                    </Button>
                  </div>
                ) : (
                  <>
                    {availableLists.map((list) => (
                      <div
                        key={list.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleToggleList(Number(list.id))}
                      >
                        <Checkbox
                          checked={selectedLists.includes(Number(list.id))}
                          onCheckedChange={() => handleToggleList(Number(list.id))}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label className="font-medium cursor-pointer">{list.name}</Label>
                            <Badge variant={list.type === "custom" ? "secondary" : "default"}>
                              {list.type}
                            </Badge>
                          </div>
                          {list.description && (
                            <p className="text-sm text-muted-foreground">{list.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Distribution Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected Lists:</span>
                  <span className="font-semibold">{selectedLists.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Contacts:</span>
                  <span className="font-semibold">{totalContacts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Send Time:</span>
                  <span className="font-semibold">
                    {sendImmediately ? "Immediately" : scheduleDate ? format(scheduleDate, "MMM d, p") : "Not set"}
                  </span>
                </div>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleDistribute}
                  disabled={selectedLists.length === 0 || createDistributionMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendImmediately ? "Send Now" : "Schedule Distribution"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
