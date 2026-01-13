# 🔐 Admin Access Guide

## Hidden Admin Login URLs

For security purposes, admin/staff login is not visible on the public website. Use these URLs:

### Primary Access URLs:
- `https://biskakenauto.rpnmore.com/admin-login`
- `https://biskakenauto.rpnmore.com/admin/login`
- `https://biskakenauto.rpnmore.com/login`

### Localhost Development:
- `http://localhost:3000/login`
- `http://localhost:3000/admin-login`

## Security Features

### ✅ What's Hidden:
- No visible login button on homepage
- No admin/staff links in navigation
- Only a subtle dot (•) in footer as emergency access
- Direct URLs only known to authorized personnel

### ✅ Authentication Security:
- Production: Requires real backend authentication
- Development: Demo credentials work only on localhost
- No auto-login on production domains
- Failed attempts require backend validation

## For Admin/Staff:

### 🎯 Bookmark These URLs:
1. **Admin Dashboard**: `https://biskakenauto.rpnmore.com/admin-login`
2. **Blog Management**: After login → `/blog`
3. **Customer Management**: After login → `/customers`

### 📱 Mobile Access:
Same URLs work on mobile devices. Bookmark for easy access.

### 🔑 Login Credentials:
- Contact your system administrator for production credentials
- Development demo: `admin@biskaken.com` / `admin123`

## Emergency Access:

### If URLs Don't Work:
1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Contact system administrator
4. Use the tiny dot (•) link in website footer

### Backup Access Points:
- Footer dot (•) → `/admin-login`
- Direct domain: `https://bisadmin.rpnmore.com` (if configured)

## Best Practices:

### 🔒 Keep URLs Private:
- Don't share admin URLs publicly
- Use bookmarks instead of typing
- Log out when done
- Use strong passwords

### 📋 For New Staff:
1. Provide admin URLs privately
2. Create backend user accounts
3. Test access before going live
4. Regular password updates

---

**Security through obscurity + proper authentication = Maximum protection**