export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) {
          return "";
        }
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(",")
    )
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPressReleasesToCSV(pressReleases: any[]) {
  const data = pressReleases.map(pr => ({
    ID: pr.id,
    Title: pr.title,
    Status: pr.status,
    "Created Date": new Date(pr.createdAt).toLocaleDateString(),
    "Published Date": pr.publishedAt ? new Date(pr.publishedAt).toLocaleDateString() : "N/A",
    "Scheduled For": pr.scheduledFor ? new Date(pr.scheduledFor).toLocaleDateString() : "N/A",
  }));
  
  exportToCSV(data, "press-releases");
}

export function exportCampaignsToCSV(campaigns: any[]) {
  const data = campaigns.map(c => ({
    ID: c.id,
    Name: c.name,
    Status: c.status,
    Type: c.type,
    "Created Date": new Date(c.createdAt).toLocaleDateString(),
    "Start Date": c.startDate ? new Date(c.startDate).toLocaleDateString() : "N/A",
    "End Date": c.endDate ? new Date(c.endDate).toLocaleDateString() : "N/A",
  }));
  
  exportToCSV(data, "campaigns");
}

export function exportSocialPostsToCSV(socialPosts: any[]) {
  const data = socialPosts.map(post => ({
    ID: post.id,
    Content: post.content?.substring(0, 100) + "...", // Truncate long content
    Platform: post.platform,
    Status: post.status,
    "Created Date": new Date(post.createdAt).toLocaleDateString(),
    "Scheduled For": post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString() : "N/A",
  }));
  
  exportToCSV(data, "social-media-posts");
}

export function exportAnalyticsToCSV(analytics: {
  pressReleases: any[];
  socialPosts: any[];
  campaigns: any[];
}) {
  const data = [
    {
      Metric: "Total Press Releases",
      Value: analytics.pressReleases.length,
      Published: analytics.pressReleases.filter(pr => pr.status === "published").length,
      Draft: analytics.pressReleases.filter(pr => pr.status === "draft").length,
    },
    {
      Metric: "Total Social Posts",
      Value: analytics.socialPosts.length,
      Published: analytics.socialPosts.filter(p => p.status === "published").length,
      Scheduled: analytics.socialPosts.filter(p => p.status === "scheduled").length,
    },
    {
      Metric: "Total Campaigns",
      Value: analytics.campaigns.length,
      Active: analytics.campaigns.filter(c => c.status === "active").length,
      Completed: analytics.campaigns.filter(c => c.status === "completed").length,
    },
  ];
  
  exportToCSV(data, "analytics-summary");
}
