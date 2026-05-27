import { pgTable, uuid, varchar, timestamp, boolean, text, numeric, pgEnum, unique, jsonb } from "drizzle-orm/pg-core";
import { formsTable } from "./forms";

// Added LONG_TEXT and MULTI_SELECT as per hackathon requirements
export const fieldTypeEnum = pgEnum("field_type_enum", [
  'SHORT_TEXT', 
  'LONG_TEXT', 
  'NUMBER', 
  'EMAIL', 
  'DATE', 
  'RADIO', 
  'CHECKBOX', 
  'SINGLE_SELECT', 
  'MULTI_SELECT'
]);

export const formFieldsTable = pgTable("form_field", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => formsTable.id, { onDelete: 'cascade' }).notNull(),
  
  label: varchar("label", { length: 255 }).notNull(),
  labelKey: varchar("label_key", { length: 100 }).notNull(),
  description: text("description"),
  placeholder: text('placeholder'),
  
  type: fieldTypeEnum("type").notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  
  // Store options for selects/radios as an array of strings: e.g., ["Option 1", "Option 2"]
  options: jsonb("options").$type<string[]>(),
  
  index: numeric("index", { scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (table) => {
  return {
    uniqueFormIdAndIndex: unique("unique_form_id_and_index").on(table.formId, table.index), 
  };
});

export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;