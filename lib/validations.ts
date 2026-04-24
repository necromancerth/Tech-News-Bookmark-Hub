import { z } from "zod";

export const BookmarkCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  url: z.string().url("Must be a valid URL"),
  description: z.string().max(1000).optional(),
  source: z.string().min(1, "Source is required"),
  publishedAt: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  note: z.string().max(500, "Note must be under 500 characters").optional(),
  categoryId: z.string().optional(),
});

export const BookmarkUpdateSchema = z.object({
  note: z
    .string()
    .max(500, "Note must be under 500 characters")
    .optional()
    .nullable(),
  categoryId: z.string().optional().nullable(),
});

export const CategoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be under 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Only letters, numbers, spaces, hyphens and underscores"),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, "Must be a valid hex color"),
  description: z.string().max(200, "Description must be under 200 characters").optional(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();

export type BookmarkCreate = z.infer<typeof BookmarkCreateSchema>;
export type BookmarkUpdate = z.infer<typeof BookmarkUpdateSchema>;
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;
