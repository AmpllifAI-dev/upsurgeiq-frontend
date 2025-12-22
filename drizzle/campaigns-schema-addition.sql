-- Email Campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  previewText VARCHAR(255),
  emailTemplate TEXT NOT NULL,
  targetSegmentId INT,
  status ENUM('draft', 'scheduled', 'sending', 'sent', 'failed') DEFAULT 'draft' NOT NULL,
  scheduledAt TIMESTAMP NULL,
  sentAt TIMESTAMP NULL,
  recipientCount INT DEFAULT 0,
  openCount INT DEFAULT 0,
  clickCount INT DEFAULT 0,
  bounceCount INT DEFAULT 0,
  unsubscribeCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduledAt)
);

-- Campaign A/B Test Variants
CREATE TABLE IF NOT EXISTS campaign_ab_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaignId INT NOT NULL,
  variantName VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  emailTemplate TEXT NOT NULL,
  recipientPercentage INT DEFAULT 50,
  sentCount INT DEFAULT 0,
  openCount INT DEFAULT 0,
  clickCount INT DEFAULT 0,
  isWinner INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (campaignId) REFERENCES email_campaigns(id) ON DELETE CASCADE
);
