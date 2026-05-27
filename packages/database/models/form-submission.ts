import { pgTable, uuid, varchar, timestamp, boolean, text, numeric, pgEnum, unique, jsonb } from "drizzle-orm/pg-core";
import { formsTable } from "./forms";

export interface FormSubmissionValue {
	formFieldId: string;
	value: string | string[] | null;
}

export type FormSubmissionValueRow = FormSubmissionValue[]


export const formSubmissionTable = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => formsTable.id).notNull(),
  values: jsonb("values").$type<FormSubmissionValueRow>().notNull(), // Store form field values as JSONB
  

  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, );