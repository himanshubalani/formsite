import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFormInputModel,
  createFormOutputModel,
  getFormsInputModel,
  getFormsOutputModel,
  createFieldTrpcInput,
  updateFieldTrpcInput,
  deleteFieldTrpcInput,
  getFieldsTrpcInput,
  fieldOutputModel,
  getPublicFormInputModel,
  getPublicFormOutputModel,
  submitPublicFormInputModel,
  submitPublicFormOutputModel,
  getFormSubmissionsTrpcInput,
  getFormSubmissionsTrpcOutput,
} from "./model";
import { formService, formFieldService, formSubmissionService } from "../../services";
import { z } from "zod";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      // 1. Get the securely verified userId from context
      const userId = ctx.user.id;

      // 2. Call the service layer with the injected userId
      const form = await formService.createForm({
        ...input,
        userId,
      });

      // 3. Return the pass-by-value object (Zod output model strictly validates this)
      return {
        id: form.id,
        title: form.title,
        visibility: form.visibility,
        isPublished: form.isPublished,
        slug: form.slug,
      };
    }),

  getForms: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getForms"),
        tags: TAGS,
      },
    })
    .input(getFormsInputModel)
    .output(getFormsOutputModel)
    .query(async ({ ctx }) => {
      // 1. Extract secure userId from context
      const userId = ctx.user.id;

      // 2. Fetch from service
      const forms = await formService.getFormsByUserId(userId);

      // 3. Return clean data (Zod validates it against getFormsOutputModel)
      return forms;
    }),
  createField: authenticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/createField"), tags: TAGS, protect: true } })
    .input(createFieldTrpcInput)
    .output(fieldOutputModel)
    .mutation(async ({ input, ctx }) => {
      const field = await formFieldService.createField({
        ...input,
        userId: ctx.user.id,
      });
      return field;
    }),

  getFields: authenticatedProcedure //This must be public
    .meta({ openapi: { method: "GET", path: getPath("/getFields"), tags: TAGS, protect: true } })
    .input(getFieldsTrpcInput)
    .output(z.array(fieldOutputModel))
    .query(async ({ input, ctx }) => {
      const fields = await formFieldService.getFields({
        formId: input.formId,
        userId: ctx.user.id,
      });
      return fields;
    }),

  updateField: authenticatedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/updateField"), tags: TAGS, protect: true },
    })
    .input(updateFieldTrpcInput)
    .output(fieldOutputModel)
    .mutation(async ({ input, ctx }) => {
      const field = await formFieldService.updateField({
        ...input,
        userId: ctx.user.id,
      });
      return field;
    }),

  deleteField: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/deleteField"), tags: TAGS, protect: true },
    })
    .input(deleteFieldTrpcInput)
    .output(z.object({ success: z.boolean(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await formFieldService.deleteField({
        id: input.id,
        userId: ctx.user.id,
      });
      return result;
    }),

  // Public endpoint for respondents to view the form
  getPublicForm: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/public/{id}"), tags: TAGS },
    })
    .input(getPublicFormInputModel)
    .output(getPublicFormOutputModel)
    .query(async ({ input }) => {
      const form = await formService.getPublicFormById(input.id);
      return form;
    }),
  // Public endpoint to submit form responses
  submitPublicForm: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/public/{formId}/submit"), tags: TAGS },
    })
    .input(submitPublicFormInputModel)
    .output(submitPublicFormOutputModel)
    .mutation(async ({ input }) => {
      // 1. Transform the generic frontend dictionary `{ fieldId: value }`
      // into the strict array the database expects `[{ formFieldId, value }]`
      const formattedValues = Object.entries(input.values).map(([formFieldId, rawValue]) => {
        let value: string | string[] | null = null;
        if (Array.isArray(rawValue)) {
          value = rawValue.map(String);
        } else if (rawValue !== null && rawValue !== undefined) {
          value = String(rawValue);
        }
        return { formFieldId, value };
      });

      // 2. Pass to service layer
      const result = await formSubmissionService.submitForm({
        formId: input.formId,
        values: formattedValues,
      });

      // 3. Return sanitized data
      return {
        id: result.id,
        success: true,
      };
    }),

	getFormSubmissions: authenticatedProcedure
    .meta({
      openapi: { 
        method: "GET", 
        path: getPath("/getSubmissions"), 
        tags: TAGS, 
        protect: true 
      },
    })
    .input(getFormSubmissionsTrpcInput)
    .output(getFormSubmissionsTrpcOutput)
    .query(async ({ input, ctx }) => {
      // 1. Pass the formId and the authenticated userId to the service layer
      const submissions = await formSubmissionService.getFormSubmissions({
        formId: input.formId,
        userId: ctx.user.id,
      });

      // 2. Return the data (Zod strictly validates and strips invalid data here)
      return submissions;
    }),
});
