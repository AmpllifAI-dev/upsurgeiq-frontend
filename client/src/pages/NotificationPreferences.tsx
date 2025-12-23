import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, Calendar, TrendingUp, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

export default function NotificationPreferences() {
  const { data: preferences, isLoading } = trpc.notificationPreferences.get.useQuery();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    emailNotifications: true,
    pressReleaseNotifications: true,
    campaignNotifications: true,
    socialMediaNotifications: true,
    weeklyDigest: true,
    marketingEmails: false,
    usageLimitAlertsEnabled: true,
    usageLimitThreshold: 80,
    scheduledPublishAlertsEnabled: true,
    scheduledPublishAdvanceNotice: 60,
    campaignMilestoneAlertsEnabled: true,
    weeklySummaryEnabled: true,
    weeklySummaryDay: "monday" as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
    monthlyAnalyticsEnabled: true,
    distributionAlertsEnabled: true,
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        emailNotifications: !!preferences.emailNotifications,
        pressReleaseNotifications: !!preferences.pressReleaseNotifications,
        campaignNotifications: !!preferences.campaignNotifications,
        socialMediaNotifications: !!preferences.socialMediaNotifications,
        weeklyDigest: !!preferences.weeklyDigest,
        marketingEmails: !!preferences.marketingEmails,
        usageLimitAlertsEnabled: !!preferences.usageLimitAlertsEnabled,
        usageLimitThreshold: preferences.usageLimitThreshold || 80,
        scheduledPublishAlertsEnabled: !!preferences.scheduledPublishAlertsEnabled,
        scheduledPublishAdvanceNotice: preferences.scheduledPublishAdvanceNotice || 60,
        campaignMilestoneAlertsEnabled: !!preferences.campaignMilestoneAlertsEnabled,
        weeklySummaryEnabled: !!preferences.weeklySummaryEnabled,
        weeklySummaryDay: (preferences.weeklySummaryDay as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday") || "monday",
        monthlyAnalyticsEnabled: !!preferences.monthlyAnalyticsEnabled,
        distributionAlertsEnabled: !!preferences.distributionAlertsEnabled,
      });
    }
  }, [preferences]);

  const updatePreferences = trpc.notificationPreferences.update.useMutation({
    onSuccess: () => {
      utils.notificationPreferences.get.invalidate();
      toast.success("Notification preferences updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });

  const handleSave = () => {
    updatePreferences.mutate({
      emailNotifications: formData.emailNotifications,
      pressReleaseNotifications: formData.pressReleaseNotifications,
      campaignNotifications: formData.campaignNotifications,
      socialMediaNotifications: formData.socialMediaNotifications,
      weeklyDigest: formData.weeklyDigest,
      marketingEmails: formData.marketingEmails,
      usageLimitAlertsEnabled: formData.usageLimitAlertsEnabled,
      usageLimitThreshold: formData.usageLimitThreshold,
      scheduledPublishAlertsEnabled: formData.scheduledPublishAlertsEnabled,
      scheduledPublishAdvanceNotice: formData.scheduledPublishAdvanceNotice,
      campaignMilestoneAlertsEnabled: formData.campaignMilestoneAlertsEnabled,
      weeklySummaryEnabled: formData.weeklySummaryEnabled,
      weeklySummaryDay: formData.weeklySummaryDay,
      monthlyAnalyticsEnabled: formData.monthlyAnalyticsEnabled,
      distributionAlertsEnabled: formData.distributionAlertsEnabled,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8" />
          Notification Preferences
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize which email alerts and notifications you receive
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              General Notifications
            </CardTitle>
            <CardDescription>
              Control basic email notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={formData.emailNotifications}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pressReleaseNotifications">Press Release Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about press release status changes
                </p>
              </div>
              <Switch
                id="pressReleaseNotifications"
                checked={formData.pressReleaseNotifications}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, pressReleaseNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="campaignNotifications">Campaign Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your marketing campaigns
                </p>
              </div>
              <Switch
                id="campaignNotifications"
                checked={formData.campaignNotifications}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, campaignNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="socialMediaNotifications">Social Media Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get alerts for social media post status
                </p>
              </div>
              <Switch
                id="socialMediaNotifications"
                checked={formData.socialMediaNotifications}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, socialMediaNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="distributionAlertsEnabled">Distribution Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about distribution success/failures
                </p>
              </div>
              <Switch
                id="distributionAlertsEnabled"
                checked={formData.distributionAlertsEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, distributionAlertsEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Limit Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Usage Limit Alerts
            </CardTitle>
            <CardDescription>
              Get notified when approaching your tier limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="usageLimitAlertsEnabled">Usage Limit Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when approaching tier limits
                </p>
              </div>
              <Switch
                id="usageLimitAlertsEnabled"
                checked={formData.usageLimitAlertsEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, usageLimitAlertsEnabled: checked })
                }
              />
            </div>

            {formData.usageLimitAlertsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="usageLimitThreshold">Alert Threshold (%)</Label>
                <Input
                  id="usageLimitThreshold"
                  type="number"
                  min="50"
                  max="100"
                  value={formData.usageLimitThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimitThreshold: parseInt(e.target.value) || 80 })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Get notified when you reach this percentage of your tier limit (50-100%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Content Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Content Alerts
            </CardTitle>
            <CardDescription>
              Notifications for scheduled press releases and campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="scheduledPublishAlertsEnabled">Scheduled Publish Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before scheduled content is published
                </p>
              </div>
              <Switch
                id="scheduledPublishAlertsEnabled"
                checked={formData.scheduledPublishAlertsEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, scheduledPublishAlertsEnabled: checked })
                }
              />
            </div>

            {formData.scheduledPublishAlertsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="scheduledPublishAdvanceNotice">Advance Notice (minutes)</Label>
                <Input
                  id="scheduledPublishAdvanceNotice"
                  type="number"
                  min="15"
                  max="1440"
                  value={formData.scheduledPublishAdvanceNotice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduledPublishAdvanceNotice: parseInt(e.target.value) || 60,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Receive notification this many minutes before scheduled publish (15-1440)
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="campaignMilestoneAlertsEnabled">Campaign Milestone Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when campaigns reach important milestones
                </p>
              </div>
              <Switch
                id="campaignMilestoneAlertsEnabled"
                checked={formData.campaignMilestoneAlertsEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, campaignMilestoneAlertsEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Reports & Summaries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Reports & Summaries
            </CardTitle>
            <CardDescription>
              Periodic reports and analytics summaries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your activity
                </p>
              </div>
              <Switch
                id="weeklyDigest"
                checked={formData.weeklyDigest}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, weeklyDigest: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weeklySummaryEnabled">Weekly Summary Report</Label>
                <p className="text-sm text-muted-foreground">
                  Detailed weekly performance report
                </p>
              </div>
              <Switch
                id="weeklySummaryEnabled"
                checked={formData.weeklySummaryEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, weeklySummaryEnabled: checked })
                }
              />
            </div>

            {formData.weeklySummaryEnabled && (
              <div className="space-y-2">
                <Label htmlFor="weeklySummaryDay">Delivery Day</Label>
                <Select
                  value={formData.weeklySummaryDay}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, weeklySummaryDay: value })
                  }
                >
                  <SelectTrigger id="weeklySummaryDay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose which day to receive your weekly summary
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monthlyAnalyticsEnabled">Monthly Analytics Report</Label>
                <p className="text-sm text-muted-foreground">
                  Comprehensive monthly performance analytics
                </p>
              </div>
              <Switch
                id="monthlyAnalyticsEnabled"
                checked={formData.monthlyAnalyticsEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, monthlyAnalyticsEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive tips, updates, and promotional content
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={formData.marketingEmails}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, marketingEmails: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updatePreferences.isPending}
          size="lg"
          className="min-w-32"
        >
          {updatePreferences.isPending ? (
            "Saving..."
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
