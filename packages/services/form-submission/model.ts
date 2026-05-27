import { z } from "zod";

export const formSubmissionValueSchema = z.object({
  formFieldId: z
    .string()
    .uuid()
    .describe("Unique identifier of the form field being submitted"),

  value: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .describe(
      "Submitted value for the field. Can be a string, array of strings, or null"
    ),
});

export const submitFormInput = z.object({
  formId: z
    .string()
    .uuid()
    .describe("Unique identifier of the form being submitted"),

  values: z
    .array(formSubmissionValueSchema)
    .describe("List of submitted field values for the form"),
});

export type SubmitFormInputType = z.infer<typeof submitFormInput>;

export const getFormSubmissionsInput = z.object({
  formId: z.string().uuid(),
  userId: z.string().uuid().describe("Required to verify ownership of the form"),
});

export type GetFormSubmissionsInputType = z.infer<typeof getFormSubmissionsInput>;