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
  title: z.string().describe("Title of the created form"),
  visibility: z.enum(["PUBLIC", "UNLISTED"]).describe("Visibility mode of the form"),
  isPublished: z.boolean().describe("Whether the form is published"),
  slug: z.string().nullable().optional().describe("Custom URL slug of the form"),
});

export const getFormsInputModel = z.undefined();

export const getFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("Form ID"),
    title: z.string().describe("Title of the form"),
    description: z.string().nullable().optional().describe("Description of the form"),
    visibility: z.enum(["PUBLIC", "UNLISTED"]).describe("Visibility mode"),
    isPublished: z.boolean().describe("Whether the form is published"),
    theme: z.string().nullable().optional().describe("Theme used by the form"),
    slug: z.string().nullable().optional().describe("Custom URL slug"),
    createdAt: z.date().describe("Date when the form was created"),
  })
);

const fieldTypeEnum = z.enum([
  'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'EMAIL', 'DATE', 
  'RADIO', 'CHECKBOX', 'SINGLE_SELECT', 'MULTI_SELECT'
]).describe("Supported form field types");

export const fieldOutputModel = z.object({
  id: z.uuid().describe("Unique ID of the field"),
  formId: z.uuid().describe("ID of the form this field belongs to"),
  label: z.string().describe("Field label shown to users"),
  labelKey: z.string().describe("Internal label key"),
  description: z.string().nullable().describe("Description of the field"),
  placeholder: z.string().nullable().describe("Placeholder text for the field"),
  type: fieldTypeEnum.describe("Type of the form field"),
  isRequired: z.boolean().describe("Whether the field is required"),
  options: z.array(z.string()).nullable().describe("Selectable options for the field"),
  index: z.string().describe("Field order index returned as string from DB numeric"), // returned as string from DB numeric
});

export const createFieldTrpcInput = z.object({
  formId: z.uuid().describe("ID of the form"),
  label: z.string().min(1).max(255).describe("Field label"),
  description: z.string().optional().nullable().describe("Optional field description"),
  placeholder: z.string().optional().nullable().describe("Optional placeholder text"),
  type: fieldTypeEnum.describe("Type of field to create"),
  isRequired: z.boolean().default(false).describe("Whether the field is required"),
  options: z.array(z.string()).optional().nullable().describe("Selectable options for the field"),
  index: z.number().describe("Position index of the field"),
});

export const updateFieldTrpcInput = z.object({
  id: z.uuid().describe("ID of the field to update"),
  label: z.string().min(1).max(255).optional().describe("Updated field label"),
  description: z.string().optional().nullable().describe("Updated field description"),
  placeholder: z.string().optional().nullable().describe("Updated placeholder text"),
  type: fieldTypeEnum.optional().describe("Updated field type"),
  isRequired: z.boolean().optional().describe("Updated required state"),
  options: z.array(z.string()).optional().nullable().describe("Updated field options"),
  index: z.number().optional().describe("Updated field index"),
});

export const deleteFieldTrpcInput = z.object({
  id: z.uuid().describe("ID of the field to delete"),
});

export const getFieldsTrpcInput = z.object({
  formId: z.uuid().describe("ID of the form whose fields are requested"),
});

export const getPublicFormInputModel = z.object({
  id: z.string().uuid().describe("Public form ID"),
});

export const getPublicFormOutputModel = z.object({
  id: z.string().uuid().describe("Public form ID"),
  title: z.string().describe("Title of the form"),
  description: z.string().nullable().describe("Description of the form"),
  theme: z.string().nullable().describe("Theme of the form"),
  fields: z.array(fieldOutputModel).describe("List of form fields"), // Reuses the field schema we made earlier!
});

export const submitPublicFormInputModel = z.object({
  formId: z.string().uuid().describe("ID of the form being submitted"),
  // Frontend sends { "fieldId": "value" }, we accept broadly to parse it correctly
  values: z.record(
    z.string().describe("Field ID"),
    z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable().optional()
      .describe("Submitted field value")
  ).describe("Key-value map of submitted field responses"),
});

export const submitPublicFormOutputModel = z.object({
  id: z.string().uuid().describe("Submission ID"),
  success: z.boolean().describe("Whether the submission succeeded"),
});

export const getFormSubmissionsTrpcInput = z.object({
  formId: z.string().uuid().describe("ID of the form whose submissions are requested"),
});

const formSubmissionValueOutputSchema = z.object({
  formFieldId: z.string().uuid().describe("ID of the form field"),
  value: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .describe("Submitted value for the field"),
});

export const getFormSubmissionsTrpcOutput = z.array(
  z.object({
    id: z.string().uuid().describe("Submission ID"),
    formId: z.string().uuid().describe("ID of the submitted form"),
    values: z
      .array(formSubmissionValueOutputSchema)
      .nullable()
      .describe("List of submitted field values"),
    createdAt: z.date().describe("Date and time when the submission was created"),
  })
);