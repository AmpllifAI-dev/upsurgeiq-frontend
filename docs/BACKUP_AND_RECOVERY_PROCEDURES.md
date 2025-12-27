# UpsurgeIQ Backup and Recovery Procedures

**Version:** 1.0  
**Last Updated:** December 26, 2025  
**Purpose:** Ensure data safety and quick recovery from disasters

---

## Overview

This document outlines backup strategies, recovery procedures, and disaster recovery plans for UpsurgeIQ production environment.

---

## 1. Database Backup Strategy

### Backup Schedule

**Daily Backups:**
- **Frequency:** Every day at 2:00 AM UTC
- **Retention:** Keep for 30 days
- **Type:** Full database dump
- **Storage:** Encrypted cloud storage (AWS S3, Google Cloud Storage, or similar)

**Weekly Backups:**
- **Frequency:** Every Sunday at 3:00 AM UTC
- **Retention:** Keep for 90 days
- **Type:** Full database dump with transaction logs
- **Storage:** Encrypted cloud storage + offline backup

**Monthly Backups:**
- **Frequency:** First day of month at 4:00 AM UTC
- **Retention:** Keep for 1 year
- **Type:** Full database dump
- **Storage:** Encrypted cloud storage + offline backup

### Automated Backup Script

**Create `scripts/backup-database.sh`:**

```bash
#!/bin/bash

# Database Backup Script for UpsurgeIQ
# Usage: ./scripts/backup-database.sh [daily|weekly|monthly]

set -e  # Exit on error

# Configuration
BACKUP_TYPE=${1:-daily}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/upsurgeiq"
BACKUP_FILE="upsurgeiq_${BACKUP_TYPE}_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Database credentials (from environment)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-upsurgeiq}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD}

# S3 configuration (optional)
S3_BUCKET=${S3_BUCKET:-upsurgeiq-backups}
S3_REGION=${S3_REGION:-us-east-1}

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "========================================="
echo "UpsurgeIQ Database Backup"
echo "========================================="
echo "Type: ${BACKUP_TYPE}"
echo "Timestamp: ${TIMESTAMP}"
echo "Database: ${DB_NAME}"
echo "========================================="

# Create backup
echo "Creating database backup..."
mysqldump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --quick \
  --lock-tables=false \
  "${DB_NAME}" > "${BACKUP_PATH}"

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully: ${BACKUP_PATH}"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Compress backup
echo "Compressing backup..."
gzip "${BACKUP_PATH}"
BACKUP_PATH="${BACKUP_PATH}.gz"

if [ $? -eq 0 ]; then
  echo "✅ Backup compressed: ${BACKUP_PATH}"
else
  echo "❌ Compression failed!"
  exit 1
fi

# Calculate checksum
CHECKSUM=$(sha256sum "${BACKUP_PATH}" | awk '{print $1}')
echo "${CHECKSUM}" > "${BACKUP_PATH}.sha256"
echo "Checksum: ${CHECKSUM}"

# Upload to S3 (if configured)
if [ -n "${S3_BUCKET}" ]; then
  echo "Uploading to S3..."
  aws s3 cp "${BACKUP_PATH}" "s3://${S3_BUCKET}/${BACKUP_TYPE}/" --region "${S3_REGION}"
  aws s3 cp "${BACKUP_PATH}.sha256" "s3://${S3_BUCKET}/${BACKUP_TYPE}/" --region "${S3_REGION}"
  
  if [ $? -eq 0 ]; then
    echo "✅ Backup uploaded to S3"
  else
    echo "⚠️  S3 upload failed, but local backup is safe"
  fi
fi

# Get backup size
BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
echo "Backup size: ${BACKUP_SIZE}"

# Clean up old backups based on retention policy
echo "Cleaning up old backups..."

case ${BACKUP_TYPE} in
  daily)
    # Keep last 30 daily backups
    find "${BACKUP_DIR}" -name "upsurgeiq_daily_*.sql.gz" -mtime +30 -delete
    ;;
  weekly)
    # Keep last 12 weekly backups (90 days)
    find "${BACKUP_DIR}" -name "upsurgeiq_weekly_*.sql.gz" -mtime +90 -delete
    ;;
  monthly)
    # Keep last 12 monthly backups (1 year)
    find "${BACKUP_DIR}" -name "upsurgeiq_monthly_*.sql.gz" -mtime +365 -delete
    ;;
esac

echo "✅ Old backups cleaned up"

# Send notification (optional)
if [ -n "${SLACK_WEBHOOK_URL}" ]; then
  curl -X POST "${SLACK_WEBHOOK_URL}" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"✅ UpsurgeIQ ${BACKUP_TYPE} backup completed: ${BACKUP_SIZE}\"}"
fi

echo "========================================="
echo "Backup completed successfully!"
echo "========================================="
```

**Make script executable:**

```bash
chmod +x scripts/backup-database.sh
```

### Cron Job Configuration

**Add to crontab:**

```bash
# Edit crontab
crontab -e

# Add backup jobs
# Daily backup at 2:00 AM UTC
0 2 * * * /var/www/upsurgeiq/scripts/backup-database.sh daily >> /var/log/upsurgeiq/backup.log 2>&1

# Weekly backup at 3:00 AM UTC on Sundays
0 3 * * 0 /var/www/upsurgeiq/scripts/backup-database.sh weekly >> /var/log/upsurgeiq/backup.log 2>&1

# Monthly backup at 4:00 AM UTC on the 1st
0 4 1 * * /var/www/upsurgeiq/scripts/backup-database.sh monthly >> /var/log/upsurgeiq/backup.log 2>&1
```

---

## 2. Backup Verification

### Automated Verification Script

**Create `scripts/verify-backup.sh`:**

```bash
#!/bin/bash

# Backup Verification Script
# Usage: ./scripts/verify-backup.sh <backup_file>

set -e

BACKUP_FILE=$1

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "========================================="
echo "Verifying Backup: ${BACKUP_FILE}"
echo "========================================="

# Verify checksum
if [ -f "${BACKUP_FILE}.sha256" ]; then
  echo "Verifying checksum..."
  EXPECTED_CHECKSUM=$(cat "${BACKUP_FILE}.sha256")
  ACTUAL_CHECKSUM=$(sha256sum "${BACKUP_FILE}" | awk '{print $1}')
  
  if [ "${EXPECTED_CHECKSUM}" = "${ACTUAL_CHECKSUM}" ]; then
    echo "✅ Checksum verified"
  else
    echo "❌ Checksum mismatch!"
    echo "Expected: ${EXPECTED_CHECKSUM}"
    echo "Actual: ${ACTUAL_CHECKSUM}"
    exit 1
  fi
else
  echo "⚠️  No checksum file found, skipping verification"
fi

# Test decompression
echo "Testing decompression..."
gunzip -t "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "✅ Backup file is valid"
else
  echo "❌ Backup file is corrupted!"
  exit 1
fi

# Test SQL syntax (optional, requires temp database)
if [ -n "${TEST_DB_NAME}" ]; then
  echo "Testing SQL syntax..."
  
  # Create temporary test database
  mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" \
    -e "CREATE DATABASE IF NOT EXISTS ${TEST_DB_NAME}"
  
  # Restore to test database
  gunzip -c "${BACKUP_FILE}" | mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${TEST_DB_NAME}"
  
  if [ $? -eq 0 ]; then
    echo "✅ Backup can be restored successfully"
    
    # Clean up test database
    mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" \
      -e "DROP DATABASE ${TEST_DB_NAME}"
  else
    echo "❌ Backup restoration failed!"
    exit 1
  fi
fi

echo "========================================="
echo "✅ Backup verification completed"
echo "========================================="
```

### Weekly Verification

**Add to crontab:**

```bash
# Verify last daily backup every Monday at 9:00 AM
0 9 * * 1 /var/www/upsurgeiq/scripts/verify-backup.sh $(ls -t /backups/upsurgeiq/upsurgeiq_daily_*.sql.gz | head -1) >> /var/log/upsurgeiq/backup-verify.log 2>&1
```

---

## 3. Database Restoration Procedures

### Full Database Restoration

**Create `scripts/restore-database.sh`:**

```bash
#!/bin/bash

# Database Restoration Script
# Usage: ./scripts/restore-database.sh <backup_file>

set -e

BACKUP_FILE=$1

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "========================================="
echo "⚠️  DATABASE RESTORATION WARNING"
echo "========================================="
echo "This will REPLACE the current database!"
echo "Backup file: ${BACKUP_FILE}"
echo "Database: ${DB_NAME}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
  echo "Restoration cancelled"
  exit 0
fi

echo "========================================="
echo "Starting database restoration..."
echo "========================================="

# Verify backup integrity first
echo "Verifying backup integrity..."
./scripts/verify-backup.sh "${BACKUP_FILE}"

# Stop application to prevent writes during restoration
echo "Stopping application..."
pm2 stop upsurgeiq || true
sudo systemctl stop upsurgeiq || true

# Create backup of current database before restoration
CURRENT_BACKUP="/backups/upsurgeiq/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
echo "Creating backup of current database: ${CURRENT_BACKUP}"
mysqldump \
  --host="${DB_HOST}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  --single-transaction \
  "${DB_NAME}" | gzip > "${CURRENT_BACKUP}"

echo "✅ Current database backed up"

# Drop and recreate database
echo "Dropping current database..."
mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" \
  -e "DROP DATABASE IF EXISTS ${DB_NAME}"

echo "Creating fresh database..."
mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" \
  -e "CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# Restore from backup
echo "Restoring database from backup..."
gunzip -c "${BACKUP_FILE}" | mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}"

if [ $? -eq 0 ]; then
  echo "✅ Database restored successfully"
else
  echo "❌ Database restoration failed!"
  echo "Attempting to restore from pre-restoration backup..."
  
  gunzip -c "${CURRENT_BACKUP}" | mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}"
  
  if [ $? -eq 0 ]; then
    echo "✅ Rolled back to pre-restoration state"
  else
    echo "❌ Rollback failed! Manual intervention required!"
  fi
  
  exit 1
fi

# Verify restoration
echo "Verifying restoration..."
TABLE_COUNT=$(mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SHOW TABLES" | wc -l)
echo "Tables found: ${TABLE_COUNT}"

if [ "${TABLE_COUNT}" -lt 10 ]; then
  echo "⚠️  Warning: Low table count, restoration may be incomplete"
fi

# Restart application
echo "Restarting application..."
pm2 start upsurgeiq || sudo systemctl start upsurgeiq

echo "========================================="
echo "✅ Database restoration completed"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify application is running correctly"
echo "2. Test critical functionality"
echo "3. Monitor logs for errors"
echo "4. If issues occur, rollback using: ${CURRENT_BACKUP}"
```

### Point-in-Time Recovery (if using MySQL binary logs)

**Enable binary logging in MySQL:**

```sql
-- Add to my.cnf
[mysqld]
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
expire_logs_days = 7
```

**Restore to specific point in time:**

```bash
# 1. Restore from last full backup
gunzip -c backup.sql.gz | mysql -u root -p database_name

# 2. Apply binary logs up to specific time
mysqlbinlog --stop-datetime="2025-12-26 14:30:00" \
  /var/log/mysql/mysql-bin.000001 \
  /var/log/mysql/mysql-bin.000002 \
  | mysql -u root -p database_name
```

---

## 4. File System Backups

### Application Code Backup

**Git repository is the primary backup for code**

- All code changes committed to Git
- Repository hosted on GitHub/GitLab with redundancy
- Tags created for each production release

**Additional file system backup:**

```bash
# Backup uploaded files (if any)
tar -czf uploads_$(date +%Y%m%d).tar.gz /var/www/upsurgeiq/uploads/

# Upload to S3
aws s3 cp uploads_$(date +%Y%m%d).tar.gz s3://upsurgeiq-backups/uploads/
```

---

## 5. Disaster Recovery Plan

### Disaster Scenarios

**Scenario 1: Database Corruption**

**Symptoms:**
- Database queries failing
- Data inconsistencies
- Table corruption errors

**Recovery Steps:**
1. Stop application immediately
2. Identify last known good backup
3. Restore database from backup
4. Verify data integrity
5. Restart application
6. Monitor for issues

**Estimated Recovery Time:** 30 minutes - 2 hours

---

**Scenario 2: Complete Server Failure**

**Symptoms:**
- Server unresponsive
- Cannot SSH into server
- Application completely down

**Recovery Steps:**
1. Provision new server
2. Install dependencies (Node.js, MySQL, etc.)
3. Clone Git repository
4. Restore database from latest backup
5. Configure environment variables
6. Build and start application
7. Update DNS if needed
8. Verify functionality

**Estimated Recovery Time:** 2-4 hours

---

**Scenario 3: Data Loss (Accidental Deletion)**

**Symptoms:**
- Users report missing data
- Records deleted accidentally
- Need to recover specific data

**Recovery Steps:**
1. Identify when data was last present
2. Find backup from before deletion
3. Restore to temporary database
4. Extract specific data needed
5. Import into production database
6. Verify data integrity

**Estimated Recovery Time:** 1-3 hours

---

**Scenario 4: Ransomware Attack**

**Symptoms:**
- Files encrypted
- Ransom note present
- System compromised

**Recovery Steps:**
1. **DO NOT pay ransom**
2. Isolate infected systems immediately
3. Notify security team and authorities
4. Provision clean server
5. Restore from known clean backup (before infection)
6. Change all passwords and API keys
7. Audit security and patch vulnerabilities
8. Monitor for re-infection

**Estimated Recovery Time:** 4-8 hours

---

## 6. Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)

### Definitions

- **RTO (Recovery Time Objective):** Maximum acceptable time to restore service
- **RPO (Recovery Point Objective):** Maximum acceptable data loss (time between backups)

### UpsurgeIQ Targets

**Critical Services:**
- **RTO:** 2 hours
- **RPO:** 24 hours (daily backups)

**Non-Critical Services:**
- **RTO:** 4 hours
- **RPO:** 7 days (weekly backups)

### Meeting RTO/RPO

**To achieve RTO:**
- Maintain runbooks for common scenarios
- Practice disaster recovery procedures quarterly
- Keep infrastructure as code (IaC) for quick provisioning
- Have monitoring and alerting in place

**To achieve RPO:**
- Daily automated backups
- Verify backups weekly
- Store backups in multiple locations
- Consider more frequent backups for critical data

---

## 7. Backup Storage Locations

### Primary Storage

**AWS S3 (Recommended):**

```bash
# Configure AWS CLI
aws configure

# Create backup bucket
aws s3 mb s3://upsurgeiq-backups --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket upsurgeiq-backups \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket upsurgeiq-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Set lifecycle policy (auto-delete old backups)
aws s3api put-bucket-lifecycle-configuration \
  --bucket upsurgeiq-backups \
  --lifecycle-configuration file://s3-lifecycle.json
```

**s3-lifecycle.json:**

```json
{
  "Rules": [
    {
      "Id": "DeleteOldDailyBackups",
      "Status": "Enabled",
      "Prefix": "daily/",
      "Expiration": {
        "Days": 30
      }
    },
    {
      "Id": "DeleteOldWeeklyBackups",
      "Status": "Enabled",
      "Prefix": "weekly/",
      "Expiration": {
        "Days": 90
      }
    },
    {
      "Id": "DeleteOldMonthlyBackups",
      "Status": "Enabled",
      "Prefix": "monthly/",
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

### Secondary Storage (Redundancy)

**Google Cloud Storage or Azure Blob Storage:**

- Configure cross-cloud replication for critical backups
- Protects against single cloud provider outage
- Monthly backups should be replicated

### Offline Storage (Optional)

**For compliance or extra safety:**

- Download monthly backups to external hard drive
- Store in secure, off-site location
- Test restoration from offline backup annually

---

## 8. Backup Testing Schedule

### Monthly Backup Test

**First Monday of each month:**

1. Select random backup from previous month
2. Restore to test environment
3. Verify data integrity
4. Test application functionality
5. Document results

### Quarterly Disaster Recovery Drill

**Every 3 months:**

1. Simulate complete server failure
2. Provision new server from scratch
3. Restore from backup
4. Measure recovery time
5. Identify improvements
6. Update procedures

---

## 9. Backup Monitoring and Alerts

### Backup Success Monitoring

**Create `scripts/monitor-backups.sh`:**

```bash
#!/bin/bash

# Check if backup ran successfully today
LATEST_BACKUP=$(ls -t /backups/upsurgeiq/upsurgeiq_daily_*.sql.gz | head -1)
BACKUP_DATE=$(stat -c %Y "${LATEST_BACKUP}")
CURRENT_DATE=$(date +%s)
AGE=$((CURRENT_DATE - BACKUP_DATE))

# Alert if backup is older than 26 hours
if [ ${AGE} -gt 93600 ]; then
  echo "❌ Backup is too old! Last backup: $(date -d @${BACKUP_DATE})"
  
  # Send alert email
  echo "Last backup is more than 26 hours old" | \
    mail -s "UpsurgeIQ Backup Alert" christopher@upsurgeiq.com
  
  exit 1
else
  echo "✅ Backup is current"
fi
```

**Add to crontab:**

```bash
# Check backup status daily at 10:00 AM
0 10 * * * /var/www/upsurgeiq/scripts/monitor-backups.sh >> /var/log/upsurgeiq/backup-monitor.log 2>&1
```

---

## 10. Backup Checklist

### Daily

- [ ] Automated backup runs successfully
- [ ] Backup uploaded to S3
- [ ] Backup size is reasonable (not 0 bytes)
- [ ] No errors in backup log

### Weekly

- [ ] Verify last daily backup integrity
- [ ] Check backup storage usage
- [ ] Review backup logs for errors

### Monthly

- [ ] Test restoration from backup
- [ ] Verify all backups are accessible
- [ ] Check S3 lifecycle policies
- [ ] Review and update procedures

### Quarterly

- [ ] Full disaster recovery drill
- [ ] Test restoration to new server
- [ ] Measure recovery time
- [ ] Update documentation

---

## Environment Variables Required

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=upsurgeiq
DB_USER=backup_user
DB_PASSWORD=secure_password

# S3 (Optional)
S3_BUCKET=upsurgeiq-backups
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Next Review:** After first disaster recovery drill