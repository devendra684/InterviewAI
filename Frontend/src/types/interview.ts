export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  testCases: TestCase[];
}

export interface Interview {
  id: string;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  questions: Question[];
  interviewerId: string;
  candidateId: string;
  status: string;
} 