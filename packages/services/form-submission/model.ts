import { z } from "zod";

export const formSubmissionValueSchema = z.object({
  formFieldId: z.string().uuid(),
  value: z.union([z.string(), z.array(z.string())]).nullable(),
});

export const submitFormInput = z.object({
  formId: z.string().uuid(),
  values: z.array(formSubmissionValueSchema),
});

export type SubmitFormInputType = z.infer<typeof submitFormInput>;