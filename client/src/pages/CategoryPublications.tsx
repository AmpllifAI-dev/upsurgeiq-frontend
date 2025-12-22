import { useState } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Search } from "lucide-react";

export default function CategoryPublications() {
  const params = useParams<{ id: string }>();
  const categoryId = parseInt(params.id || "0");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch category details
  const { data: categories } = trpc.mediaList.getCategories.useQuery({});
  const category = categories?.find((c) => c.id === categoryId);

  // Fetch contacts for this category
  const { data: contacts, isLoading } = trpc.mediaList.getCategoryContacts.useQuery(
    { categoryId },
    { enabled: !!categoryId }
  );

  // Group contacts by publication
  const publicationGroups = contacts?.reduce((acc, contact) => {
    if (!acc[contact.publication]) {
      acc[contact.publication] = {
        name: contact.publication,
        journalists: [],
        regions: new Set<string>(),
        beats: new Set<string>(),
      };
    }
    acc[contact.publication].journalists.push(contact);
    if (contact.region) acc[contact.publication].regions.add(contact.region);
    if (contact.beat) acc[contact.publication].beats.add(contact.beat);
    return acc;
  }, {} as Record<string, { name: string; journalists: any[]; regions: Set<string>; beats: Set<string> }>);

  const publications = publicationGroups ? Object.values(publicationGroups) : [];

  // Filter publications by search query
  const filteredPublications = publications.filter((pub) =>
    pub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      {/* Back button */}
      <Link href="/media-lists">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{category?.name || "Media List"}</h1>
            <p className="text-muted-foreground text-lg">{category?.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {publications.length} publications • Est. {contacts?.length || 0} journalists
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              🔒 <strong>Privacy Notice:</strong> Individual journalist contact details are proprietary information and are not displayed. 
              This list shows publications only. When you distribute a press release, our system sends personalized emails to journalists at these publications on your behalf.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by publication name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Publications Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Publication Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Focus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Journalist Count
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPublications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        {searchQuery ? "No publications found matching your search." : "No publications in this category yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredPublications.map((pub, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-medium">{pub.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.from(pub.beats).slice(0, 3).map((beat, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {beat}
                              </Badge>
                            ))}
                            {pub.beats.size > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pub.beats.size - 3} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.from(pub.regions).map((region, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {pub.journalists.length} journalists
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!isLoading && filteredPublications.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Link href="/distribution/new">
            <Button size="lg">
              Use This List for Distribution
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
