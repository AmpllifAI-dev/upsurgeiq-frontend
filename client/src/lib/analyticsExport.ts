interface AnalyticsEntry {
  id: number;
  campaignId: number;
  date: Date;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  spend: number | null;
  reach: number | null;
  engagements: number | null;
  createdAt: Date;
}

interface ExportOptions {
  campaignName: string;
  dateRange: string;
  analytics: AnalyticsEntry[];
}

/**
 * Export analytics data to CSV format
 */
export function exportAnalyticsToCSV(options: ExportOptions): void {
  const { campaignName, dateRange, analytics } = options;

  // Calculate totals
  const totals = analytics.reduce(
    (acc, entry) => ({
      impressions: acc.impressions + (entry.impressions || 0),
      clicks: acc.clicks + (entry.clicks || 0),
      conversions: acc.conversions + (entry.conversions || 0),
      spend: acc.spend + (entry.spend || 0),
      reach: acc.reach + (entry.reach || 0),
      engagements: acc.engagements + (entry.engagements || 0),
    }),
    { impressions: 0, clicks: 0, conversions: 0, spend: 0, reach: 0, engagements: 0 }
  );

  // Calculate rates
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
  const overallCvr = totals.impressions > 0 ? (totals.conversions / totals.impressions) * 100 : 0;

  // Build CSV content
  const headers = [
    "Date",
    "Impressions",
    "Clicks",
    "Conversions",
    "Spend (£)",
    "Reach",
    "Engagements",
  ];

  const rows = analytics.map((entry) => [
    new Date(entry.date).toLocaleDateString("en-GB"),
    entry.impressions || 0,
    entry.clicks || 0,
    entry.conversions || 0,
    entry.spend || 0,
    entry.reach || 0,
    entry.engagements || 0,
  ]);

  // Add summary section
  const summaryRows = [
    [],
    ["Summary"],
    ["Total Impressions", totals.impressions],
    ["Total Clicks", totals.clicks],
    ["Total Conversions", totals.conversions],
    ["Total Spend (£)", totals.spend.toFixed(2)],
    ["Total Reach", totals.reach],
    ["Total Engagements", totals.engagements],
    [],
    ["Performance Metrics"],
    ["Click-Through Rate (CTR)", `${ctr.toFixed(2)}%`],
    ["Conversion Rate (CVR)", `${cvr.toFixed(2)}%`],
    ["Overall Conversion Rate", `${overallCvr.toFixed(2)}%`],
  ];

  // Combine all rows
  const csvContent = [
    [`Campaign: ${campaignName}`],
    [`Date Range: ${dateRange}`],
    [`Export Date: ${new Date().toLocaleDateString("en-GB")}`],
    [],
    headers,
    ...rows,
    ...summaryRows,
  ]
    .map((row) => row.join(","))
    .join("\n");

  // Download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `${campaignName.replace(/\s+/g, "-")}-analytics-${dateRange.replace(/\s+/g, "-")}-${Date.now()}.csv`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export analytics data to PDF format
 */
export function exportAnalyticsToPDF(options: ExportOptions): void {
  const { campaignName, dateRange, analytics } = options;

  // Calculate totals
  const totals = analytics.reduce(
    (acc, entry) => ({
      impressions: acc.impressions + (entry.impressions || 0),
      clicks: acc.clicks + (entry.clicks || 0),
      conversions: acc.conversions + (entry.conversions || 0),
      spend: acc.spend + (entry.spend || 0),
      reach: acc.reach + (entry.reach || 0),
      engagements: acc.engagements + (entry.engagements || 0),
    }),
    { impressions: 0, clicks: 0, conversions: 0, spend: 0, reach: 0, engagements: 0 }
  );

  // Calculate rates
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
  const overallCvr = totals.impressions > 0 ? (totals.conversions / totals.impressions) * 100 : 0;

  // Build HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Campaign Analytics Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #0f766e;
      border-bottom: 3px solid #0f766e;
      padding-bottom: 10px;
    }
    h2 {
      color: #0f766e;
      margin-top: 30px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .header-info {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .header-info p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #0f766e;
      color: white;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f9fafb;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .summary-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      font-weight: normal;
    }
    .summary-card p {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      color: #0f766e;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Campaign Analytics Report</h1>
  
  <div class="header-info">
    <p><strong>Campaign:</strong> ${campaignName}</p>
    <p><strong>Date Range:</strong> ${dateRange}</p>
    <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</p>
    <p><strong>Total Data Points:</strong> ${analytics.length}</p>
  </div>

  <h2>Performance Summary</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <h3>Total Impressions</h3>
      <p>${totals.impressions.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>Total Clicks</h3>
      <p>${totals.clicks.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>Total Conversions</h3>
      <p>${totals.conversions.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>Total Spend</h3>
      <p>£${totals.spend.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>Total Reach</h3>
      <p>${totals.reach.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>Total Engagements</h3>
      <p>${totals.engagements.toLocaleString()}</p>
    </div>
  </div>

  <h2>Conversion Metrics</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <h3>Click-Through Rate (CTR)</h3>
      <p>${ctr.toFixed(2)}%</p>
    </div>
    <div class="summary-card">
      <h3>Conversion Rate (CVR)</h3>
      <p>${cvr.toFixed(2)}%</p>
    </div>
    <div class="summary-card">
      <h3>Overall Conversion</h3>
      <p>${overallCvr.toFixed(2)}%</p>
    </div>
  </div>

  <h2>Daily Performance Data</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Impressions</th>
        <th>Clicks</th>
        <th>Conversions</th>
        <th>Spend (£)</th>
        <th>Reach</th>
        <th>Engagements</th>
      </tr>
    </thead>
    <tbody>
      ${analytics
        .map(
          (entry) => `
        <tr>
          <td>${new Date(entry.date).toLocaleDateString("en-GB")}</td>
          <td>${(entry.impressions || 0).toLocaleString()}</td>
          <td>${(entry.clicks || 0).toLocaleString()}</td>
          <td>${(entry.conversions || 0).toLocaleString()}</td>
          <td>£${(entry.spend || 0).toLocaleString()}</td>
          <td>${(entry.reach || 0).toLocaleString()}</td>
          <td>${(entry.engagements || 0).toLocaleString()}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by UpsurgeIQ - AI-Powered PR & Marketing Platform</p>
  </div>
</body>
</html>
  `;

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF");
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Note: User needs to select "Save as PDF" in print dialog
  };
}
