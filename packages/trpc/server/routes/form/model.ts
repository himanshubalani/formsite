import { z } from "zod";

export const createFormInputModel = z.object({
  title: z.string().min(1, "Title is required").max(255).describe("Title of the form"),
  description: z.string().optional().describe("Optional description of the form"),
  visibility: z.enum(["PUBLIC", "UNLISTED"]).default("PUBLIC").describe("Visibility mode"),
  isPublished: z.boolean().default(false).describe("Whether the form is live"),
  theme: z.string().default("light").describe("Form UI theme"),
  slug: z.string().optional().describe("Optional custom URL slug"),
});

export const createFormOutputModel = z.object({
  id: z.string().uuid().describe("ID of the newly created form"),
  title: z.string(),
  visibility: z.enum(["PUBLIC", "UNLISTED"]),
  isPublished: z.boolean(),
  slug: z.string().nullable().optional(),
});