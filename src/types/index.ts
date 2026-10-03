export interface ResumeAnalysis {
  candidateName: string;
  summary: string;
  resumeScore: number;
  skills: { technical: string[]; nonTechnical: string[] };
  education: { degree: string; institution: string; year: string }[];
  experience: {
    role: string;
    company: string;
    duration: string;
    highlights: string[];
  }[];
  projects: { name: string; description: string; technologies: string[] }[];
  certifications: string[];
  weakStatements: { original: string; issue: string; suggestion: string }[];
  missingSkillsForTarget: string[];
  knowledgeMap: {
    sourceItem: string;
    mustKnowTopics: string[];
    sampleQuestions: string[];
  }[];
  resumeBasedInterviewQuestions: string[];
}

export interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  goals: string[];
  estimatedHours: number;
  status?: "locked" | "current" | "done";
}

export interface RoadmapPlan {
  targetCompany: string;
  targetRole: string;
  totalWeeks: number;
  weeks: RoadmapWeek[];
  companyInsightsNote: string;
}

export interface LessonContent {
  topic: string;
  notes: string;
  keyTakeaways: string[];
  mcqs: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  codingQuestions: {
    prompt: string;
    difficulty: "easy" | "medium" | "hard";
    hint: string;
  }[];
  interviewQuestions: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

export interface InterviewReport {
  overallScore: number;
  technicalKnowledge: { score: number; notes: string };
  communication: { score: number; notes: string };
  confidence: { score: number; notes: string };
  answerQuality: { score: number; notes: string };
  problemSolvingApproach: { score: number; notes: string };
  strengths: string[];
  areasForImprovement: string[];
  recommendedTopics: string[];
}
