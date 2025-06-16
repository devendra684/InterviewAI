export interface TestCase {
  input: string;
  expectedOutput: string;
  passed?: boolean;
  executionTime?: string;
  output?: string;
  error?: string;
  testCase?: number;
} 