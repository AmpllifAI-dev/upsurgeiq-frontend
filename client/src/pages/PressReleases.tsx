import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, FileText, Plus, Calendar, ArrowLeft, Eye, Edit, Trash2, Search, Download } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { exportPressReleaseToPDF, exportBulkPressReleasesToPDF } from "@/lib/pdfExport";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilter } from "@/components/SearchFilter";

export default function PressReleases() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Published", value: "published" },
  ];
  
  const { data: pressReleases, isLoading, refetch } = trpc.pressRelease.list.useQuery(undefined, {
    enabled: !!user,
  });

  const deleteMutation = trpc.pressRelease.delete.useMutation({
    onSuccess: () => {
      toast.success("Press release deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete press release");
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
            </div>
          </div>
        </nav>
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="mb-6">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this press release?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleExportPDF = (pr: any) => {
    exportPressReleaseToPDF({
      title: pr.title,
      subtitle: pr.subtitle || undefined,
      body: pr.body,
      date: new Date(pr.createdAt),
    });
    toast.success("PDF exported successfully");
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one press release");
      return;
    }

    const selectedPRs = pressReleases?.filter((pr) => selectedIds.includes(pr.id));
    if (!selectedPRs || selectedPRs.length === 0) return;

    exportBulkPressReleasesToPDF(
      selectedPRs.map((pr) => ({
        title: pr.title,
        subtitle: pr.subtitle || undefined,
        body: pr.body,
        date: new Date(pr.createdAt),
      }))
    );
    toast.success(`Exported ${selectedPRs.length} press releases to PDF`);
    setSelectedIds([]);
    setBulkMode(false);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPressReleases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPressReleases.map((pr) => pr.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      scheduled: "default",
      published: "outline",
    };
    return variants[status] || "secondary";
  };

  // Filter and sort press releases
  const filteredPressReleases = useMemo(() => {
    if (!pressReleases) return [];
    
    // Filter
    let filtered = pressReleases.filter((pr) => {
      const matchesSearch = searchQuery === "" || 
        pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pr.subtitle && pr.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pr.body.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || pr.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status);
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [pressReleases, searchQuery, statusFilter, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div id="main-content" className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Press Releases</h1>
            <p className="text-muted-foreground mt-2">Manage your press releases and announcements</p>
          </div>
          <div className="flex gap-2">
            {bulkMode ? (
              <>
                <Button variant="outline" onClick={() => {
                  setBulkMode(false);
                  setSelectedIds([]);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleBulkExport} disabled={selectedIds.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export {selectedIds.length > 0 && `(${selectedIds.length})`}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setBulkMode(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Bulk Export
                </Button>
                <Button onClick={() => setLocation("/press-releases/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Press Release
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        {pressReleases && pressReleases.length > 0 && (
          <div className="mb-6 space-y-4">
            <SearchFilter
              searchPlaceholder="Search press releases by title, subtitle, or content..."
              statusOptions={statusOptions}
              onSearchChange={setSearchQuery}
              onStatusChange={setStatusFilter}
              onClearFilters={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortBy("date");
                setSortOrder("desc");
              }}
              showStatusFilter={true}
            />
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant={sortBy === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (sortBy === "date") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("date");
                    setSortOrder("desc");
                  }
                }}
              >
                Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
              <Button
                variant={sortBy === "title" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (sortBy === "title") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("title");
                    setSortOrder("asc");
                  }
                }}
              >
                Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
              <Button
                variant={sortBy === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (sortBy === "status") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("status");
                    setSortOrder("asc");
                  }
                }}
              >
                Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
            </div>
          </div>
        )}

        {!pressReleases || pressReleases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No press releases yet</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Create your first AI-powered press release to start amplifying your brand voice across media channels.
              </p>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                Our AI will use your business dossier to generate professional, on-brand content in seconds.
              </p>
              <Button onClick={() => setLocation("/press-releases/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Press Release
              </Button>
            </CardContent>
          </Card>
        ) : filteredPressReleases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No press releases found</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredPressReleases.map((pr) => (
              <Card key={pr.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={getStatusBadge(pr.status)}>
                          {pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(pr.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <CardTitle className="text-2xl mb-2">{pr.title}</CardTitle>
                      {pr.subtitle && (
                        <CardDescription className="text-base">{pr.subtitle}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/press-releases/${pr.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/press-releases/${pr.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF(pr)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pr.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
