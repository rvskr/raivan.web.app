# Gallery Restoration CMS

## Overview

This is a full-stack web application for a restoration gallery business, featuring a React frontend with Vite, an Express backend, and Firebase integration for content management. The application serves as both a public gallery showcase and an admin content management system, allowing dynamic updates to content, gallery items, and contact submissions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and theme support
- **State Management**: TanStack Query for server state and custom hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom theme based on warm earth tones suitable for restoration business

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: Drizzle ORM configured for PostgreSQL with schema definitions
- **Storage**: In-memory storage implementation with interface for future database integration
- **API Structure**: RESTful endpoints with /api prefix
- **Development**: Hot module replacement with Vite integration for seamless development

### Authentication & Authorization
- **Provider**: Firebase Authentication for admin access control
- **Security**: Role-based access with admin-only content editing capabilities
- **Session Management**: Firebase session persistence with automatic auth state monitoring

### Content Management System
- **Editable Content**: Dynamic text content that can be edited in-place by authenticated admins
- **Gallery Management**: CRUD operations for gallery items with image upload and categorization
- **Contact Forms**: Form submission handling with Firebase storage
- **Real-time Updates**: Live content synchronization using Firebase Firestore listeners

### Database Schema
- **Content**: Text content with type classification and update timestamps
- **Gallery Items**: Image galleries with title, description, category, and ordering
- **Services**: Business service descriptions with icons and ordering
- **Contact Forms**: Customer inquiry storage with metadata
- **Users**: Admin user management for authentication

## External Dependencies

### Core Services
- **Firebase**: Complete backend-as-a-service including Authentication, Firestore database, and Cloud Storage
- **Neon Database**: PostgreSQL hosting configured through Drizzle ORM
- **Vercel/Netlify**: Deployment platform for static site hosting

### Development Tools
- **Replit**: Development environment with custom Vite plugins for error handling and cartographer integration
- **ESBuild**: Production bundling for server-side code
- **PostCSS**: CSS processing with Tailwind and autoprefixer

### UI Libraries
- **Radix UI**: Headless component primitives for accessibility and customization
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Touch-friendly carousel component for gallery displays
- **React Hook Form**: Form validation and handling with Zod schema validation

### Utilities
- **Zod**: Runtime type validation and schema definitions
- **date-fns**: Date manipulation and formatting
- **clsx/tailwind-merge**: Conditional CSS class handling
- **nanoid**: Unique ID generation for components and data