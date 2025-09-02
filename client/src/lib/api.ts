import { apiRequest } from "./queryClient";

export interface JobDescriptionData {
  title: string;
  department: string;
  experienceLevel: string;
  skills: string;
  culture: string;
}

export interface JobDescriptionResult {
  description: string;
  requirements: string;
  benefits: string;
}

export interface DashboardStats {
  activeCandidates: number;
  scheduledInterviews: number;
  newHires: number;
  aiQueries: number;
}

export const api = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiRequest('GET', '/api/dashboard/stats');
    return await response.json();
  },

  // Hiring & Recruitment
  generateJobDescription: async (data: JobDescriptionData): Promise<JobDescriptionResult> => {
    const response = await apiRequest('POST', '/api/recruitment/generate-jd', data);
    return await response.json();
  },

  createJobPosting: async (data: any) => {
    const response = await apiRequest('POST', '/api/recruitment/job-postings', data);
    return await response.json();
  },

  getJobPostings: async () => {
    const response = await apiRequest('GET', '/api/recruitment/job-postings');
    return await response.json();
  },

  getJobPosting: async (id: number) => {
    const response = await apiRequest('GET', `/api/recruitment/job-postings/${id}`);
    return await response.json();
  },

  screenResume: async (formData: FormData) => {
    const response = await fetch('/api/recruitment/screen-resume', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to screen resume');
    }
    return await response.json();
  },

  getRankedCandidates: async (jobPostingId: number) => {
    const response = await apiRequest('GET', `/api/recruitment/rank-candidates/${jobPostingId}`);
    return await response.json();
  },

  scheduleInterview: async (data: any) => {
    const response = await apiRequest('POST', '/api/recruitment/schedule-interview', data);
    return await response.json();
  },

  getCandidateSummary: async (candidateId: number) => {
    const response = await apiRequest('GET', `/api/recruitment/candidate-summary/${candidateId}`);
    return await response.json();
  },

  // Candidate Evaluation
  sendAssessment: async (data: any) => {
    const response = await apiRequest('POST', '/api/evaluation/send-test', data);
    return await response.json();
  },

  scoreAssessment: async (data: any) => {
    const response = await apiRequest('POST', '/api/evaluation/score-test', data);
    return await response.json();
  },

  getAssessments: async (candidateId?: number) => {
    const url = candidateId ? `/api/evaluation/assessments?candidateId=${candidateId}` : '/api/evaluation/assessments';
    const response = await apiRequest('GET', url);
    return await response.json();
  },

  // Onboarding
  startOnboarding: async (data: any) => {
    const response = await apiRequest('POST', '/api/onboarding/start', data);
    return await response.json();
  },

  getOnboardingTasks: async (employeeId?: number) => {
    const url = employeeId ? `/api/onboarding/tasks?employeeId=${employeeId}` : '/api/onboarding/tasks';
    const response = await apiRequest('GET', url);
    return await response.json();
  },

  updateOnboardingTask: async (id: number, data: any) => {
    const response = await apiRequest('PATCH', `/api/onboarding/tasks/${id}`, data);
    return await response.json();
  },

  getEmployees: async () => {
    const response = await apiRequest('GET', '/api/onboarding/employees');
    return await response.json();
  },

  // Employee Support
  askFAQ: async (data: any) => {
    const response = await apiRequest('POST', '/api/support/faq', data);
    return await response.json();
  },

  getDocuments: async (category?: string) => {
    const url = category ? `/api/support/documents?category=${category}` : '/api/support/documents';
    const response = await apiRequest('GET', url);
    return await response.json();
  },

  createDocument: async (data: any) => {
    const response = await apiRequest('POST', '/api/support/documents', data);
    return await response.json();
  },

  getReminders: async (employeeId?: number) => {
    const url = employeeId ? `/api/support/reminders?employeeId=${employeeId}` : '/api/support/reminders';
    const response = await apiRequest('GET', url);
    return await response.json();
  },

  createReminder: async (data: any) => {
    const response = await apiRequest('POST', '/api/support/reminders', data);
    return await response.json();
  },

  getChatMessages: async (userId?: string) => {
    const url = userId ? `/api/support/chat-messages?userId=${userId}` : '/api/support/chat-messages';
    const response = await apiRequest('GET', url);
    return await response.json();
  },

  // General
  getCandidates: async (jobPostingId?: number) => {
    const url = jobPostingId ? `/api/candidates?jobPostingId=${jobPostingId}` : '/api/candidates';
    const response = await apiRequest('GET', url);
    return await response.json();
  },

  getInterviews: async () => {
    const response = await apiRequest('GET', '/api/interviews');
    return await response.json();
  },
};
