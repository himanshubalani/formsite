import { pgTable, uuid, varchar, timestamp, boolean, text, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formVisibilityEnum = pgEnum("form_visibility_enum", ["PUBLIC", "UNLISTED"]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  visibility: formVisibilityEnum("visibility").default("PUBLIC").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  
  theme: varchar("theme", { length: 50 }).default("light"), 
  slug: varchar("slug", { length: 255 }).unique(),

  createdBy: uuid("created_by").references(() => usersTable.id).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  expired: boolean("expired").default(false),
  expiredAt: timestamp("expired_at"),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;