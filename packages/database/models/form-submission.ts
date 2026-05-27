import { pgTable, uuid, varchar, timestamp, boolean, text, numeric, pgEnum, unique, json } from "drizzle-orm/pg-core";
import { formsTable } from "./forms";

export interface FormSubmissionValue {
	formFieldId: string;
	value: string | string[] | null;
}

export type FormSubmissionValueRow = FormSubmissionValue[]


export const formSubmissionTable = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => formsTable.id).notNull(),
  values: json("values").$type<FormSubmissionValueRow>(), // Store form field values as JSON

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, );