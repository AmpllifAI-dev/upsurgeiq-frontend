# UpsurgeIQ Post-Launch Monitoring Checklist

**Version:** 1.0  
**Last Updated:** December 26, 2025  
**Purpose:** Ensure smooth operation after production launch

---

## Launch Day (Day 0)

### Hour 1-2 After Launch

- [ ] **Verify application is accessible**
  - Visit https://upsurgeiq.com
  - Check homepage loads correctly
  - Verify SSL certificate is valid

- [ ] **Test critical user flows**
  - Create new account
  - Login with existing account
  - Create press release
  - Navigate all main pages

- [ ] **Check error logs**
  ```bash
  # Check for errors in last hour
  tail -100 /var/log/upsurgeiq/error.log | grep -i error
  
  # Check Sentry dashboard
  # Visit: https://sentry.io/organizations/upsurgeiq/issues/
  ```

- [ ] **Monitor database connections**
  ```bash
  # Check active connections
  mysql -e "SHOW PROCESSLIST"
  
  # Check connection pool usage
  # Review application logs for connection warnings
  ```

- [ ] **Verify Stripe integration**
  - Test subscription purchase with test card
  - Check webhook is receiving events
  - Verify payment appears in Stripe dashboard

- [ ] **Check email delivery**
  - Create test account
  - Verify welcome email received
  - Check SendGrid dashboard for delivery rate

- [ ] **Monitor API response times**
  ```bash
  # Check average response time
  curl -w "@curl-format.txt" -o /dev/null -s https://upsurgeiq.com/api/health
  ```

### Hour 3-6 After Launch

- [ ] **Review all error logs**
  - Check for any recurring errors
  - Investigate and fix critical issues
  - Document any workarounds

- [ ] **Monitor user registrations**
  ```sql
  SELECT COUNT(*) as new_users 
  FROM users 
  WHERE created_at > NOW() - INTERVAL 6 HOUR;
  ```

- [ ] **Check subscription conversions**
  ```sql
  SELECT COUNT(*) as new_subscriptions 
  FROM subscriptions 
  WHERE created_at > NOW() - INTERVAL 6 HOUR;
  ```

- [ ] **Monitor credit usage**
  ```sql
  SELECT feature_type, COUNT(*) as usage_count 
  FROM credit_usage 
  WHERE created_at > NOW() - INTERVAL 6 HOUR 
  GROUP BY feature_type;
  ```

- [ ] **Review performance metrics**
  - Check Sentry performance dashboard
  - Identify any slow endpoints
  - Review database slow query log

- [ ] **Verify scheduled jobs ran**
  ```bash
  # Check job logs
  grep "UsageNotificationsJob" /var/log/upsurgeiq/app.log | tail -20
  ```

### Hour 6-24 After Launch

- [ ] **Monitor system resources**
  ```bash
  # Check CPU usage
  top -bn1 | grep "Cpu(s)"
  
  # Check memory usage
  free -h
  
  # Check disk space
  df -h
  ```

- [ ] **Review all user feedback**
  - Check support emails
  - Review in-app feedback
  - Monitor social media mentions

- [ ] **Analyze user behavior**
  - Which features are most used?
  - Where are users dropping off?
  - Any unexpected usage patterns?

- [ ] **Check backup ran successfully**
  ```bash
  # Verify daily backup
  ls -lh /backups/upsurgeiq/ | grep $(date +%Y%m%d)
  ```

- [ ] **Review security logs**
  - Check for unusual login attempts
  - Monitor for suspicious API activity
  - Verify no security alerts

- [ ] **Send launch day report**
  - Total users registered
  - Total subscriptions
  - Any critical issues encountered
  - Resolution status

---

## Week 1 (Days 1-7)

### Daily Tasks

- [ ] **Morning health check (9 AM)**
  - Run automated health check script
  - Review overnight error logs
  - Check database performance
  - Verify backups completed

- [ ] **Midday check (1 PM)**
  - Monitor active users
  - Check API response times
  - Review any support tickets
  - Monitor credit usage patterns

- [ ] **Evening check (6 PM)**
  - Review day's error logs
  - Check subscription conversions
  - Monitor system resources
  - Prepare next day's plan

### Metrics to Track Daily

**User Metrics:**
- [ ] New user registrations
- [ ] Active users (DAU)
- [ ] User retention rate
- [ ] Subscription conversion rate

**Technical Metrics:**
- [ ] Error rate (should be < 1%)
- [ ] Average API response time (should be < 1s)
- [ ] Database query performance
- [ ] System uptime (should be 99.9%+)

**Business Metrics:**
- [ ] Revenue (new subscriptions)
- [ ] Churn rate
- [ ] Credit usage per user
- [ ] Support ticket volume

### Weekly Review (End of Week 1)

- [ ] **Analyze week's performance**
  - Total users: _____
  - Total subscriptions: _____
  - Total revenue: £_____
  - Average response time: _____ ms
  - Error rate: _____%
  - Uptime: _____%

- [ ] **Identify top issues**
  - List top 5 errors by frequency
  - List top 5 user complaints
  - List top 5 feature requests

- [ ] **Plan improvements**
  - Prioritize bug fixes
  - Schedule performance optimizations
  - Plan feature enhancements

- [ ] **Update documentation**
  - Document any workarounds
  - Update known issues list
  - Improve user guides based on feedback

---

## Month 1 (Weeks 1-4)

### Weekly Tasks

- [ ] **Monday: Week planning**
  - Review previous week's metrics
  - Set goals for current week
  - Prioritize tasks

- [ ] **Wednesday: Mid-week check**
  - Review progress on goals
  - Address any blockers
  - Adjust priorities if needed

- [ ] **Friday: Week wrap-up**
  - Compile weekly metrics
  - Send weekly report
  - Plan next week

### Monthly Review (End of Month 1)

- [ ] **User Growth Analysis**
  - Total users: _____
  - Growth rate: _____%
  - Churn rate: _____%
  - Average revenue per user: £_____

- [ ] **Technical Performance**
  - Average uptime: _____%
  - Average response time: _____ ms
  - Total errors: _____
  - Database performance: _____

- [ ] **Feature Usage**
  - Most used features: _____
  - Least used features: _____
  - Feature adoption rate: _____%

- [ ] **Support Analysis**
  - Total support tickets: _____
  - Average resolution time: _____ hours
  - Customer satisfaction: _____%

- [ ] **Financial Performance**
  - Total revenue: £_____
  - Cost per acquisition: £_____
  - Lifetime value: £_____
  - Profit margin: _____%

---

## Ongoing Monitoring (After Month 1)

### Daily Automated Checks

**Setup automated monitoring scripts:**

```bash
#!/bin/bash
# daily-health-check.sh

echo "UpsurgeIQ Daily Health Check - $(date)"
echo "========================================"

# 1. Application health
echo "1. Application Health:"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://upsurgeiq.com/api/health)
if [ "$HEALTH" -eq 200 ]; then
  echo "   ✅ Application is healthy"
else
  echo "   ❌ Application health check failed (HTTP $HEALTH)"
fi

# 2. Database health
echo "2. Database Health:"
DB_CHECK=$(mysql -e "SELECT 1" 2>&1)
if [ $? -eq 0 ]; then
  echo "   ✅ Database is accessible"
else
  echo "   ❌ Database connection failed"
fi

# 3. Error rate
echo "3. Error Rate (last 24 hours):"
ERROR_COUNT=$(grep -c "ERROR" /var/log/upsurgeiq/error.log)
echo "   Total errors: $ERROR_COUNT"

# 4. New users
echo "4. New Users (last 24 hours):"
NEW_USERS=$(mysql -e "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL 24 HOUR" -sN)
echo "   New registrations: $NEW_USERS"

# 5. System resources
echo "5. System Resources:"
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
MEM=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
DISK=$(df -h / | awk 'NR==2 {print $5}')
echo "   CPU usage: $CPU%"
echo "   Memory usage: ${MEM}%"
echo "   Disk usage: $DISK"

echo "========================================"
```

**Schedule daily health check:**

```bash
# Add to crontab
0 9 * * * /var/www/upsurgeiq/scripts/daily-health-check.sh | mail -s "UpsurgeIQ Daily Health Report" christopher@upsurgeiq.com
```

---

## Alert Thresholds

### Critical Alerts (Immediate Action)

- ❌ Application down (health check fails)
- ❌ Database connection lost
- ❌ Error rate > 5%
- ❌ Disk space < 10%
- ❌ Memory usage > 90%

### Warning Alerts (Monitor Closely)

- ⚠️ Error rate > 1%
- ⚠️ Average response time > 2 seconds
- ⚠️ Disk space < 20%
- ⚠️ Memory usage > 80%
- ⚠️ Backup failed

### Info Alerts (Track Trends)

- ℹ️ New user registrations spike
- ℹ️ Unusual credit usage patterns
- ℹ️ High support ticket volume
- ℹ️ Slow query detected

---

## Incident Response

### When Alert is Triggered

1. **Acknowledge alert** (within 5 minutes)
2. **Assess severity** (Critical/High/Medium/Low)
3. **Investigate root cause**
4. **Implement fix or workaround**
5. **Verify resolution**
6. **Document incident**
7. **Implement preventive measures**

### Incident Log Template

```
Incident ID: INC-YYYYMMDD-###
Date/Time: YYYY-MM-DD HH:MM UTC
Severity: Critical/High/Medium/Low
Status: Open/Investigating/Resolved/Closed

Description:
[What happened?]

Impact:
[Who/what was affected?]

Root Cause:
[Why did it happen?]

Resolution:
[How was it fixed?]

Prevention:
[How to prevent recurrence?]

Timeline:
- HH:MM - Alert triggered
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix implemented
- HH:MM - Resolution verified
- HH:MM - Incident closed
```

---

## Success Metrics

### Technical Success

- ✅ Uptime > 99.9%
- ✅ Average response time < 1 second
- ✅ Error rate < 0.5%
- ✅ Database queries < 100ms average
- ✅ Zero data loss incidents
- ✅ Zero security breaches

### Business Success

- ✅ User growth rate > 10% month-over-month
- ✅ Subscription conversion rate > 5%
- ✅ Churn rate < 5%
- ✅ Customer satisfaction > 4.5/5
- ✅ Support ticket resolution < 24 hours
- ✅ Revenue growth > 20% month-over-month

---

## Reporting Schedule

### Daily Reports (First Week)

**To:** Christopher, Technical Team  
**Contents:**
- New users
- New subscriptions
- Critical errors
- System health

### Weekly Reports (First Month)

**To:** Christopher, Stakeholders  
**Contents:**
- User growth
- Revenue
- Key metrics
- Top issues
- Planned improvements

### Monthly Reports (Ongoing)

**To:** Christopher, Stakeholders, Board  
**Contents:**
- Executive summary
- User metrics
- Financial metrics
- Technical performance
- Product roadmap updates

---

## Continuous Improvement

### Monthly Tasks

- [ ] Review and optimize slow queries
- [ ] Update documentation
- [ ] Analyze user feedback
- [ ] Plan feature enhancements
- [ ] Review security practices
- [ ] Update monitoring thresholds

### Quarterly Tasks

- [ ] Disaster recovery drill
- [ ] Performance audit
- [ ] Security audit
- [ ] User experience review
- [ ] Competitive analysis
- [ ] Strategic planning

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Next Review:** After first month in production