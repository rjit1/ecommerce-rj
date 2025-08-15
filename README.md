# RJ4WEAR - Premium E-Commerce Platform

A production-ready e-commerce platform built with Next.js, Supabase, and modern web technologies. Features a complete customer-facing website with advanced product management, cart functionality, and seamless checkout experience.

## 🚀 Features

### Customer Features
- **Modern Landing Page** with hero banners, product sections, and responsive design
- **Advanced Product Catalog** with filtering, sorting, and search functionality
- **Product Detail Pages** with image galleries, variant selection, and stock management
- **Shopping Cart** with real-time updates and coupon system
- **User Authentication** with email/password and magic link support
- **Responsive Design** optimized for mobile and desktop
- **SEO Optimized** with ISR, metadata, and structured data

### Technical Features
- **Next.js 14** with App Router and ISR for optimal performance
- **Supabase** for authentication, database, and file storage
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations and transitions
- **Real-time Search** with instant suggestions
- **Cart Management** with guest and authenticated user support
- **Image Optimization** with Next.js Image component

## 🛠 Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS, Custom CSS
- **Animation**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payment**: Razorpay integration ready
- **Deployment**: Vercel optimized
- **SEO**: Next.js ISR, Metadata API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rj4wear
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase and other service credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase.sql`
   - Run the sample data from `sample-data.sql` (optional)
   - Set up storage buckets for images

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **Products & Categories**: Product catalog with variants, images, and categorization
- **Users & Authentication**: User profiles and address management
- **Cart & Orders**: Shopping cart and order management
- **Coupons**: Discount and promotion system
- **Site Settings**: Configurable site-wide settings
- **Banners**: Homepage banner management

See `supabase.sql` for the complete schema with indexes, triggers, and RLS policies.

## 🎨 Brand Colors

- **Primary**: Sky Blue (#87CEEB)
- **Accent**: Deep Blue (#1E3A8A)
- **Text**: Black (#000000)
- **Background**: White (#FFFFFF)
- **Neutrals**: Various gray shades for UI elements

## 📱 Pages & Components

### Main Pages
- **Homepage** (`/`) - Hero banners, categories, featured products
- **Product Listing** (`/products`) - Filterable product catalog
- **Product Detail** (`/products/[slug]`) - Individual product pages
- **Shopping Cart** (`/cart`) - Cart management and checkout prep
- **Authentication** (`/auth/login`) - User login and registration

### Key Components
- **Navbar** - Responsive navigation with search and cart
- **ProductCard** - Reusable product display component
- **ProductDetail** - Comprehensive product page with variants
- **CartContent** - Full cart management functionality
- **HeroBanner** - Animated homepage banner carousel

## 🔧 Configuration

### Site Settings
Configure your store through the `site_settings` table:
- COD fee and free delivery threshold
- Contact information and support details
- Top header announcements
- Delivery estimates and policies

### Product Management
- Add products with multiple variants (size, color)
- Upload multiple images per product
- Set featured, trending, and hot sale flags
- Manage inventory and stock levels

### Coupon System
- Percentage or fixed amount discounts
- Minimum order requirements
- Usage limits and expiration dates
- Automatic validation during checkout

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic ISR and edge optimization

### Supabase Setup
1. Create storage buckets for product images
2. Configure RLS policies for security
3. Set up authentication providers
4. Configure email templates

## 📊 Performance Features

- **ISR (Incremental Static Regeneration)** for product pages
- **Image optimization** with Next.js Image component
- **Lazy loading** for improved initial page load
- **Code splitting** for optimal bundle sizes
- **Core Web Vitals** optimization
- **Mobile-first** responsive design

## 🔒 Security

- **Row Level Security (RLS)** on all database tables
- **Authentication** with Supabase Auth
- **Input validation** and sanitization
- **CSRF protection** with Next.js
- **Environment variable** security

## 🛒 E-commerce Features

### Shopping Experience
- Real-time product search with suggestions
- Advanced filtering (category, price, size, color)
- Product variants with dynamic pricing
- Stock level indicators and low stock warnings
- Guest checkout and user accounts

### Cart & Checkout
- Persistent cart across sessions
- Coupon code system with validation
- Delivery fee calculation
- COD and online payment options
- Order confirmation and tracking

## 📈 SEO & Analytics

- **Metadata optimization** for all pages
- **Structured data** for products
- **Sitemap generation** for search engines
- **Open Graph** and Twitter card support
- **Performance monitoring** ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the sample data and schema

## 🔄 Updates

The platform is designed for easy updates and maintenance:
- Modular component architecture
- TypeScript for type safety
- Comprehensive error handling
- Logging and monitoring ready

---

**RJ4WEAR** - Built with ❤️ for modern e-commerce experiences.