import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createFormInputModel, createFormOutputModel } from "./model";
import { formService } from "../../services";

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
});