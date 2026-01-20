# Migration Quick Start Guide

Fast-track guide for migrating from Google Sheets to Supabase.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase project created
- [ ] Service role key obtained
- [ ] `.env` file configured
- [ ] Database migrations applied
- [ ] Backup of Google Sheets created

## 5-Step Migration Process

### Step 1: Export (10 min)

```javascript
// In Google Apps Script
// Copy backend/src/migration/exportFromSheets.js
// Run:
exportAllDataToJSON()

// Download: migration_export_YYYY-MM-DD.json
```

### Step 2: Transform (2 min)

```bash
cd backend
npm run migration:transform migration_export.json transformed_data.json
```

### Step 3: Import (15 min)

```bash
npm run migration:import transformed_data.json
# Save user_credentials.json securely!
```

### Step 4: Validate (5 min)

```bash
npm run migration:validate transformed_data.json
```

### Step 5: User Setup (2-3 days)

```bash
# Option A: Send credentials manually
# Use user_credentials.json

# Option B: Send password reset emails (recommended)
npm run migration:user-reset-passwords emails.json
```

## Environment Setup

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-key
FRONTEND_URL=https://your-app.vercel.app
```

## Common Commands

```bash
# Transform data
npm run migration:transform <input> <output>

# Import to Supabase
npm run migration:import <transformed-file>

# Validate migration
npm run migration:validate <transformed-file>

# Migrate users only
npm run migration:user-migrate <users-file>

# Send password resets
npm run migration:user-reset-passwords <emails-file>

# Validate user data
npm run migration:user-validate <users-file>

# Check existing users
npm run migration:user-check <emails-file>
```

## Troubleshooting

### Export fails
- Check sheet names match exactly
- Verify Google Apps Script permissions
- Check for special characters in data

### Import fails
- Verify `.env` has SERVICE ROLE KEY (not anon key)
- Check Supabase project is accessible
- Verify database migrations are applied

### Validation fails
- Check import logs for errors
- Verify data counts in Supabase dashboard
- Run manual SQL queries to investigate

### Users can't log in
- Verify credentials are correct
- Check email is confirmed in Supabase
- Try password reset flow
- Check RLS policies

## Quick Verification

```sql
-- In Supabase SQL Editor

-- Check counts
SELECT 'users' as type, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'issues', COUNT(*) FROM issues;

-- Check admin
SELECT * FROM profiles WHERE role = 'admin';

-- Check sample task
SELECT t.title, p.email as assigned_to
FROM tasks t
JOIN profiles p ON t.assigned_to = p.id
LIMIT 5;
```

## Success Criteria

- ✅ All users migrated
- ✅ All tasks migrated
- ✅ All issues migrated
- ✅ Users can log in
- ✅ Data relationships intact
- ✅ No validation errors

## Emergency Rollback

```bash
# ⚠️ WARNING: Deletes all migrated data!
npm run migration:rollback
```

## Support

- **Technical:** See MIGRATION_COMPLETE_GUIDE.md
- **Users:** See USER_MIGRATION_GUIDE.md
- **Detailed:** See backend/MIGRATION_GUIDE.md

## Timeline

| Step | Duration |
|------|----------|
| Export | 10 min |
| Transform | 2 min |
| Import | 15 min |
| Validate | 5 min |
| **Technical Total** | **~30 min** |
| User Setup | 2-3 days |
| **Project Total** | **3-5 days** |

---

**Ready to migrate?** Start with Step 1! 🚀
