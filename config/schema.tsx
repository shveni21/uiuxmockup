import { date, integer, json, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(5),
});

export const ProjectTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar({ length: 255 }).notNull(),
  userInput: varchar({ length: 255 }),
  device: varchar(),
  createdOn: date().defaultNow(),
  config: json(),
  userId: varchar()
    .references(() => usersTable.email)
    .notNull(),
});
