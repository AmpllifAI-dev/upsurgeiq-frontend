import { jsPDF } from "jspdf";

export interface PressReleaseData {
  title: string;
  subtitle?: string;
  body: string;
  companyName?: string;
  contactInfo?: string;
  date: Date;
}

export function exportPressReleaseToPDF(data: PressReleaseData) {
  const doc = new jsPDF();
  
  // Set up colors
  const tealColor = [0, 128, 128] as [number, number, number];
  const limeColor = [127, 255, 0] as [number, number, number];
  const darkGray = [51, 51, 51] as [number, number, number];
  const lightGray = [128, 128, 128] as [number, number, number];
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add upsurgeIQ branding header
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("upsurgeIQ", margin, 10);
  
  yPosition = 30;
  
  // Add date
  doc.setTextColor(...lightGray);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date(data.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(dateStr, margin, yPosition);
  yPosition += 15;
  
  // Add title
  doc.setTextColor(...darkGray);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(data.title, contentWidth);
  doc.text(titleLines, margin, yPosition);
  yPosition += (titleLines.length * 10) + 10;
  
  // Add subtitle if exists
  if (data.subtitle) {
    doc.setTextColor(...lightGray);
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    const subtitleLines = doc.splitTextToSize(data.subtitle, contentWidth);
    doc.text(subtitleLines, margin, yPosition);
    yPosition += (subtitleLines.length * 8) + 15;
  } else {
    yPosition += 10;
  }
  
  // Add separator line
  doc.setDrawColor(...limeColor);
  doc.setLineWidth(2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Add body text
  doc.setTextColor(...darkGray);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Split body into paragraphs
  const paragraphs = data.body.split('\n\n');
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim()) {
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
      
      // Check if we need a new page
      if (yPosition + (lines.length * 6) > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(lines, margin, yPosition);
      yPosition += (lines.length * 6) + 8;
    }
  }
  
  // Add footer with company info if provided
  if (data.companyName || data.contactInfo) {
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY - 5, pageWidth, 40, 'F');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    let footerYPos = footerY;
    
    if (data.companyName) {
      doc.text(data.companyName, margin, footerYPos);
      footerYPos += 6;
    }
    
    if (data.contactInfo) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...lightGray);
      const contactLines = doc.splitTextToSize(data.contactInfo, contentWidth);
      doc.text(contactLines, margin, footerYPos);
    }
  }
  
  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(...lightGray);
    doc.setFontSize(9);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Generate filename
  const filename = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateStr.replace(/\s/g, '_')}.pdf`;
  
  // Download the PDF
  doc.save(filename);
}


export interface CampaignData {
  name: string;
  status: string;
  goal?: string;
  budget?: string; // Decimal from database
  startDate?: string; // Date string from database
  endDate?: string; // Date string from database
  createdAt: Date;
}

export function exportCampaignToPDF(data: CampaignData) {
  const doc = new jsPDF();
  
  // Set up colors
  const tealColor = [0, 128, 128] as [number, number, number];
  const limeColor = [127, 255, 0] as [number, number, number];
  const darkGray = [51, 51, 51] as [number, number, number];
  const lightGray = [128, 128, 128] as [number, number, number];
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add upsurgeIQ branding header
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("upsurgeIQ", margin, 10);
  
  yPosition = 30;
  
  // Add report title
  doc.setTextColor(...darkGray);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Report", margin, yPosition);
  yPosition += 15;
  
  // Add campaign name
  doc.setFontSize(16);
  doc.setTextColor(...tealColor);
  const nameLines = doc.splitTextToSize(data.name, contentWidth);
  doc.text(nameLines, margin, yPosition);
  yPosition += (nameLines.length * 8) + 10;
  
  // Add separator line
  doc.setDrawColor(...limeColor);
  doc.setLineWidth(2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Add campaign details
  doc.setTextColor(...darkGray);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Status
  doc.setFont("helvetica", "bold");
  doc.text("Status:", margin, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.status.toUpperCase(), margin + 30, yPosition);
  yPosition += 8;
  
  // Created date
  doc.setFont("helvetica", "bold");
  doc.text("Created:", margin, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(data.createdAt).toLocaleDateString('en-GB'), margin + 30, yPosition);
  yPosition += 8;
  
  // Start date
  if (data.startDate) {
    doc.setFont("helvetica", "bold");
    doc.text("Start Date:", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(data.startDate).toLocaleDateString('en-GB'), margin + 30, yPosition);
    yPosition += 8;
  }
  
  // End date
  if (data.endDate) {
    doc.setFont("helvetica", "bold");
    doc.text("End Date:", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(data.endDate).toLocaleDateString('en-GB'), margin + 30, yPosition);
    yPosition += 8;
  }
  
  // Budget
  if (data.budget) {
    doc.setFont("helvetica", "bold");
    doc.text("Budget:", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(`£${parseFloat(data.budget).toLocaleString()}`, margin + 30, yPosition);
    yPosition += 8;
  }
  
  yPosition += 10;
  
  // Campaign goal
  if (data.goal) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Campaign Goal", margin, yPosition);
    yPosition += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const goalLines = doc.splitTextToSize(data.goal, contentWidth);
    doc.text(goalLines, margin, yPosition);
    yPosition += (goalLines.length * 6) + 15;
  }
  
  // Performance metrics section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Performance Metrics", margin, yPosition);
  yPosition += 10;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...lightGray);
  doc.text("Performance tracking coming soon...", margin, yPosition);
  
  // Add footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setTextColor(...lightGray);
  doc.setFontSize(9);
  const generatedText = `Generated by upsurgeIQ on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`;
  doc.text(generatedText, pageWidth / 2, footerY, { align: 'center' });
  
  // Generate filename
  const filename = `campaign-report-${data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Download the PDF
  doc.save(filename);
}


export interface PressReleasePerformanceData {
  pressRelease: {
    id: number;
    title: string;
    createdAt: Date;
  };
  engagement: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
    totalOpenCount: number;
    totalClickCount: number;
    distributions: any[];
  };
}

export function exportPressReleasePerformanceToPDF(data: PressReleasePerformanceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Set up colors
  const tealColor = [0, 128, 128] as [number, number, number];
  const limeColor = [127, 255, 0] as [number, number, number];
  const darkGray = [51, 51, 51] as [number, number, number];
  const lightGray = [128, 128, 128] as [number, number, number];

  // Add upsurgeIQ branding header
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("upsurgeIQ", margin, 10);
  
  let yPos = 30;

  // Title
  doc.setTextColor(...darkGray);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Press Release Performance Report", margin, yPos);
  yPos += 12;

  // Press Release Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightGray);
  doc.text(`Title: ${data.pressRelease.title}`, margin, yPos);
  yPos += 8;
  doc.text(`Created: ${new Date(data.pressRelease.createdAt).toLocaleDateString()}`, margin, yPos);
  yPos += 15;

  // Add separator line
  doc.setDrawColor(...limeColor);
  doc.setLineWidth(2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Performance Metrics
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...tealColor);
  doc.text("Performance Metrics", margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkGray);
  doc.text(`Total Sent: ${data.engagement.totalSent}`, margin, yPos);
  yPos += 7;
  doc.text(`Total Opened: ${data.engagement.totalOpened} (${data.engagement.openRate.toFixed(1)}%)`, margin, yPos);
  yPos += 7;
  doc.text(`Total Clicked: ${data.engagement.totalClicked} (${data.engagement.clickRate.toFixed(1)}%)`, margin, yPos);
  yPos += 7;
  doc.text(`Total Open Count: ${data.engagement.totalOpenCount}`, margin, yPos);
  yPos += 7;
  doc.text(`Total Click Count: ${data.engagement.totalClickCount}`, margin, yPos);
  yPos += 15;

  // Engagement Score
  const engagementScore = Math.round((data.engagement.openRate + data.engagement.clickRate) / 2);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...tealColor);
  doc.text(`Overall Engagement Score: ${engagementScore}%`, margin, yPos);
  yPos += 15;

  // Top Performers
  if (data.engagement.distributions && data.engagement.distributions.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(...darkGray);
    doc.text("Top Engaged Recipients", margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const topEngaged = data.engagement.distributions
      .filter((d: any) => d.openCount > 0 || d.clickCount > 0)
      .sort((a: any, b: any) => (b.openCount + b.clickCount) - (a.openCount + a.clickCount))
      .slice(0, 15);

    topEngaged.forEach((dist: any, index: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`${index + 1}. ${dist.recipientEmail}`, margin, yPos);
      doc.text(`Opens: ${dist.openCount}, Clicks: ${dist.clickCount}`, margin + 80, yPos);
      yPos += 6;
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setTextColor(...lightGray);
  doc.setFontSize(9);
  const generatedText = `Generated by upsurgeIQ on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`;
  doc.text(generatedText, pageWidth / 2, footerY, { align: 'center' });

  doc.save(`press-release-performance-${data.pressRelease.id}-${Date.now()}.pdf`);
}

/**
 * Export multiple press releases to a single combined PDF
 */
export function exportBulkPressReleasesToPDF(pressReleases: PressReleaseData[]) {
  const doc = new jsPDF();
  
  // Set up colors
  const tealColor = [0, 128, 128] as [number, number, number];
  const limeColor = [127, 255, 0] as [number, number, number];
  const darkGray = [51, 51, 51] as [number, number, number];
  const lightGray = [128, 128, 128] as [number, number, number];
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add cover page
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Press Release Collection", pageWidth / 2, 100, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(`${pressReleases.length} Press Releases`, pageWidth / 2, 120, { align: 'center' });
  
  doc.setFontSize(12);
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(dateStr, pageWidth / 2, 140, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text("Generated by upsurgeIQ", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
  
  // Add each press release
  pressReleases.forEach((pr, index) => {
    doc.addPage();
    let yPosition = 20;
    
    // Add header
    doc.setFillColor(...tealColor);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`upsurgeIQ - Press Release ${index + 1} of ${pressReleases.length}`, margin, 10);
    
    yPosition = 30;
    
    // Add date
    doc.setTextColor(...lightGray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const prDateStr = new Date(pr.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    doc.text(prDateStr, margin, yPosition);
    yPosition += 15;
    
    // Add title
    doc.setTextColor(...darkGray);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(pr.title, contentWidth);
    doc.text(titleLines, margin, yPosition);
    yPosition += (titleLines.length * 8) + 10;
    
    // Add subtitle if exists
    if (pr.subtitle) {
      doc.setTextColor(...lightGray);
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      const subtitleLines = doc.splitTextToSize(pr.subtitle, contentWidth);
      doc.text(subtitleLines, margin, yPosition);
      yPosition += (subtitleLines.length * 7) + 10;
    }
    
    // Add separator line
    doc.setDrawColor(...limeColor);
    doc.setLineWidth(1.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 12;
    
    // Add body text
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Split body into paragraphs
    const paragraphs = pr.body.split('\n\n');
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
        
        // Check if we need a new page
        if (yPosition + (lines.length * 5) > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(lines, margin, yPosition);
        yPosition += (lines.length * 5) + 6;
      }
    }
  });
  
  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i > 1) { // Skip cover page
      doc.setTextColor(...lightGray);
      doc.setFontSize(9);
      doc.text(
        `Page ${i - 1} of ${pageCount - 1}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  }
  
  // Generate filename
  const filename = `press-releases-bulk-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Download the PDF
  doc.save(filename);
}


/**
 * Enhanced Campaign PDF Export with Analytics and Charts
 */
export interface EnhancedCampaignData {
  campaign: {
    name: string;
    status: string;
    goal?: string;
    targetAudience?: string;
    aiGeneratedStrategy?: string;
    keyMessages?: string;
    successMetrics?: string;
    budget?: string;
    startDate?: string;
    endDate?: string;
    createdAt: Date;
  };
  milestones?: Array<{
    title: string;
    status: string;
    dueDate?: string;
  }>;
  deliverables?: Array<{
    title: string;
    type: string;
    status: string;
  }>;
  analytics?: Array<{
    date: Date;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  }>;
}

export function exportEnhancedCampaignToPDF(data: EnhancedCampaignData) {
  const doc = new jsPDF();
  
  // Set up colors
  const tealColor = [0, 128, 128] as [number, number, number];
  const limeColor = [127, 255, 0] as [number, number, number];
  const darkGray = [51, 51, 51] as [number, number, number];
  const lightGray = [128, 128, 128] as [number, number, number];
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add upsurgeIQ branding header
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("UpsurgeIQ", margin, 10);
  
  yPosition = 30;
  
  // Add report title
  doc.setTextColor(...darkGray);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Performance Report", margin, yPosition);
  yPosition += 15;
  
  // Add campaign name
  doc.setFontSize(18);
  doc.setTextColor(...tealColor);
  const nameLines = doc.splitTextToSize(data.campaign.name, contentWidth);
  doc.text(nameLines, margin, yPosition);
  yPosition += (nameLines.length * 8) + 10;
  
  // Add separator line
  doc.setDrawColor(...limeColor);
  doc.setLineWidth(2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Campaign Overview Section
  doc.setTextColor(...darkGray);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Campaign Overview", margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Status
  doc.setFont("helvetica", "bold");
  doc.text("Status:", margin, yPosition);
  doc.setFont("helvetica", "normal");
  const statusColor = data.campaign.status === 'active' ? [0, 200, 0] : lightGray;
  doc.setTextColor(...statusColor);
  doc.text(data.campaign.status.toUpperCase(), margin + 35, yPosition);
  doc.setTextColor(...darkGray);
  yPosition += 7;
  
  // Timeline
  if (data.campaign.startDate && data.campaign.endDate) {
    doc.setFont("helvetica", "bold");
    doc.text("Timeline:", margin, yPosition);
    doc.setFont("helvetica", "normal");
    const startDate = new Date(data.campaign.startDate).toLocaleDateString('en-GB');
    const endDate = new Date(data.campaign.endDate).toLocaleDateString('en-GB');
    doc.text(`${startDate} - ${endDate}`, margin + 35, yPosition);
    yPosition += 7;
  }
  
  // Budget
  if (data.campaign.budget) {
    doc.setFont("helvetica", "bold");
    doc.text("Budget:", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(`£${parseFloat(data.campaign.budget).toLocaleString()}`, margin + 35, yPosition);
    yPosition += 7;
  }
  
  yPosition += 8;
  
  // Campaign Goal
  if (data.campaign.goal) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Campaign Goal", margin, yPosition);
    yPosition += 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const goalLines = doc.splitTextToSize(data.campaign.goal, contentWidth);
    doc.text(goalLines, margin, yPosition);
    yPosition += (goalLines.length * 5) + 10;
  }
  
  // Target Audience
  if (data.campaign.targetAudience) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Target Audience", margin, yPosition);
    yPosition += 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const audienceLines = doc.splitTextToSize(data.campaign.targetAudience, contentWidth);
    doc.text(audienceLines, margin, yPosition);
    yPosition += (audienceLines.length * 5) + 10;
  }
  
  // Check if we need a new page
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }
  
  // AI-Generated Strategy
  if (data.campaign.aiGeneratedStrategy) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("AI-Generated Strategy", margin, yPosition);
    yPosition += 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const strategyLines = doc.splitTextToSize(data.campaign.aiGeneratedStrategy, contentWidth);
    doc.text(strategyLines, margin, yPosition);
    yPosition += (strategyLines.length * 5) + 10;
  }
  
  // Key Messages
  if (data.campaign.keyMessages) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Key Messages", margin, yPosition);
    yPosition += 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const messagesLines = doc.splitTextToSize(data.campaign.keyMessages, contentWidth);
    doc.text(messagesLines, margin, yPosition);
    yPosition += (messagesLines.length * 5) + 10;
  }
  
  // Performance Analytics Section
  if (data.analytics && data.analytics.length > 0) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...tealColor);
    doc.text("Performance Analytics", margin, yPosition);
    yPosition += 10;
    
    // Calculate totals
    const totals = data.analytics.reduce((acc, entry) => ({
      impressions: acc.impressions + entry.impressions,
      clicks: acc.clicks + entry.clicks,
      conversions: acc.conversions + entry.conversions,
      spend: acc.spend + entry.spend,
    }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 });
    
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100).toFixed(2) : '0.00';
    const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks * 100).toFixed(2) : '0.00';
    const cpc = totals.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : '0.00';
    const cpa = totals.conversions > 0 ? (totals.spend / totals.conversions).toFixed(2) : '0.00';
    
    // Create summary boxes
    const boxWidth = (contentWidth - 10) / 2;
    const boxHeight = 25;
    
    // Impressions box
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, boxWidth, boxHeight, 'F');
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Total Impressions", margin + 5, yPosition + 8);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(totals.impressions.toLocaleString(), margin + 5, yPosition + 18);
    
    // Clicks box
    doc.setFillColor(245, 245, 245);
    doc.rect(margin + boxWidth + 10, yPosition, boxWidth, boxHeight, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Total Clicks", margin + boxWidth + 15, yPosition + 8);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(totals.clicks.toLocaleString(), margin + boxWidth + 15, yPosition + 18);
    
    yPosition += boxHeight + 5;
    
    // Conversions box
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, boxWidth, boxHeight, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Total Conversions", margin + 5, yPosition + 8);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(totals.conversions.toLocaleString(), margin + 5, yPosition + 18);
    
    // Spend box
    doc.setFillColor(245, 245, 245);
    doc.rect(margin + boxWidth + 10, yPosition, boxWidth, boxHeight, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Total Spend", margin + boxWidth + 15, yPosition + 8);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`£${totals.spend.toLocaleString()}`, margin + boxWidth + 15, yPosition + 18);
    
    yPosition += boxHeight + 10;
    
    // Key Metrics
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkGray);
    doc.text(`Click-Through Rate (CTR): ${ctr}%`, margin, yPosition);
    yPosition += 6;
    doc.text(`Conversion Rate (CVR): ${cvr}%`, margin, yPosition);
    yPosition += 6;
    doc.text(`Cost Per Click (CPC): £${cpc}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Cost Per Acquisition (CPA): £${cpa}`, margin, yPosition);
    yPosition += 15;
  }
  
  // Milestones Section
  if (data.milestones && data.milestones.length > 0) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...tealColor);
    doc.text("Campaign Milestones", margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkGray);
    
    data.milestones.forEach((milestone, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const statusSymbol = milestone.status === 'completed' ? '✓' : 
                          milestone.status === 'in_progress' ? '◐' : '○';
      
      doc.text(`${statusSymbol} ${milestone.title}`, margin + 5, yPosition);
      if (milestone.dueDate) {
        doc.setTextColor(...lightGray);
        doc.text(`Due: ${new Date(milestone.dueDate).toLocaleDateString('en-GB')}`, margin + 100, yPosition);
        doc.setTextColor(...darkGray);
      }
      yPosition += 6;
    });
    
    yPosition += 10;
  }
  
  // Deliverables Section
  if (data.deliverables && data.deliverables.length > 0) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...tealColor);
    doc.text("Campaign Deliverables", margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkGray);
    
    data.deliverables.forEach((deliverable) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const statusSymbol = deliverable.status === 'completed' ? '✓' : 
                          deliverable.status === 'in_progress' ? '◐' : '○';
      
      doc.text(`${statusSymbol} ${deliverable.title}`, margin + 5, yPosition);
      doc.setTextColor(...lightGray);
      doc.text(`[${deliverable.type}]`, margin + 100, yPosition);
      doc.setTextColor(...darkGray);
      yPosition += 6;
    });
  }
  
  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setTextColor(...lightGray);
    doc.setFontSize(9);
    const generatedText = `Generated by UpsurgeIQ on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`;
    doc.text(generatedText, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
  }
  
  // Generate filename
  const filename = `campaign-report-${data.campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Download the PDF
  doc.save(filename);
}
