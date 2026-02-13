# Admin Authentication Setup Guide

## Overview

The admin panel is now protected with **Supabase Authentication**. Only users with valid credentials can access the admin area.

---

## ✅ Step 1: Enable Authentication in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Ensure **Email** provider is enabled (should be enabled by default)

---

## ✅ Step 2: Create Admin Account

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **"Add user"** button (top right)
3. Fill in the form:
   - **Email:** your-admin-email@example.com (e.g., admin@arambha.com)
   - **Password:** Create a strong password (min 6 characters)
   - **Auto confirm user:** Check this box (to instantly activate the account)

4. Click **"Create user"**

**Example:**
```
Email: admin@arambha.com
Password: SecureAdminPass123!
```

---

## ✅ Step 3: Test Admin Login

1. Go to your admin page: `http://localhost:3000/admin`
2. You should see a login popup
3. Enter your credentials:
   - Email: `admin@arambha.com`
   - Password: `SecureAdminPass123!`
4. Click **"Login"**

If credentials are correct → ✅ You'll access the admin panel
If credentials are wrong → ❌ Error message will appear

---

## 🔐 Features

✅ **Login Modal** - Appears automatically on `/admin` page
✅ **Email/Password Authentication** - Secure credential validation
✅ **Session Management** - Your session persists across page reloads
✅ **Logout Button** - Top right corner with user email display
✅ **Error Handling** - Clear error messages for failed login attempts

---

## 🔑 Important Security Notes

1. **Use strong passwords** - Not something easy to guess
2. **Keep credentials secure** - Don't share your admin email/password
3. **Logout when done** - Click the "Logout" button before leaving
4. **Production:** 
   - Only share access with trusted team members
   - Consider using Supabase Row Level Security (RLS) for additional protection
   - Use environment variables for sensitive data

---

## 🛠️ How It Works (Technical)

### Login Process:
1. User enters email and password in login modal
2. `supabase.auth.signInWithPassword()` validates credentials
3. If valid → Session is created (stored in browser)
4. Admin content becomes visible
5. User email is displayed in header

### Logout Process:
1. User clicks "Logout" button
2. `supabase.auth.signOut()` clears session
3. User is redirected to login modal

### Session Persistence:
- Session is stored in browser localStorage
- Even if user closes browser, session remains
- `onAuthStateChange()` listener restores session on page reload

---

## 🆘 Troubleshooting

### Problem: Can't login, error "Invalid login credentials"
**Solution:** 
- Check email spelling
- Verify password is correct
- Create a new admin account in Supabase if needed

### Problem: Login modal appears after refresh
**Solution:**
- Check Supabase project is running
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Clear browser cache and try again

### Problem: Logout button not working
**Solution:**
- Refresh the page
- Check browser console for errors
- Re-login and try logout again

---

## 📝 Next Steps

To add more admin users:
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"** again
3. Enter new admin email and password
4. They can now login with those credentials

---

## 🎯 Summary

✅ Admin panel is now **password-protected**
✅ Only authorized users can manage content
✅ Sessions are **secure and persistent**
✅ Logout functionality for security

**Your admin credentials are:**
- Email: See your Supabase Users table
- Password: The one you created

Enjoy secure admin access! 🎉
