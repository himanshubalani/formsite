import { and, db, desc, eq } from "@repo/database";
import { formSubmissionTable } from "@repo/database/models/form-submission";
import { formsTable } from "@repo/database/models/forms";
import { submitFormInput, type SubmitFormInputType,
	getFormSubmissionsInput, type GetFormSubmissionsInputType 
} from "./model";

class FormSubmissionService {
  public async submitForm(payload: SubmitFormInputType) {
    // 1. Validate incoming payload strictly
    const data = await submitFormInput.parseAsync(payload);

    // 2. Security Check: Form must exist, be published, and not expired
    const formResults = await db
      .select({ isPublished: formsTable.isPublished, expired: formsTable.expired, expiredAt: formsTable.expiredAt })
      .from(formsTable)
      .where(eq(formsTable.id, data.formId));

    const form = formResults[0];

    if (!form) {
      throw new Error("Form not found");
    }
    if (!form.isPublished) {
      throw new Error("This form is currently not accepting responses.");
    }
    if (form.expired && form.expiredAt && new Date() > form.expiredAt) {
      throw new Error("This form has expired and is no longer accepting responses.");
    }

    // 3. Insert into Database
    const insertResult = await db.insert(formSubmissionTable).values({
      formId: data.formId,
      values: data.values, // JSONB structure
    }).returning({ id: formSubmissionTable.id });

    // 4. Return Pass-by-Value
    return {
      id: insertResult[0]!.id,
    };
  }
 public async getFormSubmissions(payload: GetFormSubmissionsInputType) {
    // 1. Validate input strictly
    const { formId, userId } = await getFormSubmissionsInput.parseAsync(payload);

    // 2. Enforce Ownership: Verify the user actually owns this form
    const form = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

    if (!form || form.length === 0) {
      throw new Error("Unauthorized: You do not own this form or it does not exist.");
    }

    // 3. Fetch all submissions for this form, newest first
    const submissions = await db
      .select()
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(desc(formSubmissionTable.createdAt));

    // 4. Return Pass-by-Value mapping to prevent Prototype vulnerabilities
    return submissions.map((sub) => ({
      id: sub.id,
      formId: sub.formId,
      values: sub.values,
      createdAt: sub.createdAt,
    }));
  }
}

export default FormSubmissionService;