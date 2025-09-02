import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateJobDescription(data: {
  title: string;
  department: string;
  experienceLevel: string;
  skills: string;
  culture: string;
}): Promise<{
  description: string;
  requirements: string;
  benefits: string;
}> {
  try {
    const prompt = `Create a comprehensive job description for the following role:

Title: ${data.title}
Department: ${data.department}
Experience Level: ${data.experienceLevel}
Required Skills: ${data.skills}
Company Culture & Benefits: ${data.culture}

Please provide a JSON response with the following structure:
{
  "description": "A compelling job description that includes role overview, key responsibilities, and what the candidate will work on",
  "requirements": "Detailed requirements including skills, experience, education, and qualifications",
  "benefits": "Attractive benefits package and company culture highlights that will attract top talent"
}

Make the content professional, engaging, and tailored to attract qualified candidates for this specific role.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional who creates compelling job descriptions that attract top talent. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      description: result.description || "",
      requirements: result.requirements || "",
      benefits: result.benefits || ""
    };
  } catch (error) {
    console.error("Error generating job description:", error);
    throw new Error("Failed to generate job description: " + (error as Error).message);
  }
}

export async function screenResume(resumeText: string, jobRequirements: string): Promise<{
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
}> {
  try {
    const prompt = `Analyze this resume against the job requirements and provide a detailed assessment:

RESUME:
${resumeText}

JOB REQUIREMENTS:
${jobRequirements}

Please provide a JSON response with the following structure:
{
  "score": 85,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "summary": "Brief assessment summary explaining the score and key findings"
}

Score should be 0-100 based on how well the candidate matches the requirements.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert talent acquisition specialist. Analyze resumes objectively and provide detailed assessments. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      matchedSkills: result.matchedSkills || [],
      missingSkills: result.missingSkills || [],
      summary: result.summary || ""
    };
  } catch (error) {
    console.error("Error screening resume:", error);
    throw new Error("Failed to screen resume: " + (error as Error).message);
  }
}

export async function analyzeBehavioralCues(responses: any[], responseTime: number): Promise<{
  traits: string[];
  confidence: number;
  summary: string;
}> {
  try {
    const prompt = `Analyze these assessment responses for behavioral cues and personality traits:

RESPONSES:
${JSON.stringify(responses, null, 2)}

AVERAGE RESPONSE TIME: ${responseTime} seconds

Please provide a JSON response with the following structure:
{
  "traits": ["trait1", "trait2", "trait3"],
  "confidence": 0.85,
  "summary": "Brief analysis of the candidate's behavioral patterns and personality traits"
}

Focus on communication style, problem-solving approach, teamwork indicators, and decision-making patterns.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert behavioral psychologist specializing in candidate assessment. Provide objective analysis based on response patterns. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      traits: result.traits || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      summary: result.summary || ""
    };
  } catch (error) {
    console.error("Error analyzing behavioral cues:", error);
    throw new Error("Failed to analyze behavioral cues: " + (error as Error).message);
  }
}

export async function generateCandidateSummary(candidate: any, assessments: any[], interviews: any[]): Promise<string> {
  try {
    const prompt = `Generate a comprehensive candidate summary for the hiring panel:

CANDIDATE PROFILE:
${JSON.stringify(candidate, null, 2)}

ASSESSMENTS:
${JSON.stringify(assessments, null, 2)}

INTERVIEWS:
${JSON.stringify(interviews, null, 2)}

Create a concise but comprehensive summary that highlights:
- Key strengths and qualifications
- Assessment results and behavioral insights
- Interview feedback and performance
- Overall recommendation and fit for the role

Keep it professional and actionable for hiring decision-makers.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert HR analyst who creates clear, actionable candidate summaries for hiring panels."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating candidate summary:", error);
    throw new Error("Failed to generate candidate summary: " + (error as Error).message);
  }
}

export async function handleHRQuery(query: string, context?: string): Promise<string> {
  try {
    const prompt = `You are an AI HR assistant. Answer this employee query professionally and helpfully:

QUERY: ${query}

${context ? `CONTEXT: ${context}` : ''}

Provide a clear, helpful response that addresses the employee's question. If you need more information, ask clarifying questions. If the query is outside your scope, direct them to the appropriate resource.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI HR assistant. Provide clear, professional responses to employee queries about policies, benefits, procedures, and general HR topics."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error handling HR query:", error);
    throw new Error("Failed to process HR query: " + (error as Error).message);
  }
}

export async function scoreAssessment(questions: any[], responses: any[]): Promise<{
  score: number;
  feedback: string[];
}> {
  try {
    const prompt = `Score this assessment based on the questions and responses:

QUESTIONS:
${JSON.stringify(questions, null, 2)}

RESPONSES:
${JSON.stringify(responses, null, 2)}

Please provide a JSON response with the following structure:
{
  "score": 85,
  "feedback": ["feedback1", "feedback2", "feedback3"]
}

Score should be 0-100 based on correctness, quality, and completeness of responses.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert assessment evaluator. Score responses objectively and provide constructive feedback. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      feedback: result.feedback || []
    };
  } catch (error) {
    console.error("Error scoring assessment:", error);
    throw new Error("Failed to score assessment: " + (error as Error).message);
  }
}
