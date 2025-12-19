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
  budget?: number;
  startDate?: Date;
  endDate?: Date;
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
    doc.text(`£${data.budget.toLocaleString()}`, margin + 30, yPosition);
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
