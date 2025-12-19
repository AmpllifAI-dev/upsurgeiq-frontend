import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Zap, Users, Plus, ArrowLeft, Upload, Eye, Edit, Trash2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MediaLists() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteListId, setDeleteListId] = useState<number | null>(null);
  
  const { data: mediaLists, isLoading, refetch } = trpc.mediaList.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: purchasedListIds = [] } = trpc.mediaList.getPurchasedListIds.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.mediaList.create.useMutation({
    onSuccess: () => {
      toast.success("Media list created!", {
        description: "Your custom media list is ready. Start adding journalist contacts."
      });
      setIsCreateOpen(false);
      setNewListName("");
      setNewListDescription("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create media list");
    },
  });

  const deleteMutation = trpc.mediaList.delete.useMutation({
    onSuccess: () => {
      toast.success("Media list deleted", {
        description: "The media list and all its contacts have been removed."
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete media list");
    },
  });

  const purchaseMutation = trpc.stripe.purchaseMediaList.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error("Purchase failed", {
        description: error.message || "Unable to start checkout process. Please try again."
      });
    },
  });

  const handlePurchaseList = (listId: number, listName: string) => {
    purchaseMutation.mutate({
      mediaListId: listId,
      mediaListName: listName,
      amount: 400, // £4 in pence
    });
  };

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
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
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

  const handleCreateList = () => {
    if (!newListName) {
      toast.error("Please enter a list name");
      return;
    }

    createMutation.mutate({
      name: newListName,
      description: newListDescription || undefined,
      type: "custom",
    });
  };

  const handleDelete = (id: number) => {
    setDeleteListId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteListId) {
      deleteMutation.mutate({ id: deleteListId });
      setDeleteListId(null);
    }
  };

  const defaultListsData = [
    {
      id: "tech-uk",
      name: "UK Tech Media",
      description: "Technology journalists and publications in the United Kingdom",
      type: "default",
      industry: "Technology",
      region: "UK",
      contactCount: 150,
      isDefault: true,
    },
    {
      id: "finance-london",
      name: "London Finance Press",
      description: "Financial journalists based in London",
      type: "default",
      industry: "Finance",
      region: "London",
      contactCount: 85,
      isDefault: true,
    },
    {
      id: "lifestyle-national",
      name: "National Lifestyle Media",
      description: "Lifestyle and consumer journalists across the UK",
      type: "default",
      industry: "Lifestyle",
      region: "National",
      contactCount: 200,
      isDefault: true,
    },
  ];

  // Combine default and custom lists
  const allLists = [
    ...defaultListsData,
    ...(mediaLists || []).map(list => ({ ...list, isDefault: false }))
  ];

  // Filter media lists based on search and type
  const filteredLists = useMemo(() => {
    return allLists.filter((list) => {
      const matchesSearch = searchQuery === "" || 
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === "all" || 
        (typeFilter === "default" && list.isDefault) ||
        (typeFilter === "custom" && !list.isDefault);
      
      return matchesSearch && matchesType;
    });
  }, [allLists, searchQuery, typeFilter]);

  const filteredDefaultLists = filteredLists.filter(list => list.isDefault);
  const filteredCustomLists = filteredLists.filter(list => !list.isDefault);

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
            <h1 className="text-4xl font-bold text-foreground">Media Lists</h1>
            <p className="text-muted-foreground mt-2">
              Manage journalist contacts and media distribution lists
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Media List</DialogTitle>
                <DialogDescription>
                  Create a custom media list for your contacts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="listName">List Name *</Label>
                  <Input
                    id="listName"
                    placeholder="e.g., Tech Journalists UK"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listDescription">Description</Label>
                  <Textarea
                    id="listDescription"
                    placeholder="Brief description of this media list..."
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleCreateList}
                    disabled={createMutation.isPending}
                  >
                    Create List
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search media lists by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="all">All Lists</option>
            <option value="default">Default Lists</option>
            <option value="custom">Custom Lists</option>
          </select>
        </div>

        {/* No Results */}
        {filteredLists.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No media lists found</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={() => { setSearchQuery(""); setTypeFilter("all"); }} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Default Lists */}
        {filteredDefaultLists.length > 0 && (
        <div className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Default Media Lists</h2>
            <p className="text-muted-foreground">
              Pre-curated journalist contacts organized by industry and region
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDefaultLists.map((list) => (
              <Card key={list.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">Default</Badge>
                      {purchasedListIds.includes(Number(list.id)) && (
                        <Badge variant="default" className="bg-green-500">Purchased</Badge>
                      )}
                    </div>
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">{list.name}</CardTitle>
                  <CardDescription>{list.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Industry:</span>
                      <Badge variant="secondary">{list.industry}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Region:</span>
                      <Badge variant="secondary">{list.region}</Badge>
                    </div>
                    {'contactCount' in list && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Contacts:</span>
                      <span className="font-semibold">{list.contactCount}</span>
                    </div>
                    )}
                    <div className="space-y-2">
                      {purchasedListIds.includes(Number(list.id)) ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setLocation(`/media-lists/${list.id}`)}
                          >
                            View Contacts
                          </Button>
                          <p className="text-xs text-success text-center font-medium">
                            ✓ Ready to use for press release distribution
                          </p>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handlePurchaseList(Number(list.id), list.name)}
                            disabled={purchaseMutation.isPending}
                          >
                            Purchase for £4
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            One-time payment per press release
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        )}

        {/* Custom Lists */}
        {filteredCustomLists.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Your Custom Lists</h2>
            <p className="text-muted-foreground">
              Media lists you've created or imported
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomLists.map((list: any) => (
              <Card key={list.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge>{list.type === "custom" ? "Custom" : "Purchased"}</Badge>
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">{list.name}</CardTitle>
                  {list.description && (
                    <CardDescription>{list.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {list.industry && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Industry:</span>
                        <Badge variant="secondary">{list.industry}</Badge>
                      </div>
                    )}
                    {list.region && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Region:</span>
                        <Badge variant="secondary">{list.region}</Badge>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(list.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        )}

        {/* Empty State for Custom Lists */}
        {typeFilter !== "default" && (!mediaLists || mediaLists.length === 0) && filteredLists.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No custom lists yet</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Build targeted media lists for your press release distribution. Start with our pre-curated default lists or create your own.
              </p>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                You can import contacts from CSV files or add journalists manually to reach the right audience.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create List
                </Button>
                <Button variant="outline" disabled>
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Media List"
        description="Are you sure you want to delete this media list? This action cannot be undone and all contacts in this list will be removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
