import { useState, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, FileText, Share2, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocation } from "wouter";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: "press-release" | "social-post";
  status: string;
  resource: any;
}

export default function ContentCalendar() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const { data: pressReleases, isLoading: prLoading } = trpc.pressRelease.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: socialPosts, isLoading: socialLoading } = trpc.socialMedia.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Convert data to calendar events
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    // Add scheduled press releases
    if (pressReleases) {
      pressReleases
        .filter((pr) => pr.scheduledFor)
        .forEach((pr) => {
          const scheduledDate = new Date(pr.scheduledFor!);
          calendarEvents.push({
            id: pr.id,
            title: pr.title,
            start: scheduledDate,
            end: new Date(scheduledDate.getTime() + 60 * 60 * 1000), // 1 hour duration
            type: "press-release",
            status: pr.status,
            resource: pr,
          });
        });
    }

    // Add scheduled social posts
    if (socialPosts) {
      socialPosts
        .filter((post) => post.scheduledFor)
        .forEach((post) => {
          const scheduledDate = new Date(post.scheduledFor!);
          calendarEvents.push({
            id: post.id,
            title: post.content.substring(0, 50) + "...",
            start: scheduledDate,
            end: new Date(scheduledDate.getTime() + 30 * 60 * 1000), // 30 min duration
            type: "social-post",
            status: post.status,
            resource: post,
          });
        });
    }

    return calendarEvents;
  }, [pressReleases, socialPosts]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }, []);

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date }) => {
      // Quick create dialog could go here
      toast.info("Click 'New Content' to create scheduled content");
    },
    []
  );

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#008080"; // teal
    if (event.type === "social-post") {
      backgroundColor = "#7FFF00"; // chartreuse
    }
    if (event.status === "published") {
      backgroundColor = "#808080"; // gray for published
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: event.type === "social-post" ? "#000" : "#fff",
        border: "none",
        display: "block",
      },
    };
  };

  if (authLoading || prLoading || socialLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Content Calendar", href: "/content-calendar" },
            ]}
          />
          <h1 className="text-3xl font-bold mt-2">Content Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your scheduled content
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setLocation("/press-releases/new")} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            New Press Release
          </Button>
          <Button onClick={() => setLocation("/social-media/new")}>
            <Share2 className="w-4 h-4 mr-2" />
            New Social Post
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6 items-center">
            <span className="text-sm font-medium">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#008080" }}></div>
              <span className="text-sm">Press Release</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#7FFF00" }}></div>
              <span className="text-sm">Social Post</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#808080" }}></div>
              <span className="text-sm">Published</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="pt-6">
          <div style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              popup
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.type === "press-release" ? (
                <FileText className="w-5 h-5" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
              {selectedEvent?.type === "press-release" ? "Press Release" : "Social Post"}
            </DialogTitle>
            <DialogDescription>
              Scheduled for {selectedEvent?.start.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Title</h3>
              <p>{selectedEvent?.title}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <Badge>{selectedEvent?.status}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (selectedEvent?.type === "press-release") {
                    setLocation(`/press-releases/${selectedEvent.id}`);
                  } else {
                    setLocation(`/social-media`);
                  }
                }}
                className="flex-1"
              >
                View Details
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEventDialogOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {events.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No scheduled content</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Schedule press releases and social media posts to see them on your calendar.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setLocation("/press-releases/new")} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Create Press Release
              </Button>
              <Button onClick={() => setLocation("/social-media/new")}>
                <Share2 className="w-4 h-4 mr-2" />
                Create Social Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
