import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Trophy, MapPin, Calendar } from "lucide-react";

const SPORTS = [
  "football",
  "soccer",
  "basketball",
  "motorsport",
  "racing",
  "rugby",
  "cricket",
  "baseball",
  "hockey",
  "tennis",
  "golf",
  "athletics",
  "swimming",
  "cycling",
  "boxing",
  "mma",
  "esports",
  "other",
];

export default function SportsTeams() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  
  const { data: teams, isLoading, refetch } = trpc.sportsTeams.list.useQuery();
  const createMutation = trpc.sportsTeams.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateOpen(false);
    },
  });
  const updateMutation = trpc.sportsTeams.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingTeam(null);
    },
  });
  const deleteMutation = trpc.sportsTeams.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const [formData, setFormData] = useState({
    teamName: "",
    sport: "",
    league: "",
    division: "",
    location: "",
    founded: "",
    stadium: "",
    website: "",
    description: "",
    primaryColor: "",
    secondaryColor: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      founded: formData.founded ? parseInt(formData.founded) : undefined,
    };

    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (team: any) => {
    setFormData({
      teamName: team.teamName || "",
      sport: team.sport || "",
      league: team.league || "",
      division: team.division || "",
      location: team.location || "",
      founded: team.founded?.toString() || "",
      stadium: team.stadium || "",
      website: team.website || "",
      description: team.description || "",
      primaryColor: team.primaryColor || "",
      secondaryColor: team.secondaryColor || "",
    });
    setEditingTeam(team.id);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this team?")) {
      deleteMutation.mutate({ id });
    }
  };

  const resetForm = () => {
    setFormData({
      teamName: "",
      sport: "",
      league: "",
      division: "",
      location: "",
      founded: "",
      stadium: "",
      website: "",
      description: "",
      primaryColor: "",
      secondaryColor: "",
    });
    setEditingTeam(null);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sports Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage your sports team profiles and generate team-specific press releases
          </p>
        </div>
        <Dialog open={isCreateOpen || editingTeam !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
              <DialogDescription>
                {editingTeam ? "Update team information" : "Create a new sports team profile"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    required
                    placeholder="Manchester United"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sport">Sport *</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value) => setFormData({ ...formData, sport: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport.charAt(0).toUpperCase() + sport.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="league">League</Label>
                  <Input
                    id="league"
                    value={formData.league}
                    onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                    placeholder="Premier League"
                  />
                </div>

                <div>
                  <Label htmlFor="division">Division</Label>
                  <Input
                    id="division"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="First Division"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Manchester, UK"
                  />
                </div>

                <div>
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    id="founded"
                    type="number"
                    value={formData.founded}
                    onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                    placeholder="1878"
                  />
                </div>

                <div>
                  <Label htmlFor="stadium">Stadium/Venue</Label>
                  <Input
                    id="stadium"
                    value={formData.stadium}
                    onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                    placeholder="Old Trafford"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the team..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTeam ? "Update Team" : "Create Team"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teams && teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first sports team profile to start generating team-specific press releases
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams?.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <div
                className="h-24 flex items-center justify-center text-white font-bold text-2xl"
                style={{
                  background: team.primaryColor
                    ? `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor || team.primaryColor} 100%)`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                {team.teamName}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{team.teamName}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(team)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(team.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="capitalize">{team.sport}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {team.league && (
                  <div className="flex items-center text-sm">
                    <Trophy className="w-4 h-4 mr-2 text-muted-foreground" />
                    {team.league}
                  </div>
                )}
                {team.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    {team.location}
                  </div>
                )}
                {team.founded && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    Founded {team.founded}
                  </div>
                )}
                {team.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {team.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
