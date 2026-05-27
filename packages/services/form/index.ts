import { db, eq, desc} from "@repo/database";
import { formsTable } from "@repo/database/models/forms";
import { type CreateFormInputType, createFormInput } from "./model";

class FormService {
  /**
   * Creates a new form in the database.
   * Relies on strict Zod validation before interacting with Drizzle.
   */
  public async createForm(payload: CreateFormInputType) {
    // 1. Zod Validation Layer (First line of defense)
    const { 
      title, 
      description, 
      visibility, 
      isPublished, 
      theme, 
      slug, 
      userId 
    } = await createFormInput.parseAsync(payload);

    // TODO: If you want custom slugs, you might want a private helper here 
    // to check if `slug` already exists in the database and throw an error.

    // 2. Database Layer 
    const formInsertResult = await db
      .insert(formsTable)
      .values({
        title,
        description,
        visibility,
        isPublished,
        theme,
        slug,
        createdBy: userId, // Mapping userId to createdBy foreign key
      })
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        visibility: formsTable.visibility,
        isPublished: formsTable.isPublished,
        slug: formsTable.slug,
      });

    if (!formInsertResult || formInsertResult.length === 0 || !formInsertResult[0]?.id) {
      throw new Error("Something went wrong while creating the Form");
    }

    const createdForm = formInsertResult[0]!;

    // 3. Pass-by-value return (Prevents prototype pollution)
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
      .orderBy(desc(formsTable.createdAt)); // Newest forms first

    // Pass-by-value return to prevent prototype pollution
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

public async listFormsByUserId(userId: string) {
    const forms = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId))
      .orderBy(desc(formsTable.createdAt));

    // Pass-by-value return
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
}

export default FormService;