import { pgTable, uuid, varchar, timestamp, boolean, text, numeric, pgEnum, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { forsmTable } from "./forsm";
import { placeholder } from "drizzle-orm";
import { number } from "zod";

export const fieldTypeEnum = pgEnum("field_type_enum", ['TEXT', 'NUMBER', 'EMAIL', 'DATE', 'RADIO', 'CHECKBOX', 'SELECT', 'PASSWORD']);

export const formFieldsTable = pgTable("form_field", {
	id: uuid("id").primaryKey().defaultRandom(),
	formId: uuid("form_id").references(() => forsmTable.id),
	label: varchar("label", { length: 100 }).notNull(),
	labelKey: varchar("label_key", { length: 100 }).notNull(),
	description: text("description"),
	placeholder: text('placeholder'),
	type: fieldTypeEnum("type").notNull(),
	isRequired: boolean("is_required").default(false).notNull(),
	index: numeric("index", { scale: 2}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (table) => {
	return {
		uniqueFormIdAndIndex: unique("unique_form_id_and_index").on(table.formId, table.index), 
	};
});