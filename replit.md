# ShopCenter - E-commerce Platform

## Overview

ShopCenter is a full-stack e-commerce platform built with modern web technologies. It features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM. The application includes comprehensive shopping functionality with admin capabilities, user authentication via Replit Auth, and a responsive design using Tailwind CSS and shadcn/ui components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Key Components

1. **Authentication System**
   - Replit Auth integration with OpenID Connect
   - Session-based authentication with PostgreSQL storage
   - Role-based access control (customer/admin)

2. **Product Management**
   - Product catalog with categories and hierarchical organization
   - Image management and product variants
   - Inventory tracking and pricing (including sale prices)
   - Product reviews and ratings system

3. **Shopping Cart & Checkout**
   - Persistent shopping cart functionality
   - Multi-step checkout process
   - Order management and tracking
   - Wishlist functionality

4. **Admin Dashboard**
   - Product and category management
   - Order processing and fulfillment
   - User management and analytics
   - Dashboard with key metrics

5. **User Experience**
   - Responsive design optimized for mobile and desktop
   - Product search and filtering
   - User profiles and order history
   - Shopping cart persistence

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating sessions stored in PostgreSQL
2. **Product Browsing**: Products are fetched from the database with filtering and pagination
3. **Shopping Cart**: Cart items are stored server-side and associated with authenticated users
4. **Checkout Process**: Orders are created with shipping/billing information and payment details
5. **Admin Operations**: Admin users can manage products, categories, and orders through dedicated interfaces

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store

### Authentication
- **openid-client**: OpenID Connect client for Replit Auth
- **passport**: Authentication middleware

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking
- **esbuild**: Production bundling for server code

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for TypeScript execution in development
- Automatic database migrations with Drizzle Kit

### Production
- Frontend built with Vite and served as static files
- Backend bundled with esbuild for Node.js deployment
- Database migrations handled via Drizzle Kit push command
- Environment variables for database and session configuration

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `REPLIT_DOMAINS`: Allowed domains for Replit Auth
- `ISSUER_URL`: OpenID Connect issuer URL

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
- July 04, 2025. Database setup with PostgreSQL and sample data
- July 04, 2025. Added 15 sample products across 6 categories
- July 04, 2025. Working authentication with Replit Auth
- July 04, 2025. Fixed Vercel deployment configuration
```

## Deployment Status

### Current Issues
- Vercel deployment needs proper configuration for full-stack app
- TypeScript errors in storage layer need resolution for production build
- Need to configure environment variables for production

### Next Steps
1. Fix TypeScript compilation errors
2. Test complete shopping flow (browse → cart → checkout)
3. Add AI shopping assistant with Gemini API
4. Complete Vercel deployment setup

## User Preferences

```
Preferred communication style: Simple, everyday language.
```