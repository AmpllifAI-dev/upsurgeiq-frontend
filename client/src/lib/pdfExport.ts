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
