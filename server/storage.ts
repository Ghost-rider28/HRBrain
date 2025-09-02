import { 
  users, jobPostings, candidates, assessments, interviews, employees, 
  onboardingTasks, documents, reminders, chatMessages,
  type User, type InsertUser, type JobPosting, type InsertJobPosting,
  type Candidate, type InsertCandidate, type Assessment, type InsertAssessment,
  type Interview, type InsertInterview, type Employee, type InsertEmployee,
  type OnboardingTask, type InsertOnboardingTask, type Document, type InsertDocument,
  type Reminder, type InsertReminder, type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Job Postings
  getJobPostings(): Promise<JobPosting[]>;
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, data: Partial<InsertJobPosting>): Promise<JobPosting | undefined>;

  // Candidates
  getCandidates(jobPostingId?: number): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, data: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  getCandidatesByJobPosting(jobPostingId: number): Promise<Candidate[]>;

  // Assessments
  getAssessments(candidateId?: number): Promise<Assessment[]>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, data: Partial<InsertAssessment>): Promise<Assessment | undefined>;

  // Interviews
  getInterviews(): Promise<Interview[]>;
  getInterview(id: number): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, data: Partial<InsertInterview>): Promise<Interview | undefined>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined>;

  // Onboarding Tasks
  getOnboardingTasks(employeeId?: number): Promise<OnboardingTask[]>;
  createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask>;
  updateOnboardingTask(id: number, data: Partial<InsertOnboardingTask>): Promise<OnboardingTask | undefined>;

  // Documents
  getDocuments(category?: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;

  // Reminders
  getReminders(employeeId?: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, data: Partial<InsertReminder>): Promise<Reminder | undefined>;

  // Chat Messages
  getChatMessages(userId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }

  // Job Postings
  async getJobPostings(): Promise<JobPosting[]> {
    return await db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
  }

  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    const [jobPosting] = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
    return jobPosting || undefined;
  }

  async createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting> {
    const [created] = await db.insert(jobPostings).values([jobPosting]).returning();
    return created;
  }

  async updateJobPosting(id: number, data: Partial<InsertJobPosting>): Promise<JobPosting | undefined> {
    const [updated] = await db.update(jobPostings).set(data).where(eq(jobPostings.id, id)).returning();
    return updated || undefined;
  }

  // Candidates
  async getCandidates(jobPostingId?: number): Promise<Candidate[]> {
    if (jobPostingId) {
      return await db.select().from(candidates).where(eq(candidates.jobPostingId, jobPostingId)).orderBy(desc(candidates.skillMatchScore));
    }
    return await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || undefined;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [created] = await db.insert(candidates).values([candidate]).returning();
    return created;
  }

  async updateCandidate(id: number, data: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updated] = await db.update(candidates).set(data).where(eq(candidates.id, id)).returning();
    return updated || undefined;
  }

  async getCandidatesByJobPosting(jobPostingId: number): Promise<Candidate[]> {
    return await db.select().from(candidates).where(eq(candidates.jobPostingId, jobPostingId)).orderBy(desc(candidates.skillMatchScore));
  }

  // Assessments
  async getAssessments(candidateId?: number): Promise<Assessment[]> {
    if (candidateId) {
      return await db.select().from(assessments).where(eq(assessments.candidateId, candidateId)).orderBy(desc(assessments.createdAt));
    }
    return await db.select().from(assessments).orderBy(desc(assessments.createdAt));
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [created] = await db.insert(assessments).values([assessment]).returning();
    return created;
  }

  async updateAssessment(id: number, data: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const [updated] = await db.update(assessments).set(data).where(eq(assessments.id, id)).returning();
    return updated || undefined;
  }

  // Interviews
  async getInterviews(): Promise<Interview[]> {
    return await db.select().from(interviews).orderBy(desc(interviews.scheduledAt));
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview || undefined;
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [created] = await db.insert(interviews).values([interview]).returning();
    return created;
  }

  async updateInterview(id: number, data: Partial<InsertInterview>): Promise<Interview | undefined> {
    const [updated] = await db.update(interviews).set(data).where(eq(interviews.id, id)).returning();
    return updated || undefined;
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values([employee]).returning();
    return created;
  }

  async updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
    return updated || undefined;
  }

  // Onboarding Tasks
  async getOnboardingTasks(employeeId?: number): Promise<OnboardingTask[]> {
    if (employeeId) {
      return await db.select().from(onboardingTasks).where(eq(onboardingTasks.employeeId, employeeId)).orderBy(desc(onboardingTasks.createdAt));
    }
    return await db.select().from(onboardingTasks).orderBy(desc(onboardingTasks.createdAt));
  }

  async createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask> {
    const [created] = await db.insert(onboardingTasks).values([task]).returning();
    return created;
  }

  async updateOnboardingTask(id: number, data: Partial<InsertOnboardingTask>): Promise<OnboardingTask | undefined> {
    const [updated] = await db.update(onboardingTasks).set(data).where(eq(onboardingTasks.id, id)).returning();
    return updated || undefined;
  }

  // Documents
  async getDocuments(category?: string): Promise<Document[]> {
    if (category) {
      return await db.select().from(documents).where(eq(documents.category, category)).orderBy(desc(documents.createdAt));
    }
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [created] = await db.insert(documents).values([document]).returning();
    return created;
  }

  // Reminders
  async getReminders(employeeId?: number): Promise<Reminder[]> {
    if (employeeId) {
      return await db.select().from(reminders).where(eq(reminders.employeeId, employeeId)).orderBy(desc(reminders.dueDate));
    }
    return await db.select().from(reminders).orderBy(desc(reminders.dueDate));
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const [created] = await db.insert(reminders).values([reminder]).returning();
    return created;
  }

  async updateReminder(id: number, data: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const [updated] = await db.update(reminders).set(data).where(eq(reminders.id, id)).returning();
    return updated || undefined;
  }

  // Chat Messages
  async getChatMessages(userId?: string): Promise<ChatMessage[]> {
    if (userId) {
      return await db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(desc(chatMessages.createdAt));
    }
    return await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values([message]).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
