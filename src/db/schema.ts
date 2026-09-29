import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";

/* ---------------------------------- Auth ---------------------------------- */

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  pinFails: integer("pin_fails").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  role: text("role").notNull(), // "student" | "teacher"
  studentId: integer("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* --------------------------------- Groups --------------------------------- */

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pin: text("pin").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  studentId: integer("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
});

/* ----------------------------- Learning progress ----------------------------- */

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(), // "video" | "modul" | "grafik"
  completedAt: timestamp("completed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* --------------------------------- Project --------------------------------- */

export type Ingredient = {
  name: string;
  unit: string;
  perA: number;
  perB: number;
  total: number;
};

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .unique()
    .references(() => groups.id, { onDelete: "cascade" }),
  productA: text("product_a").notNull(),
  productB: text("product_b").notNull(),
  ingredients: jsonb("ingredients").$type<Ingredient[]>().notNull(),
  timePerA: doublePrecision("time_per_a").notNull(),
  timePerAUnit: text("time_per_a_unit").notNull(),
  timePerB: doublePrecision("time_per_b").notNull(),
  timePerBUnit: text("time_per_b_unit").notNull(),
  totalTime: doublePrecision("total_time").notNull(),
  totalTimeUnit: text("total_time_unit").notNull(),
  priceA: integer("price_a").notNull(),
  costA: integer("cost_a").notNull(),
  priceB: integer("price_b").notNull(),
  costB: integer("cost_b").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inequalityAttempts = pgTable("inequality_attempts", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  answers: jsonb("answers").$type<string[]>().notNull(),
  results: jsonb("results").notNull(),
  allCorrect: boolean("all_correct").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  day: integer("day").notNull(),
  activity: text("activity").notNull(),
  obstacle: text("obstacle"),
  fileName: text("file_name"),
  fileType: text("file_type"),
  fileData: text("file_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name"),
  fileType: text("file_type"),
  fileData: text("file_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reflections = pgTable("reflections", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* --------------------------------- Teacher --------------------------------- */

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
