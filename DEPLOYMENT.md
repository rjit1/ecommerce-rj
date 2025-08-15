# RJ4WEAR Deployment Guide

This guide will help you deploy the RJ4WEAR e-commerce platform to production.

## 🚀 Quick Deployment Checklist

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up Database Schema**
   ```sql
   -- Run the complete schema from supabase.sql
   -- This includes all tables, indexes, triggers, and RLS policies
   ```

3. **Configure Storage**
   - Create a public bucket named `product-images`
   - Create a public bucket named `banners`
   - Set up proper RLS policies for storage

4. **Add Sample Data (Optional)**
   ```sql
   -- Run sample-data.sql to populate with demo products
   ```

### 2. Environment Variables

Create `.env.local` with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay (for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_google_analytics_id
```

### 3. Vercel Deployment

1. **Connect Repository**
   - Push your code to GitHub
   - Connect repository to Vercel
   - Import the project

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Make sure to set `NEXT_PUBLIC_SITE_URL` to your production domain

3. **Deploy**
   - Vercel will automatically build and deploy
   - ISR will be enabled for product pages

### 4. Domain Configuration

1. **Custom Domain**
   - Add your custom domain in Vercel
   - Configure DNS records as instructed

2. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - Ensure HTTPS is enforced

### 5. Post-Deployment Setup

1. **Admin User**
   ```sql
   -- Create admin user in Supabase
   INSERT INTO admin_users (user_id, role) 
   VALUES ('your-user-id', 'super_admin');
   ```

2. **Site Settings**
   ```sql
   -- Configure basic site settings
   INSERT INTO site_settings (key, value) VALUES
   ('top_header_text', '🎉 Free Delivery on Orders Above ₹999! 🚚'),
   ('top_header_enabled', 'true'),
   ('cod_fee', '50'),
   ('free_delivery_threshold', '999');
   ```

3. **Test Orders**
   - Place test orders with both payment methods
   - Verify email notifications work
   - Test the complete checkout flow

## 🔧 Production Optimizations

### Performance
- ✅ ISR enabled for product pages
- ✅ Image optimization with Next.js Image
- ✅ Code splitting and lazy loading
- ✅ Optimized bundle sizes

### SEO
- ✅ Metadata for all pages
- ✅ Structured data for products
- ✅ Sitemap generation
- ✅ Open Graph tags

### Security
- ✅ RLS policies on all tables
- ✅ Input validation and sanitization
- ✅ Secure authentication with Supabase
- ✅ Environment variable protection

### Monitoring
- Set up error tracking (Sentry recommended)
- Configure analytics (Google Analytics)
- Monitor Core Web Vitals
- Set up uptime monitoring

## 📱 Mobile Optimization

The platform is fully responsive and mobile-optimized:
- Mobile-first design approach
- Touch-friendly interface
- Optimized images for mobile
- Fast loading on slow connections

## 🛒 E-commerce Features

### Customer Features
- ✅ Product browsing and search
- ✅ Shopping cart functionality
- ✅ User authentication
- ✅ Order management
- ✅ Multiple payment options
- ✅ Address management

### Admin Features (Future Enhancement)
- Product management
- Order processing
- Customer management
- Analytics dashboard
- Inventory tracking

## 🔄 Maintenance

### Regular Tasks
1. **Database Maintenance**
   - Monitor database performance
   - Clean up old sessions
   - Optimize queries if needed

2. **Content Updates**
   - Update product information
   - Refresh banner images
   - Update site settings

3. **Security Updates**
   - Keep dependencies updated
   - Monitor for security advisories
   - Regular backup verification

### Scaling Considerations
- Database connection pooling
- CDN for static assets
- Caching strategies
- Load balancing (if needed)

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify Supabase connection
   - Review TypeScript errors

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Monitor connection limits

3. **Payment Issues**
   - Verify Razorpay credentials
   - Check webhook endpoints
   - Test in sandbox mode first

### Support Resources
- Next.js Documentation
- Supabase Documentation
- Razorpay Integration Guide
- Vercel Deployment Docs

## 📊 Analytics & Monitoring

### Recommended Tools
- **Analytics**: Google Analytics 4
- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics
- **Uptime**: UptimeRobot
- **SEO**: Google Search Console

### Key Metrics to Monitor
- Page load times
- Conversion rates
- Cart abandonment
- Search queries
- Popular products
- User engagement

---

**Need Help?** Check the main README.md for detailed setup instructions or create an issue in the repository.