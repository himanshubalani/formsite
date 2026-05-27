import { db, eq, desc, asc } from "@repo/database";
import { formsTable } from "@repo/database/models/forms";
import { formFieldsTable } from "@repo/database/models/form-field";
import {
  type CreateFormInputType,
  createFormInput,
} from "./model";

class FormService {
  /**
   * Creates a new form in the database.
   * Relies on strict Zod validation before interacting with Drizzle.
   */
  public async createForm(payload: CreateFormInputType) {
    // 1. Validate incoming payload
    const {
      title,
      description,
      visibility,
      isPublished,
      theme,
      slug,
      userId,
    } = await createFormInput.parseAsync(payload);

    // 2. Insert form
    const formInsertResult = await db
      .insert(formsTable)
      .values({
        title,
        description,
        visibility,
        isPublished,
        theme,
        slug,
        createdBy: userId,
      })
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        visibility: formsTable.visibility,
        isPublished: formsTable.isPublished,
        slug: formsTable.slug,
      });

    const createdForm = formInsertResult[0];

    if (!createdForm) {
      throw new Error("Something went wrong while creating the form.");
    }

    // 3. Return clean object
    return {
      id: createdForm.id,
      title: createdForm.title,
      visibility: createdForm.visibility,
      isPublished: createdForm.isPublished,
      slug: createdForm.slug,
    };
  }

  /**
   * Fetches all forms created by a specific user.
   */
  public async getFormsByUserId(userId: string) {
    const forms = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId))
      .orderBy(desc(formsTable.createdAt));

    return forms.map((form) => ({
      id: form.id,
      title: form.title,
      description: form.description,
      visibility: form.visibility,
      isPublished: form.isPublished,
      theme: form.theme,
      slug: form.slug,
      createdAt: form.createdAt,
    }));
  }

  /**
   * Alias for getFormsByUserId
   */
  public async listFormsByUserId(userId: string) {
    return this.getFormsByUserId(userId);
  }

  /**
   * Fetches a public form and its fields.
   * Ensures the form exists, is published,
   * and has not expired.
   */
  public async getPublicFormById(formId: string) {
    // 1. Fetch form with joined fields
    const formResults = await db
      .select()
      .from(formsTable)
      .leftJoin(
        formFieldsTable,
        eq(formsTable.id, formFieldsTable.formId)
      )
      .where(eq(formsTable.id, formId))
      .orderBy(asc(formFieldsTable.index));

    if (formResults.length === 0) {
      throw new Error("Form not found");
    }

    // 2. Extract form safely from joined result
    const formData = formResults[0]?.forms;

    if (!formData) {
      throw new Error("Form not found");
    }

    // 3. Security checks
    if (!formData.isPublished) {
      throw new Error(
        "This form is currently not accepting responses."
      );
    }

    if (
      formData.expired &&
      formData.expiredAt &&
      new Date() > formData.expiredAt
    ) {
      throw new Error(
        "This form has expired and is no longer accepting responses."
      );
    }

    // 4. Extract and normalize fields
    const fields = formResults
      .map((row) => row.form_field)
      .filter((field): field is NonNullable<typeof field> => !!field);

    // 5. Return clean object
    return {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      theme: formData.theme,

      fields: fields.map((field) => ({
        id: field.id,
        formId: field.formId,
        label: field.label,
        labelKey: field.labelKey,
        description: field.description,
        placeholder: field.placeholder,
        type: field.type,
        isRequired: field.isRequired,
        options: field.options,
        index: field.index.toString(),
      })),
    };
  }
}

export default FormService;