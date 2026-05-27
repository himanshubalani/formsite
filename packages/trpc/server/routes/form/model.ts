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
  id: z.string().describe("ID of the newly created form"),
  title: z.string(),
  visibility: z.enum(["PUBLIC", "UNLISTED"]),
  isPublished: z.boolean(),
  slug: z.string().nullable().optional(),
});

export const getFormsInputModel = z.undefined();

export const getFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("Form ID"),
    title: z.string(),
    description: z.string().nullable().optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]),
    isPublished: z.boolean(),
    theme: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    createdAt: z.date(),
  })
);

const fieldTypeEnum = z.enum([
  'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'EMAIL', 'DATE', 
  'RADIO', 'CHECKBOX', 'SINGLE_SELECT', 'MULTI_SELECT'
]);

export const fieldOutputModel = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  label: z.string(),
  labelKey: z.string(),
  description: z.string().nullable(),
  placeholder: z.string().nullable(),
  type: fieldTypeEnum,
  isRequired: z.boolean(),
  options: z.array(z.string()).nullable(),
  index: z.string(), // returned as string from DB numeric
});

export const createFieldTrpcInput = z.object({
  formId: z.uuid(),
  label: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  type: fieldTypeEnum,
  isRequired: z.boolean().default(false),
  options: z.array(z.string()).optional().nullable(),
  index: z.number(),
});

export const updateFieldTrpcInput = z.object({
  id: z.uuid(),
  label: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  type: fieldTypeEnum.optional(),
  isRequired: z.boolean().optional(),
  options: z.array(z.string()).optional().nullable(),
  index: z.number().optional(),
});

export const deleteFieldTrpcInput = z.object({
  id: z.uuid(),
});

export const getFieldsTrpcInput = z.object({
  formId: z.uuid(),
});

export const getPublicFormInputModel = z.object({
  id: z.string().uuid(),
});

export const getPublicFormOutputModel = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  theme: z.string().nullable(),
  fields: z.array(fieldOutputModel), // Reuses the field schema we made earlier!
});

export const submitPublicFormInputModel = z.object({
  formId: z.string().uuid(),
  // Frontend sends { "fieldId": "value" }, we accept broadly to parse it correctly
  values: z.record(
    z.string(), 
    z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable().optional()
  ),
});

export const submitPublicFormOutputModel = z.object({
  id: z.string().uuid(),
  success: z.boolean(),
});