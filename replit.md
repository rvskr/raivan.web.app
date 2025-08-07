# Gallery Restoration CMS

## Overview

This is a comprehensive Russian-language content management system for a furniture restoration and art studio. The application features complete admin functionality with in-place text editing, dynamic gallery management, service administration with custom icons, and category management. Built as a full-stack solution with React frontend, Express backend, and Firebase integration for real-time content management.

## Recent Changes (August 2025)

### ✅ Complete Admin System Implementation
- **Advanced Admin Panel**: Dedicated `/admin` route with tabbed interface for managing all content
- **Categories Management**: Full CRUD for gallery categories with slug generation and ordering
- **Services Management**: Dynamic services with Lucide icon selection and real-time updates
- **Enhanced Gallery Controls**: Improved gallery management with direct image upload to Firebase Storage
- **Hidden Admin Access**: Discreet admin login via double-click on navigation dot for better UX

### ✅ Firebase Integration & Windows Compatibility 
- **Real Firebase Integration**: Connected to raivanart project with proper secret management
- **Windows Platform Support**: Automatic platform detection for localhost vs 0.0.0.0 binding
- **Cross-platform Compatibility**: cross-env for NODE_ENV support on Windows
- **Authentication Setup**: Admin user creation documentation and troubleshooting guides

### ✅ Content Management Features
- **Universal Editability**: All text elements and buttons can be edited in-place with visual indicators
- **Firebase Services Integration**: Dynamic services loading from Firestore with fallback to static content
- **Icon System**: Dynamic icon rendering using Lucide React library for services
- **Real-time Updates**: All changes sync immediately across the application

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