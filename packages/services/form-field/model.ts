import { z } from "zod";

const fieldTypeEnum = z.enum([
  'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'EMAIL', 'DATE', 
  'RADIO', 'CHECKBOX', 'SINGLE_SELECT', 'MULTI_SELECT'
]);

export const createFieldInput = z.object({
  formId: z.string().uuid(),
  label: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  type: fieldTypeEnum,
  isRequired: z.boolean().default(false),
  options: z.array(z.string()).optional().nullable(),
  index: z.number().describe("Fractional index for sorting"),
  
  userId: z.string().uuid().describe("Required to verify ownership of the form"),
});

export const updateFieldInput = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  type: fieldTypeEnum.optional(),
  isRequired: z.boolean().optional(),
  options: z.array(z.string()).optional().nullable(),
  index: z.number().optional(),
  
  userId: z.string().uuid().describe("Required to verify ownership"),
});

export const getFieldsInput = z.object({
  formId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const deleteFieldInput = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;
export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;
export type GetFieldsInputType = z.infer<typeof getFieldsInput>;
export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;