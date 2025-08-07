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

// Contact Form Schema
export const contactFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string(),
  submittedAt: z.date().optional(),
});

export const insertContactFormSchema = contactFormSchema.omit({ id: true, submittedAt: true });

// User Schema (for admin authentication)
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['admin']).default('admin'),
});

export const insertUserSchema = userSchema.omit({ id: true });

// Types
export type Content = z.infer<typeof contentSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type InsertContactForm = z.infer<typeof insertContactFormSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
