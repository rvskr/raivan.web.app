import { z } from "zod";

// Content Schema
export const contentSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: z.enum(['text', 'link', 'image']),
  updatedAt: z.date().optional(),
});

export const insertContentSchema = contentSchema.omit({ id: true, updatedAt: true });

// Gallery Item Schema
export const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  category: z.enum(['restoration', 'art', 'custom']),
  order: z.number().default(0),
  createdAt: z.date().optional(),
});

export const insertGalleryItemSchema = galleryItemSchema.omit({ id: true, createdAt: true });

// Service Schema
export const serviceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  order: z.number().default(0),
});

export const insertServiceSchema = serviceSchema.omit({ id: true });

// Category Schema
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  order: z.number().default(0),
  createdAt: z.date().optional(),
});

export const insertCategorySchema = categorySchema.omit({ id: true, createdAt: true });

// Contact Form Schema
export const contactFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string(),
  submittedAt: z.date().optional(),
  status: z.enum(['new', 'in-progress', 'completed']).default('new').optional(),
});

export const insertContactFormSchema = contactFormSchema.omit({ id: true, submittedAt: true, status: true });

// User Schema (for admin authentication)
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['admin']).default('admin'),
});

export const insertUserSchema = userSchema.omit({ id: true });

// Hero Section Content Schema
export const heroSectionContentSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCta1: z.string().optional(),
  heroCta2: z.string().optional(),
  heroImageUrl: z.string().optional(),
});

// About Section Content Schema
export const aboutSectionContentSchema = z.object({
  aboutTitle: z.string().optional(),
  aboutDesc1: z.string().optional(),
  aboutDesc2: z.string().optional(),
  aboutCta: z.string().optional(),
  aboutImageUrl: z.string().optional(),
});

// Navigation Section Content Schema
export const navSectionContentSchema = z.object({
  navLogoUrl: z.string().optional(),
  navTitle: z.string().optional(),
});

// Nav Shop Content Schema
export const navShopContentSchema = z.object({
  shopText: z.string().optional(),
  shopUrl: z.string().optional(),
});

export interface SocialLink {
  id: string;
  platform: string;
  icon: string;
  url: string;
}

export interface ContactFormContent {
  title: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  serviceLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitButton: string;
}

// Footer Content Schema
export const footerContentSchema = z.object({
  description: z.string().optional(),
  copyright: z.string().optional(),
});

// Contact Item Schema
export const contactItemSchema = z.object({
  id: z.string(),
  icon: z.string(),
  defaultContent: z.string(),
});

export const insertContactItemSchema = contactItemSchema.omit({ id: true });

// Types
export type Content = z.infer<typeof contentSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Category = z.infer<typeof categorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type InsertContactForm = z.infer<typeof insertContactFormSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type HeroSectionContent = z.infer<typeof heroSectionContentSchema>;
export type AboutSectionContent = z.infer<typeof aboutSectionContentSchema>;
export type NavSectionContent = z.infer<typeof navSectionContentSchema>;
export type NavShopContent = z.infer<typeof navShopContentSchema>;
export type FooterContent = z.infer<typeof footerContentSchema>;
export type ContactItem = z.infer<typeof contactItemSchema>;
export type InsertContactItem = z.infer<typeof insertContactItemSchema>;