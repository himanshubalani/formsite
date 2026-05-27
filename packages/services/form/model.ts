import { z } from "zod";

export const createFormInput = z.object({
  title: z.string().min(1, "Title is required").max(255).describe("Title of the form"),
  description: z.string().optional().describe("Optional description of the form"),
  visibility: z.enum(["PUBLIC", "UNLISTED"]).default("PUBLIC").describe("Visibility mode"),
  isPublished: z.boolean().default(false).describe("Whether the form is live"),
  theme: z.string().default("light").describe("Form UI theme"),
  slug: z.string().optional().describe("Optional custom URL slug"),
  
  // We require the userId to know who is creating this form
  userId: z.string().uuid("Invalid user ID").describe("ID of the creator"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;