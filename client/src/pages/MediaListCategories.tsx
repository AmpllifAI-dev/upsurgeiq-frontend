import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";


export default function MediaListCategories() {

  const [selectedType, setSelectedType] = useState<"genre" | "geography" | "industry">("genre");

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = trpc.mediaList.getCategories.useQuery({
    type: selectedType,
  });

  // Fetch generation requests
  const { data: requests, refetch: refetchRequests } = trpc.mediaList.getGenerationRequests.useQuery();

  // Check category status mutation
  const checkStatus = trpc.mediaList.checkCategoryStatus.useMutation({
    onSuccess: (data) => {
      if (data.needsGeneration) {
      alert("Generation started! We're building this media list for you. You'll receive an email when it's ready.");
        refetchRequests();
      } else {
        alert("This media list is already available!");
      }
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const getRequestStatus = (categoryId: number) => {
    return requests?.find((r) => r.categoryId === categoryId);
  };

  const handleCategoryClick = (categoryId: number, isPopulated: boolean) => {
    if (isPopulated) {
      // Navigate to contacts view
      window.location.href = `/media-lists/${categoryId}`;
    } else {
      // Check status and queue generation
      checkStatus.mutate({ categoryId });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Media List Categories</h1>
        <p className="text-muted-foreground">
          Browse and select media lists by genre, geography, or industry. Lists are automatically
          generated when you select them.
        </p>
      </div>

      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
        <TabsList className="mb-6">
          <TabsTrigger value="genre">By Genre</TabsTrigger>
          <TabsTrigger value="geography">By Geography</TabsTrigger>
          <TabsTrigger value="industry">By Industry</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType}>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((category) => {
                const request = getRequestStatus(category.id);
                const isGenerating = request?.status === "pending" || request?.status === "processing";
                const isFailed = request?.status === "failed";

                return (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleCategoryClick(category.id, category.isPopulated)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.isPopulated ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        ) : isGenerating ? (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Generating
                          </Badge>
                        ) : isFailed ? (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Generated</Badge>
                        )}
                      </div>
                      {category.description && (
                        <CardDescription className="mt-2">{category.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {category.isPopulated ? (
                        <p className="text-sm text-muted-foreground">
                          Click to view journalist contacts
                        </p>
                      ) : isGenerating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-sm text-muted-foreground">
                            AI is researching journalists...
                          </p>
                        </div>
                      ) : isFailed ? (
                        <p className="text-sm text-destructive">
                          Generation failed. Click to retry.
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Click to generate this list
                        </p>
                      )}
                      {request?.contactsGenerated && (
                        <p className="text-sm font-medium mt-2">
                          {request.contactsGenerated} contacts generated
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Generation Queue Status */}
      {requests && requests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Generation Requests</h2>
          <div className="space-y-2">
            {requests
              .filter((r) => r.status === "pending" || r.status === "processing")
              .map((request) => (
                <Card key={request.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{request.categoryName}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested {new Date(request.requestedAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      {request.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
