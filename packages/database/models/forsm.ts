import { pgTable, uuid, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { is } from "drizzle-orm";
import { es } from "zod/v4/locales";

export const forsmTable = pgTable("forsm", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: varchar("title", { length: 255 }).notNull(),
	description: varchar("description", { length: 255 }).notNull(),
	createdBy: uuid("created_by").references(() => usersTable.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at"),
	espired: boolean("expired").default(false),
	expiredAt: timestamp("expired_at"),
});