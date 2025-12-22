import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, Mail, Phone, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { JournalistCSVImport } from "@/components/JournalistCSVImport";

export default function JournalistList() {
  const [searchQuery, setSearchQuery] = useState("");
  const utils = trpc.useUtils();

  // Fetch journalists
  const { data: journalists, isLoading } = trpc.journalists.list.useQuery();

  // Delete mutation
  const deleteMutation = trpc.journalists.delete.useMutation({
    onSuccess: () => {
      utils.journalists.list.invalidate();
      toast.success("Journalist deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete journalist: ${error.message}`);
    },
  });

  // Filter journalists based on search
  const filteredJournalists = journalists?.filter((j) => {
    const query = searchQuery.toLowerCase();
    return (
      j.firstName.toLowerCase().includes(query) ||
      j.lastName.toLowerCase().includes(query) ||
      j.email.toLowerCase().includes(query) ||
      j.title?.toLowerCase().includes(query)
    );
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this journalist?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Media Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your journalist and media outlet relationships
          </p>
        </div>
        <div className="flex gap-2">
          <JournalistCSVImport onImportComplete={() => utils.journalists.list.invalidate()} />
          <Link href="/journalists/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Journalist
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search journalists by name, email, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journalists Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Journalists ({filteredJournalists?.length || 0})</CardTitle>
          <CardDescription>
            Your complete media contact database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading journalists...
            </div>
          ) : filteredJournalists && filteredJournalists.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Contacted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJournalists.map((journalist) => (
                  <TableRow key={journalist.id}>
                    <TableCell>
                      <Link href={`/journalists/${journalist.id}`}>
                        <button className="font-medium hover:underline text-left">
                          {journalist.firstName} {journalist.lastName}
                        </button>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {journalist.title || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <a
                          href={`mailto:${journalist.email}`}
                          className="text-sm flex items-center gap-1 hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          {journalist.email}
                        </a>
                        {journalist.phone && (
                          <a
                            href={`tel:${journalist.phone}`}
                            className="text-sm text-muted-foreground flex items-center gap-1 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            {journalist.phone}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {journalist.lastContactedAt
                        ? new Date(journalist.lastContactedAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/journalists/${journalist.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/journalists/${journalist.id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {journalist.twitter && (
                            <DropdownMenuItem asChild>
                              <a
                                href={`https://twitter.com/${journalist.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Twitter
                              </a>
                            </DropdownMenuItem>
                          )}
                          {journalist.linkedin && (
                            <DropdownMenuItem asChild>
                              <a
                                href={journalist.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                LinkedIn
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(journalist.id)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No journalists found matching your search"
                  : "No journalists yet. Add your first media contact to get started."}
              </p>
              <Link href="/journalists/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Journalist
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
