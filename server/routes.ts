import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertJobPostingSchema, insertCandidateSchema, insertAssessmentSchema,
  insertInterviewSchema, insertEmployeeSchema, insertOnboardingTaskSchema,
  insertDocumentSchema, insertReminderSchema, insertChatMessageSchema
} from "@shared/schema";
import { 
  generateJobDescription, screenResume, analyzeBehavioralCues, 
  generateCandidateSummary, handleHRQuery, scoreAssessment 
} from "./openai";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    const userId = req.url?.split('?userId=')[1];
    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'chat') {
          // Handle AI chat response
          const response = await handleHRQuery(message.content);
          
          // Save chat message
          await storage.createChatMessage({
            userId: message.userId,
            message: message.content,
            response: response,
            type: 'support'
          });

          // Send response back
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'chat_response',
              content: response,
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // ==================== HIRING & RECRUITMENT ENDPOINTS ====================

  // Generate job description with AI
  app.post('/api/recruitment/generate-jd', async (req, res) => {
    try {
      const { title, department, experienceLevel, skills, culture } = req.body;
      
      if (!title || !department || !experienceLevel || !skills) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const result = await generateJobDescription({
        title,
        department,
        experienceLevel,
        skills,
        culture: culture || ''
      });

      res.json(result);
    } catch (error) {
      console.error('Error generating job description:', error);
      res.status(500).json({ message: 'Failed to generate job description' });
    }
  });

  // Create job posting
  app.post('/api/recruitment/job-postings', async (req, res) => {
    try {
      const validatedData = insertJobPostingSchema.parse(req.body);
      const jobPosting = await storage.createJobPosting(validatedData);
      res.json(jobPosting);
    } catch (error) {
      console.error('Error creating job posting:', error);
      res.status(400).json({ message: 'Invalid job posting data' });
    }
  });

  // Get job postings
  app.get('/api/recruitment/job-postings', async (req, res) => {
    try {
      const jobPostings = await storage.getJobPostings();
      res.json(jobPostings);
    } catch (error) {
      console.error('Error fetching job postings:', error);
      res.status(500).json({ message: 'Failed to fetch job postings' });
    }
  });

  // Get job posting by ID
  app.get('/api/recruitment/job-postings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobPosting = await storage.getJobPosting(id);
      
      if (!jobPosting) {
        return res.status(404).json({ message: 'Job posting not found' });
      }

      res.json(jobPosting);
    } catch (error) {
      console.error('Error fetching job posting:', error);
      res.status(500).json({ message: 'Failed to fetch job posting' });
    }
  });

  // Screen resume with AI
  app.post('/api/recruitment/screen-resume', upload.single('resume'), async (req, res) => {
    try {
      const { jobPostingId, candidateName, candidateEmail, candidatePhone } = req.body;
      
      if (!req.file || !jobPostingId || !candidateName || !candidateEmail) {
        return res.status(400).json({ message: 'Missing required fields or resume file' });
      }

      // Get job posting for requirements
      const jobPosting = await storage.getJobPosting(parseInt(jobPostingId));
      if (!jobPosting) {
        return res.status(404).json({ message: 'Job posting not found' });
      }

      // For demo purposes, we'll simulate resume text extraction
      // In production, you'd use a PDF parsing library like pdf-parse
      const resumeText = `Sample resume text for ${candidateName}. This would be extracted from the uploaded PDF file.`;

      // Screen resume with AI
      const screeningResult = await screenResume(resumeText, jobPosting.requirements);

      // Create candidate record
      const candidate = await storage.createCandidate({
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        resumeUrl: req.file.path,
        resumeText: resumeText,
        jobPostingId: parseInt(jobPostingId),
        skillMatchScore: screeningResult.score,
        tags: screeningResult.matchedSkills,
        notes: screeningResult.summary
      });

      res.json({
        candidate,
        screening: screeningResult
      });
    } catch (error) {
      console.error('Error screening resume:', error);
      res.status(500).json({ message: 'Failed to screen resume' });
    }
  });

  // Get ranked candidates for a job posting
  app.get('/api/recruitment/rank-candidates/:jobPostingId', async (req, res) => {
    try {
      const jobPostingId = parseInt(req.params.jobPostingId);
      const candidates = await storage.getCandidatesByJobPosting(jobPostingId);
      res.json(candidates);
    } catch (error) {
      console.error('Error ranking candidates:', error);
      res.status(500).json({ message: 'Failed to rank candidates' });
    }
  });

  // Schedule interview
  app.post('/api/recruitment/schedule-interview', async (req, res) => {
    try {
      const validatedData = insertInterviewSchema.parse(req.body);
      const interview = await storage.createInterview(validatedData);
      res.json(interview);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      res.status(400).json({ message: 'Invalid interview data' });
    }
  });

  // Generate candidate summary
  app.get('/api/recruitment/candidate-summary/:candidateId', async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      
      const candidate = await storage.getCandidate(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }

      const assessments = await storage.getAssessments(candidateId);
      const interviews = await storage.getInterviews();
      const candidateInterviews = interviews.filter(i => i.candidateId === candidateId);

      const summary = await generateCandidateSummary(candidate, assessments, candidateInterviews);
      
      res.json({ summary });
    } catch (error) {
      console.error('Error generating candidate summary:', error);
      res.status(500).json({ message: 'Failed to generate candidate summary' });
    }
  });

  // ==================== CANDIDATE EVALUATION ENDPOINTS ====================

  // Send assessment test
  app.post('/api/evaluation/send-test', async (req, res) => {
    try {
      const { candidateId, testType, questions } = req.body;
      
      if (!candidateId || !testType || !questions) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const assessment = await storage.createAssessment({
        candidateId: parseInt(candidateId),
        testType,
        questions,
        responses: []
      });

      // In production, you would send email with test link here
      
      res.json(assessment);
    } catch (error) {
      console.error('Error sending assessment:', error);
      res.status(500).json({ message: 'Failed to send assessment' });
    }
  });

  // Submit and score assessment
  app.post('/api/evaluation/score-test', async (req, res) => {
    try {
      const { assessmentId, responses, responseTime } = req.body;
      
      if (!assessmentId || !responses) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const assessment = await storage.getAssessment(parseInt(assessmentId));
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      // Score with AI
      const scoringResult = await scoreAssessment(assessment.questions, responses);
      
      // Analyze behavioral cues
      const behavioralAnalysis = await analyzeBehavioralCues(responses, responseTime || 0);

      // Update assessment
      const updatedAssessment = await storage.updateAssessment(parseInt(assessmentId), {
        responses,
        score: scoringResult.score,
        responseTime: responseTime || 0,
        behavioralCues: behavioralAnalysis.traits,
        completedAt: new Date()
      });

      // Get candidate and update tags
      const candidate = await storage.getCandidate(assessment.candidateId);
      if (candidate) {
        await storage.updateCandidate(assessment.candidateId, {
          tags: [...(candidate.tags || []), ...behavioralAnalysis.traits]
        });
      }

      res.json({
        assessment: updatedAssessment,
        scoring: scoringResult,
        behavioral: behavioralAnalysis
      });
    } catch (error) {
      console.error('Error scoring assessment:', error);
      res.status(500).json({ message: 'Failed to score assessment' });
    }
  });

  // Get assessments
  app.get('/api/evaluation/assessments', async (req, res) => {
    try {
      const candidateId = req.query.candidateId ? parseInt(req.query.candidateId as string) : undefined;
      const assessments = await storage.getAssessments(candidateId);
      res.json(assessments);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      res.status(500).json({ message: 'Failed to fetch assessments' });
    }
  });

  // ==================== ONBOARDING ENDPOINTS ====================

  // Start onboarding process
  app.post('/api/onboarding/start', async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);

      // Create default onboarding tasks
      const defaultTasks = [
        { taskType: 'welcome_kit', title: 'Send Welcome Kit', description: 'Email welcome package and company information' },
        { taskType: 'system_setup', title: 'System Account Setup', description: 'Create email, Slack, and HRMS accounts' },
        { taskType: 'documentation', title: 'Complete Documentation', description: 'Fill out required HR forms and policies' },
        { taskType: 'orientation', title: 'Schedule Orientation', description: 'Attend company orientation and team introductions' },
        { taskType: 'equipment', title: 'Equipment Setup', description: 'Receive and configure work equipment' }
      ];

      for (const task of defaultTasks) {
        await storage.createOnboardingTask({
          employeeId: employee.id,
          ...task
        });
      }

      res.json(employee);
    } catch (error) {
      console.error('Error starting onboarding:', error);
      res.status(400).json({ message: 'Invalid employee data' });
    }
  });

  // Get onboarding tasks
  app.get('/api/onboarding/tasks', async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const tasks = await storage.getOnboardingTasks(employeeId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching onboarding tasks:', error);
      res.status(500).json({ message: 'Failed to fetch onboarding tasks' });
    }
  });

  // Update onboarding task
  app.patch('/api/onboarding/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const task = await storage.updateOnboardingTask(id, updateData);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error updating onboarding task:', error);
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  // Get employees
  app.get('/api/onboarding/employees', async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Failed to fetch employees' });
    }
  });

  // ==================== EMPLOYEE SUPPORT ENDPOINTS ====================

  // Handle FAQ query
  app.post('/api/support/faq', async (req, res) => {
    try {
      const { query, userId } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: 'Query is required' });
      }

      const response = await handleHRQuery(query);
      
      // Save chat message
      await storage.createChatMessage({
        userId,
        message: query,
        response,
        type: 'support'
      });

      res.json({ response });
    } catch (error) {
      console.error('Error handling FAQ:', error);
      res.status(500).json({ message: 'Failed to process query' });
    }
  });

  // Get documents
  app.get('/api/support/documents', async (req, res) => {
    try {
      const category = req.query.category as string;
      const documents = await storage.getDocuments(category);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  // Create document
  app.post('/api/support/documents', async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(400).json({ message: 'Invalid document data' });
    }
  });

  // Get reminders
  app.get('/api/support/reminders', async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const reminders = await storage.getReminders(employeeId);
      res.json(reminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      res.status(500).json({ message: 'Failed to fetch reminders' });
    }
  });

  // Create reminder
  app.post('/api/support/reminders', async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(validatedData);
      res.json(reminder);
    } catch (error) {
      console.error('Error creating reminder:', error);
      res.status(400).json({ message: 'Invalid reminder data' });
    }
  });

  // Get chat messages
  app.get('/api/support/chat-messages', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ message: 'Failed to fetch chat messages' });
    }
  });

  // ==================== DASHBOARD ENDPOINTS ====================

  // Get dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      const interviews = await storage.getInterviews();
      const employees = await storage.getEmployees();
      const chatMessages = await storage.getChatMessages();

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newHiresThisMonth = employees.filter(emp => {
        const startDate = new Date(emp.startDate);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      }).length;

      const todayMessages = chatMessages.filter(msg => {
        const msgDate = new Date(msg.createdAt!);
        const today = new Date();
        return msgDate.toDateString() === today.toDateString();
      }).length;

      const stats = {
        activeCandidates: candidates.filter(c => c.status === 'applied' || c.status === 'screening').length,
        scheduledInterviews: interviews.filter(i => i.status === 'scheduled').length,
        newHires: newHiresThisMonth,
        aiQueries: todayMessages
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // Get candidates
  app.get('/api/candidates', async (req, res) => {
    try {
      const jobPostingId = req.query.jobPostingId ? parseInt(req.query.jobPostingId as string) : undefined;
      const candidates = await storage.getCandidates(jobPostingId);
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ message: 'Failed to fetch candidates' });
    }
  });

  // Get interviews
  app.get('/api/interviews', async (req, res) => {
    try {
      const interviews = await storage.getInterviews();
      res.json(interviews);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      res.status(500).json({ message: 'Failed to fetch interviews' });
    }
  });

  return httpServer;
}
