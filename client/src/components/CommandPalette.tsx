import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Share2,
  Users,
  BarChart3,
  MessageSquare,
  Zap,
  Home,
  Settings,
  Beaker,
  Search,
  ArrowRight,
  Calendar,
  User,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: "navigation" | "press-release" | "campaign" | "media-list";
  title: string;
  subtitle?: string;
  icon: any;
  href: string;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: pressReleases } = trpc.pressRelease.list.useQuery(undefined, {
    enabled: open,
  });

  const { data: campaigns } = trpc.campaign.list.useQuery(undefined, {
    enabled: open,
  });

  const { data: mediaLists } = trpc.mediaList.list.useQuery(undefined, {
    enabled: open,
  });

  // Navigation items
  const navigationItems: SearchResult[] = [
    {
      id: "nav-home",
      type: "navigation",
      title: "Home",
      subtitle: "Go to homepage",
      icon: Home,
      href: "/",
    },
    {
      id: "nav-dashboard",
      type: "navigation",
      title: "Dashboard",
      subtitle: "View your dashboard",
      icon: Zap,
      href: "/dashboard",
    },
    {
      id: "nav-press-releases",
      type: "navigation",
      title: "Press Releases",
      subtitle: "Manage press releases",
      icon: FileText,
      href: "/press-releases",
    },
    {
      id: "nav-new-press-release",
      type: "navigation",
      title: "New Press Release",
      subtitle: "Create a new press release",
      icon: FileText,
      href: "/press-releases/new",
    },
    {
      id: "nav-social-media",
      type: "navigation",
      title: "Social Media",
      subtitle: "Manage social posts",
      icon: Share2,
      href: "/social-media/new",
    },
    {
      id: "nav-campaigns",
      type: "navigation",
      title: "Campaign Lab",
      subtitle: "Manage campaigns",
      icon: Beaker,
      href: "/campaigns",
    },
    {
      id: "nav-media-lists",
      type: "navigation",
      title: "Media Lists",
      subtitle: "Manage journalist contacts",
      icon: Users,
      href: "/media-lists",
    },
    {
      id: "nav-ai-assistant",
      type: "navigation",
      title: "AI Assistant",
      subtitle: "Chat with AI assistant",
      icon: MessageSquare,
      href: "/ai-assistant",
    },
    {
      id: "nav-analytics",
      type: "navigation",
      title: "Analytics",
      subtitle: "View performance metrics",
      icon: BarChart3,
      href: "/analytics",
    },
    {
      id: "nav-profile",
      type: "navigation",
      title: "Profile Settings",
      subtitle: "Manage your profile",
      icon: User,
      href: "/profile",
    },
  ];

  // Combine all searchable items
  const allResults = useMemo(() => {
    const results: SearchResult[] = [...navigationItems];

    // Add press releases
    if (pressReleases) {
      pressReleases.forEach((pr) => {
        results.push({
          id: `pr-${pr.id}`,
          type: "press-release",
          title: pr.title,
          subtitle: `Press Release • ${pr.status}`,
          icon: FileText,
          href: `/press-releases/${pr.id}`,
        });
      });
    }

    // Add campaigns
    if (campaigns) {
      campaigns.forEach((campaign) => {
        results.push({
          id: `campaign-${campaign.id}`,
          type: "campaign",
          title: campaign.name,
          subtitle: `Campaign • ${campaign.status}`,
          icon: Beaker,
          href: `/campaigns/${campaign.id}`,
        });
      });
    }

    // Add media lists
    if (mediaLists) {
      mediaLists.forEach((list) => {
        results.push({
          id: `media-list-${list.id}`,
          type: "media-list",
          title: list.name,
          subtitle: `Media List • ${list.type}`,
          icon: Users,
          href: `/media-lists/${list.id}`,
        });
      });
    }

    return results;
  }, [pressReleases, campaigns, mediaLists]);

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show navigation items by default
      return navigationItems;
    }

    const query = searchQuery.toLowerCase();
    return allResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query) ||
        result.subtitle?.toLowerCase().includes(query)
    );
  }, [searchQuery, allResults]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredResults, selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    setLocation(result.href);
    onOpenChange(false);
    setSearchQuery("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search pages, press releases, campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              autoFocus
            />
            <Badge variant="outline" className="text-xs">
              Ctrl+K
            </Badge>
          </div>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No results found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        index === selectedIndex
                          ? "bg-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          index === selectedIndex
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 flex-shrink-0 ${
                        index === selectedIndex
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {!searchQuery && (
          <div className="border-t border-border p-3 bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">
                    ↓
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">
                    Enter
                  </kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">
                    Esc
                  </kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
