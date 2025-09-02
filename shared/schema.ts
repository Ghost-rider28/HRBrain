import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("hr_manager"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department: text("department").notNull(),
  experienceLevel: text("experience_level").notNull(),
  skills: jsonb("skills").notNull().$type<string[]>(),
  requirements: text("requirements").notNull(),
  benefits: text("benefits"),
  status: text("status").notNull().default("active"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  resumeText: text("resume_text"),
  jobPostingId: integer("job_posting_id").references(() => jobPostings.id),
  status: text("status").notNull().default("applied"),
  skillMatchScore: integer("skill_match_score"),
  tags: jsonb("tags").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  testType: text("test_type").notNull(),
  questions: jsonb("questions").notNull().$type<any[]>(),
  responses: jsonb("responses").$type<any[]>(),
  score: integer("score"),
  responseTime: integer("response_time"),
  behavioralCues: jsonb("behavioral_cues").$type<string[]>(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  interviewerId: varchar("interviewer_id").notNull().references(() => users.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  feedback: jsonb("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").references(() => candidates.id),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  startDate: timestamp("start_date").notNull(),
  status: text("status").notNull().default("onboarding"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const onboardingTasks = pgTable("onboarding_tasks", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  taskType: text("task_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  fileUrl: text("file_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  type: text("type").notNull().default("support"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobPostings: many(jobPostings),
  interviews: many(interviews),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [jobPostings.createdBy],
    references: [users.id],
  }),
  candidates: many(candidates),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  jobPosting: one(jobPostings, {
    fields: [candidates.jobPostingId],
    references: [jobPostings.id],
  }),
  assessments: many(assessments),
  interviews: many(interviews),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  candidate: one(candidates, {
    fields: [assessments.candidateId],
    references: [candidates.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  candidate: one(candidates, {
    fields: [interviews.candidateId],
    references: [candidates.id],
  }),
  interviewer: one(users, {
    fields: [interviews.interviewerId],
    references: [users.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [employees.candidateId],
    references: [candidates.id],
  }),
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  onboardingTasks: many(onboardingTasks),
}));

export const onboardingTasksRelations = relations(onboardingTasks, ({ one }) => ({
  employee: one(employees, {
    fields: [onboardingTasks.employeeId],
    references: [employees.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  employee: one(employees, {
    fields: [reminders.employeeId],
    references: [employees.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingTaskSchema = createInsertSchema(onboardingTasks).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type OnboardingTask = typeof onboardingTasks.$inferSelect;
export type InsertOnboardingTask = z.infer<typeof insertOnboardingTaskSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
