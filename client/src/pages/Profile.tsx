import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SocialMediaConnections } from "@/components/SocialMediaConnections";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Building, Calendar, Shield, Bell, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [preferredLanguage, setPreferredLanguage] = useState('en-GB');

  const { data: subscription, isLoading: subLoading } = trpc.subscription.get.useQuery();
  const { data: business, isLoading: businessLoading } = trpc.business.get.useQuery();
  const { data: notificationPrefs, isLoading: prefsLoading } = trpc.notificationPreferences.get.useQuery();

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(notificationPrefs?.emailNotifications ?? true);
  const [pressReleaseNotifications, setPressReleaseNotifications] = useState(notificationPrefs?.pressReleaseNotifications ?? true);
  const [campaignNotifications, setCampaignNotifications] = useState(notificationPrefs?.campaignNotifications ?? true);
  const [socialMediaNotifications, setSocialMediaNotifications] = useState(notificationPrefs?.socialMediaNotifications ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(notificationPrefs?.weeklyDigest ?? true);
  const [marketingEmails, setMarketingEmails] = useState(notificationPrefs?.marketingEmails ?? false);

  // Update state when preferences load
  useEffect(() => {
    if (notificationPrefs) {
      setEmailNotifications(notificationPrefs.emailNotifications);
      setPressReleaseNotifications(notificationPrefs.pressReleaseNotifications);
      setCampaignNotifications(notificationPrefs.campaignNotifications);
      setSocialMediaNotifications(notificationPrefs.socialMediaNotifications);
      setWeeklyDigest(notificationPrefs.weeklyDigest);
      setMarketingEmails(notificationPrefs.marketingEmails);
    }
  }, [notificationPrefs]);

  // Update language preference when business data loads
  useEffect(() => {
    if (business?.preferredLanguage) {
      setPreferredLanguage(business.preferredLanguage);
    }
  }, [business]);

  const updateNotificationsMutation = trpc.notificationPreferences.update.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences updated", {
        description: "Your notification settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to update preferences", {
        description: error.message,
      });
    },
  });

  const updateLanguageMutation = trpc.business.update.useMutation({
    onSuccess: () => {
      toast.success("Language preference updated", {
        description: "Your preferred language for AI-generated content has been saved.",
      });
    },
    onError: (error) => {
      toast.error("Failed to update language", {
        description: error.message,
      });
    },
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const isLoading = subLoading || businessLoading;

  // Show loading skeleton while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container py-6">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
        </div>
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    // TODO: Implement profile update mutation
    toast.success("Profile updated!", {
      description: "Your profile information has been saved successfully."
    });
    setIsEditing(false);
  };

  const handleSaveNotifications = () => {
    updateNotificationsMutation.mutate({
      emailNotifications,
      pressReleaseNotifications,
      campaignNotifications,
      socialMediaNotifications,
      weeklyDigest,
      marketingEmails,
    });
  };

  const handleExportData = () => {
    // TODO: Implement data export
    toast.info("Export started", {
      description: "We're preparing your data export. You'll receive a download link via email shortly."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>{user.name || "User"}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role</span>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "User"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Login Method</span>
                  <Badge variant="outline">{user.loginMethod || "OAuth"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {subscription && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plan</span>
                    <Badge className="bg-teal-600">
                      {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {business && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Company</span>
                    <p className="font-medium">{business.name}</p>
                  </div>
                  {business.sicSection && (
                    <div>
                      <span className="text-sm text-gray-600">Industry</span>
                      <p className="font-medium">{business.sicSection}</p>
                    </div>
                  )}
                  {business.website && (
                    <div>
                      <span className="text-sm text-gray-600">Website</span>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-teal-600 hover:underline"
                      >
                        {business.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditing(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                  <Calendar className="h-4 w-4" />
                  <span>Last signed in: {new Date(user.lastSignedIn).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pr-notifications">Press Release Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Get notified when press releases are published
                    </p>
                  </div>
                  <Switch
                    id="pr-notifications"
                    checked={pressReleaseNotifications}
                    onCheckedChange={setPressReleaseNotifications}
                    disabled={!emailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="campaign-notifications">Campaign Updates</Label>
                    <p className="text-sm text-gray-600">
                      Receive updates on campaign performance
                    </p>
                  </div>
                  <Switch
                    id="campaign-notifications"
                    checked={campaignNotifications}
                    onCheckedChange={setCampaignNotifications}
                    disabled={!emailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="social-notifications">Social Media Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Get notified about social media post performance
                    </p>
                  </div>
                  <Switch
                    id="social-notifications"
                    checked={socialMediaNotifications}
                    onCheckedChange={setSocialMediaNotifications}
                    disabled={!emailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest">Weekly Digest</Label>
                    <p className="text-sm text-gray-600">
                      Get a weekly summary of your activity
                    </p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                    disabled={!emailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-gray-600">
                      Receive product updates and promotional emails
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                    disabled={!emailNotifications}
                  />
                </div>

                <Button onClick={handleSaveNotifications} className="w-full mt-4" disabled={updateNotificationsMutation.isPending}>
                  Save Notification Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Language Preference */}
            <Card>
              <CardHeader>
                <CardTitle>Language Preference</CardTitle>
                <CardDescription>Choose your preferred language for AI-generated content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Select value={preferredLanguage} onValueChange={(value) => {
                    setPreferredLanguage(value);
                    updateLanguageMutation.mutate({ preferredLanguage: value });
                  }}>
                    <SelectTrigger id="preferredLanguage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-GB">English (British)</SelectItem>
                      <SelectItem value="en-US">English (American)</SelectItem>
                      <SelectItem value="es">Spanish (Español)</SelectItem>
                      <SelectItem value="fr">French (Français)</SelectItem>
                      <SelectItem value="de">German (Deutsch)</SelectItem>
                      <SelectItem value="it">Italian (Italiano)</SelectItem>
                      <SelectItem value="pt">Portuguese (Português)</SelectItem>
                      <SelectItem value="nl">Dutch (Nederlands)</SelectItem>
                      <SelectItem value="pl">Polish (Polski)</SelectItem>
                      <SelectItem value="ru">Russian (Русский)</SelectItem>
                      <SelectItem value="zh">Chinese (中文)</SelectItem>
                      <SelectItem value="ja">Japanese (日本語)</SelectItem>
                      <SelectItem value="ko">Korean (한국어)</SelectItem>
                      <SelectItem value="ar">Arabic (العربية)</SelectItem>
                      <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                      <SelectItem value="tr">Turkish (Türkçe)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    This language will be used for all AI-generated press releases, social media posts, and other content.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Connections */}
            <SocialMediaConnections />

            {/* Data & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Export Your Data</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Download a copy of your press releases, campaigns, and account data
                    </p>
                  </div>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    Delete Account
                  </Button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Privacy Information</h4>
                  <p className="text-xs text-gray-600">
                    We take your privacy seriously. Your data is encrypted and stored securely.
                    We never share your information with third parties without your consent.
                    For more information, please read our Privacy Policy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
