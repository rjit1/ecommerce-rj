# RJ4WEAR Admin Panel - Complete Setup Guide

This guide will help you set up and run the RJ4WEAR Admin Panel from scratch.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase project with the main database schema applied
- Admin user created in the `admin_users` table

### 1. Environment Setup

Copy the environment file and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3002

# Main Site URL (for revalidation)
MAIN_SITE_URL=http://localhost:3000

# Revalidation Secret (for ISR)
REVALIDATION_SECRET=your_secret_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Admin User

Before you can login, create an admin user in your Supabase database:

1. **Create a user via Supabase Auth:**
   - Go to your Supabase Dashboard → Authentication → Users
   - Click "Invite a user" or create manually
   - Use email: `admin@yoursite.com` and a secure password

2. **Add the user to admin_users table:**
   ```sql
   INSERT INTO admin_users (user_id, role, is_active) 
   VALUES ('USER_UUID_FROM_AUTH_USERS_TABLE', 'admin', true);
   ```

   To get the user UUID:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'admin@yoursite.com';
   ```

### 4. Start the Development Server

```bash
npm run dev
```

The admin panel will be available at: http://localhost:3002

### 5. Login

Navigate to http://localhost:3002/login and use your admin credentials.

---

## 📋 Database Requirements

### Required Tables
Ensure your Supabase database has all these tables from the main project:

- ✅ `categories`
- ✅ `products` 
- ✅ `product_images`
- ✅ `product_variants`
- ✅ `user_profiles`
- ✅ `user_addresses`
- ✅ `orders`
- ✅ `order_items`
- ✅ `coupons`
- ✅ `banners`
- ✅ `site_settings`
- ✅ `admin_users`

### Required Functions
- ✅ `is_admin()` - Checks if current user is admin
- ✅ `get_product_total_stock()` - Calculates total product stock
- ✅ `is_low_stock()` - Checks if product has low stock

### Required RLS Policies
The database should have proper Row Level Security policies configured for admin access.

---

## 🔧 Configuration

### Port Configuration
The admin panel runs on port 3002 by default. To change:

```bash
# In package.json
"dev": "next dev -p YOUR_PORT",
"start": "next start -p YOUR_PORT",
```

### Storage Configuration
Product images are stored in Supabase Storage. Ensure you have:

1. **Storage bucket created:** `products`
2. **Public access enabled** for the bucket
3. **Proper storage policies** for admin uploads

---

## 📱 Features Overview

### ✅ Completed Features

1. **Dashboard**
   - Overview statistics
   - Recent orders
   - Low stock alerts
   - Quick actions

2. **Product Management**
   - Full CRUD operations
   - Image upload and management
   - Variant management (size/color/stock)
   - Category assignment
   - Featured/trending/hot sale toggles

3. **Category Management**
   - Create/edit/delete categories
   - Active/inactive status
   - Display order management

4. **Order Management**
   - View all orders with filtering
   - Order status updates
   - Detailed order view
   - Payment status tracking

5. **User Management**
   - View customer profiles
   - Search functionality
   - Order history

6. **Coupon Management**
   - Create percentage and fixed amount coupons
   - Usage limits and expiry dates
   - Active/inactive status

7. **Banner Management**
   - Upload homepage banners
   - Link management
   - Display order control

8. **Settings**
   - Site-wide configuration
   - Delivery fee management
   - Contact information

### 🔄 Authentication & Security
- Supabase Auth integration
- Admin-only access control
- Protected routes
- RLS policy enforcement

### 📱 UI/UX Features
- Mobile-first responsive design
- Smooth Framer Motion animations
- Loading states and skeletons
- Toast notifications
- Dark/light theme ready

---

## 🧪 Testing

### Admin Authentication Test
1. Go to `/login`
2. Enter admin credentials
3. Should redirect to `/dashboard`
4. Verify all navigation links work

### CRUD Operations Test
1. **Products:** Create, edit, delete, image upload
2. **Categories:** Create, edit, delete
3. **Orders:** View, status updates
4. **Users:** View, search
5. **Coupons:** Create, edit, delete
6. **Banners:** Upload, edit, delete

### Responsive Design Test
1. Test on mobile (< 768px)
2. Test on tablet (768px - 1024px)
3. Test on desktop (> 1024px)

---

## 🚀 Production Deployment

### Vercel Deployment

1. **Connect Repository:**
   ```bash
   vercel --prod
   ```

2. **Configure Build Settings:**
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

3. **Environment Variables:**
   Set all environment variables in Vercel dashboard

4. **Custom Domain:**
   Configure your admin subdomain (e.g., admin.yoursite.com)

### VPS Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start with PM2:**
   ```bash
   pm2 start npm --name "rj4wear-admin" -- start
   pm2 save
   pm2 startup
   ```

3. **Reverse Proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name admin.yoursite.com;
       
       location / {
           proxy_pass http://localhost:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🐛 Troubleshooting

### Common Issues

1. **"Admin access denied"**
   - Check if user exists in `admin_users` table
   - Verify `is_active = true`
   - Check RLS policies

2. **"Cannot upload images"**
   - Verify Supabase Storage bucket exists
   - Check storage policies
   - Ensure file size < 5MB

3. **"Database connection failed"**
   - Check environment variables
   - Verify Supabase credentials
   - Test database connectivity

4. **"Build errors"**
   - Run `npm install` to fix dependencies
   - Check TypeScript errors
   - Verify all imports

### Debug Mode

Enable debugging:
```bash
DEBUG=* npm run dev
```

### Performance Issues

1. **Slow loading:**
   - Check database indexes
   - Optimize queries
   - Enable caching

2. **Large bundle size:**
   - Use dynamic imports
   - Optimize images
   - Remove unused dependencies

---

## 📞 Support & Maintenance

### Regular Tasks
- Monitor error logs
- Update dependencies monthly
- Backup database regularly
- Check security updates

### Scaling Considerations
- Database connection pooling
- CDN for static assets  
- Caching strategies
- Load balancing

---

## 📄 License & Credits

This admin panel is part of the RJ4WEAR e-commerce platform.

**Built with:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase
- React Hook Form
- Zod validation

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Node.js Version:** 18+