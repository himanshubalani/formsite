import { db, eq, and, asc } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formsTable } from "@repo/database/models/forms";
import { 
  createFieldInput, type CreateFieldInputType,
  updateFieldInput, type UpdateFieldInputType,
  deleteFieldInput, type DeleteFieldInputType,
  getFieldsInput, type GetFieldsInputType 
} from "./model";

class FormFieldService {
  /**
   * Helper: Verify user owns the form
   */
  private async verifyFormOwnership(formId: string, userId: string) {
    const form = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
      
    if (!form || form.length === 0) {
      throw new Error("Unauthorized: You do not own this form or it does not exist.");
    }
  }

  /**
   * Helper: Generate a safe, DB-friendly slug for labelKey
   */
  private generateLabelKey(label: string): string {
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
    const shortId = Math.random().toString(36).substring(2, 6);
    return `${slug}_${shortId}`;
  }

  public async createField(payload: CreateFieldInputType) {
    const data = await createFieldInput.parseAsync(payload);
    
    // 1. Verify Ownership
    await this.verifyFormOwnership(data.formId, data.userId);

    // 2. Generate slugified labelKey
    const labelKey = this.generateLabelKey(data.label);

    // 3. Insert Field
    const insertResult = await db.insert(formFieldsTable).values({
      formId: data.formId,
      label: data.label,
      labelKey: labelKey,
      description: data.description,
      placeholder: data.placeholder,
      type: data.type,
      isRequired: data.isRequired,
      options: data.options || null,
      index: data.index.toString(), // DB expects numeric/string
    }).returning();

    return insertResult[0]!;
  }

  public async getFields(payload: GetFieldsInputType) {
    const { formId, userId } = await getFieldsInput.parseAsync(payload);
    
    await this.verifyFormOwnership(formId, userId);

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.index)); // Sorted by fractional index!

    return fields;
  }

  public async updateField(payload: UpdateFieldInputType) {
    const data = await updateFieldInput.parseAsync(payload);

    // 1. Ensure the field exists and belongs to a form the user owns
    const existingField = await db
      .select({ formId: formFieldsTable.formId })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, data.id));

    if (!existingField.length) throw new Error("Field not found");
    await this.verifyFormOwnership(existingField[0]!.formId, data.userId);

    // 2. Update Field (Note: labelKey is explicitly NOT updated)
    const updateResult = await db.update(formFieldsTable).set({
      label: data.label,
      description: data.description,
      placeholder: data.placeholder,
      type: data.type,
      isRequired: data.isRequired,
      options: data.options || null,
      index: data.index ? data.index.toString() : undefined,
      updatedAt: new Date()
    }).where(eq(formFieldsTable.id, data.id)).returning();

    return updateResult[0]!;
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { id, userId } = await deleteFieldInput.parseAsync(payload);

    const existingField = await db
      .select({ formId: formFieldsTable.formId })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, id));

    if (!existingField.length) throw new Error("Field not found");
    await this.verifyFormOwnership(existingField[0]!.formId, userId);

    await db.delete(formFieldsTable).where(eq(formFieldsTable.id, id));
    
    return { success: true, id };
  }
}

export default FormFieldService;