import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Plus, Calendar, Share2 } from "lucide-react";

export default function SocialMedia() {
  const [, setLocation] = useLocation();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Social Media Posts</h1>
          <p className="text-muted-foreground">
            Manage and schedule your social media content
          </p>
        </div>
        <Button onClick={() => setLocation("/social-media/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Coming soon placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Management</CardTitle>
          <CardDescription>
            View and manage all your scheduled and published social media posts
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Share2 className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Create your first social media post or generate posts from a press release
          </p>
          <div className="flex gap-4">
            <Button onClick={() => setLocation("/social-media/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
            <Button variant="outline" onClick={() => setLocation("/press-releases")}>
              <Calendar className="w-4 h-4 mr-2" />
              View Press Releases
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
