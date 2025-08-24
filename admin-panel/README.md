# RJ4WEAR Admin Panel

A comprehensive, production-ready admin panel for managing the RJ4WEAR e-commerce platform. Built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Core Functionality
- **Dashboard** - Overview with key metrics and quick actions
- **Product Management** - Full CRUD operations with variants, images, and inventory
- **Category Management** - Organize products with hierarchical categories
- **Order Management** - View, filter, and update order statuses
- **User Management** - View customer profiles and order history
- **Coupon Management** - Create and manage discount codes
- **Banner Management** - Homepage banner management
- **Settings** - Site-wide configuration management

### Technical Features
- **Mobile-First Design** - Responsive layout optimized for all devices
- **Real-time Updates** - Live data synchronization with Supabase
- **Image Upload** - Direct upload to Supabase Storage with optimization
- **Advanced Filtering** - Search, sort, and filter across all data tables
- **Pagination** - Efficient data loading for large datasets
- **Form Validation** - Comprehensive client-side validation with Zod
- **Error Handling** - Graceful error handling with user-friendly messages
- **Loading States** - Skeleton loaders and progress indicators
- **Animations** - Smooth transitions with Framer Motion

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form + Zod validation
- **Animation**: Framer Motion
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **State Management**: React Context + Hooks
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Navigate to the admin panel directory**
   ```bash
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3001
   MAIN_SITE_URL=http://localhost:3000
   REVALIDATION_SECRET=your_secret_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🗄️ Database Setup

Ensure your Supabase database has all required tables and functions from the main project:

1. **Run the main database schema**
   ```sql
   -- Execute: supabase.sql
   -- Execute: supabase-profile-trigger.sql
   -- Execute: complete_database_schema.sql
   ```

2. **Apply migrations**
   ```sql
   -- Execute all files in /migrations/ folder
   ```

3. **Create admin user**
   ```sql
   -- First, create a user through Supabase Auth UI or API
   -- Then add them to admin_users table
   INSERT INTO admin_users (user_id, role, is_active) 
   VALUES ('user-uuid-here', 'admin', true);
   ```

## 🔐 Admin Access

### Creating Admin Users

1. **Via Supabase Dashboard**
   - Go to Authentication > Users
   - Create a new user
   - Copy the user UUID
   - Add to admin_users table

2. **Via SQL**
   ```sql
   INSERT INTO admin_users (user_id, role, is_active) 
   VALUES ('uuid-from-auth-users', 'admin', true);
   ```

### Admin Roles
- **admin**: Full access to all features
- **super_admin**: Reserved for future extended permissions

## 📱 Pages & Features

### Dashboard (`/dashboard`)
- Key metrics overview
- Recent orders
- Quick action shortcuts
- Low stock alerts
- Revenue statistics

### Products (`/products`)
- Product listing with advanced filters
- Create/edit products with variants
- Image management
- Inventory tracking
- SEO settings
- Bulk actions

### Categories (`/categories`)
- Category hierarchy management
- Create/edit/delete categories
- Drag-and-drop ordering
- Active/inactive status

### Orders (`/orders`)
- Order listing and filtering
- Status management
- Order details view
- Payment tracking
- Customer information

### Users (`/users`)
- Customer profile management
- Order history
- Address management
- User statistics

### Coupons (`/coupons`)
- Create discount codes
- Usage tracking
- Expiry management
- Min/max order values

### Banners (`/banners`)
- Homepage banner management
- Image upload
- Link management
- Display ordering

### Settings (`/settings`)
- Site configuration
- Delivery settings
- Contact information
- Header management

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Primary blue (#0073e6), Secondary sky blue (#00bde6)
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Animations**: Subtle, purposeful transitions

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation**: Collapsible sidebar on mobile
- **Tables**: Stack on mobile with card layout

### Accessibility
- **WCAG 2.1 AA** compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: Meets accessibility standards

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository**
   ```bash
   vercel --prod
   ```

2. **Set environment variables**
   - Add all .env.local variables in Vercel dashboard
   - Update NEXT_PUBLIC_SITE_URL to your domain

3. **Configure build settings**
   ```json
   {
     "buildCommand": "cd admin-panel && npm run build",
     "outputDirectory": "admin-panel/.next",
     "installCommand": "cd admin-panel && npm install"
   }
   ```

### Custom VPS

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Use PM2 for process management**
   ```bash
   pm2 start npm --name "rj4wear-admin" -- start
   ```

## 🔧 Configuration

### Image Storage
- **Provider**: Supabase Storage
- **Buckets**: `products`, `banners`, `categories`
- **Max Size**: 5MB per image
- **Formats**: JPEG, PNG, WebP

### Pagination
- **Default**: 10 items per page
- **Configurable**: Can be adjusted per table

### Caching
- **Static Assets**: Cached with Next.js
- **API Responses**: Cached where appropriate
- **Images**: CDN cached through Supabase

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test with UI
npm run test:ui
```

### Test Coverage
- Authentication flows
- CRUD operations
- Form validations
- Error handling
- Responsive design

## 📚 Development Guidelines

### Code Style
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled
- **Conventions**: Consistent naming and structure

### Component Structure
```
components/
├── layout/          # Layout components
├── ui/             # Reusable UI components
├── forms/          # Form components
├── tables/         # Data table components
└── [feature]/      # Feature-specific components
```

### API Structure
```
app/api/
├── auth/           # Authentication endpoints
├── products/       # Product management
├── orders/         # Order management
└── revalidate/     # Cache revalidation
```

## 🔒 Security

### Authentication
- **Supabase Auth**: Secure authentication
- **RLS Policies**: Row-level security
- **Admin Verification**: is_admin() function

### Data Protection
- **Input Validation**: All inputs validated
- **SQL Injection**: Protected by Supabase
- **CSRF**: Built-in Next.js protection
- **File Upload**: Type and size restrictions

## 🐛 Troubleshooting

### Common Issues

1. **Admin access denied**
   - Verify user exists in admin_users table
   - Check is_active status
   - Confirm RLS policies

2. **Image upload fails**
   - Check Supabase Storage buckets
   - Verify file size and type
   - Confirm storage policies

3. **Database connection issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review RLS policies

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check database queries
# Enable query logging in Supabase dashboard
```

## 📞 Support

For support and questions:
- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issues for bugs
- **Features**: Submit feature requests via GitHub
- **Email**: Contact development team

## 📄 License

This project is part of the RJ4WEAR e-commerce platform and is proprietary software.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Node.js 18+, Next.js 14+