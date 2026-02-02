# Complete Migration Guide: Google Sheets to Supabase

This is the master guide for migrating the entire Modern Office System from Google Sheets to Supabase PostgreSQL.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Architecture](#migration-architecture)
4. [Step-by-Step Process](#step-by-step-process)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Procedures](#rollback-procedures)
7. [Post-Migration](#post-migration)

## Overview

### What Gets Migrated

- **Users:** Email, name, role, department
- **Tasks:** All task types (routine, project, one-time)
- **Issues:** Problem reports and resolutions
- **Relationships:** Task assignments, issue reporters

### Migration Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Preparation | 1-2 hours | Setup, validation, backups |
| Export | 10-15 min | Export from Google Sheets |
| Transform | 2-5 min | Data transformation |
| Import | 15-30 min | Import to Supabase |
| Validation | 5-10 min | Verify migration |
| User Setup | 2-3 days | Distribute credentials, onboarding |

**Total Technical Time:** ~1-2 hours
**Total Project Time:** 3-5 days (including user coordination)

## Prerequisites

### Technical Requirements

- [x] Node.js 18+ installed
- [x] Supabase project created
- [x] Supabase service role key obtained
- [x] Frontend deployed (for password reset links)
- [x] SMTP configured (for emails)
- [x] Database migrations applied

### Access Requirements

- [x] Admin access to Google Sheets
- [x] Supabase project admin access
- [x] Ability to send emails to users
- [x] Backup of current Google Sheets

### Environment Setup

Create `.env` file in `backend/` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
FRONTEND_URL=https://your-app.vercel.app
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## Migration Architecture

```
┌─────────────────────┐
│  Google Sheets      │
│  - Master Sheet     │
│  - User Sheets      │
└──────────┬──────────┘
           │
           │ Export (exportFromSheets.js)
           ▼
┌─────────────────────┐
│  JSON Export        │
│  - users[]          │
│  - tasks[]          │
│  - issues[]         │
└──────────┬──────────┘
           │
           │ Transform (transformData.ts)
           ▼
┌─────────────────────┐
│  Transformed Data   │
│  - UUIDs generated  │
│  - Relationships    │
│  - Temp passwords   │
└──────────┬──────────┘
           │
           │ Import (importToSupabase.ts)
           ▼
┌─────────────────────┐
│  Supabase           │
│  - Auth Users       │
│  - Profiles         │
│  - Tasks            │
│  - Issues           │
└─────────────────────┘
```

## Step-by-Step Process

### Phase 1: Preparation (1-2 hours)

#### 1.1 Backup Current System

```bash
# Create backup of Google Sheets
# File > Make a copy > Name: "BACKUP - [Date]"
```

#### 1.2 Install Dependencies

```bash
cd backend
npm install
```

#### 1.3 Verify Environment

```bash
# Test Supabase connection
npm run test:connection

# Verify database schema
npm run db:verify
```

#### 1.4 Review Data

- Count users in Master Sheet
- Count tasks across all user sheets
- Count issues across all user sheets
- Note any data quality issues

### Phase 2: Export (10-15 minutes)

#### 2.1 Run Export Script

1. Open Google Apps Script editor
2. Create new script file
3. Copy contents of `backend/src/migration/exportFromSheets.js`
4. Run `exportAllDataToJSON()`
5. Download generated JSON file from Google Drive

#### 2.2 Verify Export

```bash
# Check export file
cat migration_export_2026-01-14.json | jq '.metadata'

# Expected output:
# {
#   "totalUsers": 5,
#   "totalTasks": 150,
#   "totalIssues": 20
# }
```

#### 2.3 Save Export

```bash
# Move to migration directory
mv ~/Downloads/migration_export_*.json backend/src/migration/migration_export.json
```

### Phase 3: Transform (2-5 minutes)

#### 3.1 Run Transformation

```bash
cd backend
npm run migration:transform migration_export.json transformed_data.json
```

#### 3.2 Review Transformed Data

```bash
# Check user count
cat transformed_data.json | jq '.users | length'

# Check admin user
cat transformed_data.json | jq '.users[] | select(.role == "admin")'

# Check sample task
cat transformed_data.json | jq '.tasks[0]'
```

#### 3.3 Verify Mappings

- Check that all emails have corresponding UUIDs
- Verify status mappings (Bekliyor → not_started)
- Verify priority mappings (Orta → medium)
- Check that relationships are preserved

### Phase 4: Import (15-30 minutes)

#### 4.1 Pre-Import Checks

```bash
# Verify Supabase connection
npm run test:connection

# Check for existing users
npm run migration:user-check emails.json
```

#### 4.2 Run Import

```bash
npm run migration:import transformed_data.json
```

**Monitor the output for errors!**

#### 4.3 Save Credentials

```bash
# Credentials are saved to user_credentials.json
# IMPORTANT: Save this file securely!
cp user_credentials.json ~/secure_location/user_credentials_backup.json
```

### Phase 5: Validation (5-10 minutes)

#### 5.1 Run Validation

```bash
npm run migration:validate transformed_data.json
```

#### 5.2 Manual Verification

```sql
-- In Supabase SQL Editor

-- Check user count
SELECT COUNT(*) FROM profiles;

-- Check admin user
SELECT * FROM profiles WHERE role = 'admin';

-- Check task count
SELECT COUNT(*) FROM tasks;

-- Check issue count
SELECT COUNT(*) FROM issues;

-- Check task assignments
SELECT COUNT(*) FROM tasks WHERE assigned_to IS NULL;

-- Check data integrity
SELECT t.id, t.title, p.email 
FROM tasks t 
LEFT JOIN profiles p ON t.assigned_to = p.id 
WHERE t.assigned_to IS NOT NULL 
LIMIT 10;
```

#### 5.3 Test User Login

1. Get credentials from `user_credentials.json`
2. Try logging in with admin user
3. Try logging in with employee user
4. Verify dashboard loads
5. Verify tasks are visible

### Phase 6: User Onboarding (2-3 days)

#### 6.1 Distribute Credentials

**Option A: Email Credentials**

```bash
# Use email template from USER_MIGRATION_GUIDE.md
# Send to each user individually
```

**Option B: Password Reset Flow (Recommended)**

```bash
# Send password reset emails
npm run migration:user-reset-passwords emails.json
```

#### 6.2 User Instructions

Send to all users:

```
Subject: New Office System - Action Required

Hello Team,

We've migrated to a new Modern Office System!

🔗 Login URL: https://your-app.vercel.app/login

📧 Your email: [user_email]

🔑 Password: 
[Option A: Temporary password provided]
[Option B: Check your email for password reset link]

⚠️ IMPORTANT:
1. Log in within 24 hours
2. Change your password immediately
3. Complete your profile
4. Test that you can see your tasks

📚 User Guide: [link to documentation]
❓ Support: support@company.com

Best regards,
IT Team
```

#### 6.3 Monitor Adoption

- Track login attempts
- Monitor for errors
- Collect user feedback
- Provide support as needed

## Troubleshooting

### Export Issues

#### Problem: "Master sheet not found"

**Solution:**
```javascript
// In Google Apps Script, verify sheet name
const masterFiles = DriveApp.searchFiles('title:"📊 MASTER - Akıllı İş Takip Sistemi"');
console.log('Found:', masterFiles.hasNext());
```

#### Problem: "User file not found"

**Solution:**
- Check user file naming: "📊 Akıllı İş Takip Sistemi - [UserName]"
- Verify user name matches Master Sheet
- Check for special characters in names

### Transform Issues

#### Problem: "User not found for task"

**Solution:**
```bash
# Check user emails in export
cat migration_export.json | jq '.users[].email'

# Check task user emails
cat migration_export.json | jq '.tasks[].userEmail' | sort | uniq
```

### Import Issues

#### Problem: "User already exists"

**Solution:**
```bash
# Check existing users
npm run migration:user-check emails.json

# Option 1: Skip existing users
# Option 2: Delete and recreate
# Option 3: Update profiles only
```

#### Problem: "RLS policy violation"

**Solution:**
- Verify using SERVICE ROLE KEY (not anon key)
- Check `.env` file
- Verify key has admin privileges

### Validation Issues

#### Problem: "Count mismatch"

**Solution:**
```bash
# Check import logs for errors
cat import.log | grep "Failed"

# Re-import failed items
npm run migration:import-failed failed_items.json
```

## Rollback Procedures

### Full Rollback

If migration fails completely:

```bash
# ⚠️ WARNING: This deletes ALL migrated data!
npm run migration:rollback
```

This will:
1. Delete all tasks
2. Delete all issues
3. Delete all profiles
4. Delete all auth users

### Partial Rollback

If only some data needs to be removed:

```sql
-- Delete specific user's data
DELETE FROM tasks WHERE assigned_to = 'user-uuid';
DELETE FROM issues WHERE reported_by = 'user-uuid';
DELETE FROM profiles WHERE id = 'user-uuid';
-- Then delete from auth.users in Supabase dashboard
```

### Restore from Backup

If you need to restore Google Sheets:

1. Open backup copy
2. File > Make a copy
3. Rename to original name
4. Share with users
5. Update any bookmarks/links

## Post-Migration

### Immediate Tasks (Day 1)

- [ ] Verify all users can log in
- [ ] Check that tasks are visible
- [ ] Test issue creation
- [ ] Verify email notifications
- [ ] Monitor error logs
- [ ] Provide user support

### Short-term Tasks (Week 1)

- [ ] Collect user feedback
- [ ] Fix any reported issues
- [ ] Update documentation
- [ ] Train users on new features
- [ ] Monitor system performance
- [ ] Review RLS policies

### Long-term Tasks (Month 1)

- [ ] Archive Google Sheets
- [ ] Remove old system access
- [ ] Update processes/procedures
- [ ] Evaluate migration success
- [ ] Plan future improvements
- [ ] Document lessons learned

### System Optimization

After migration is stable:

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM tasks WHERE assigned_to = 'uuid';

-- Add indexes if needed
CREATE INDEX IF NOT EXISTS idx_tasks_custom ON tasks(custom_field);

-- Vacuum database
VACUUM ANALYZE;
```

### Monitoring

Set up monitoring for:

- User login success rate
- Task creation/update rate
- Issue resolution time
- Email delivery rate
- API response times
- Database performance

## Success Criteria

Migration is successful when:

- ✅ All users migrated (100%)
- ✅ All tasks migrated (100%)
- ✅ All issues migrated (100%)
- ✅ All users can log in
- ✅ All relationships preserved
- ✅ No data loss
- ✅ System performance acceptable
- ✅ Users trained and onboarded
- ✅ Old system archived
- ✅ Documentation updated

## Support Contacts

- **Technical Issues:** tech-support@company.com
- **User Questions:** user-support@company.com
- **Emergency:** [phone number]

## Additional Resources

- [Backend Migration Guide](backend/MIGRATION_GUIDE.md)
- [User Migration Guide](backend/USER_MIGRATION_GUIDE.md)
- [API Documentation](backend/README.md)
- [User Manual](HUHULI_IS_TAKIP_SISTEMI_KULLANIM_KILAVUZU.md)

## Appendix

### Data Mapping Quick Reference

| Google Sheets | Supabase | Notes |
|--------------|----------|-------|
| Bekliyor | not_started | Task status |
| Devam Ediyor | in_progress | Task status |
| Tamamlandı | completed | Task status |
| Düşük | low | Priority |
| Orta | medium | Priority |
| Yüksek | high | Priority |
| Kritik | critical | Priority |
| Rutin İşler | routine | Task category |
| Proje İşleri | project | Task category |
| Tek Seferlik | one_time | Task category |

### Command Reference

```bash
# Export (Google Apps Script)
exportAllDataToJSON()

# Transform
npm run migration:transform input.json output.json

# Import
npm run migration:import transformed.json

# Validate
npm run migration:validate transformed.json

# User migration
npm run migration:user-migrate users.json
npm run migration:user-validate users.json
npm run migration:user-check emails.json
npm run migration:user-reset-passwords emails.json
```

---

**Last Updated:** January 14, 2026
**Version:** 1.0
**Status:** Ready for Production Migration
