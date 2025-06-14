import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

interface TestCase {
  id?: string; // id is optional as it might not be present when creating new test cases
  input: string;
  expectedOutput: string;
}

interface TestCasesProps {
  testCases: TestCase[];
  // results?: any[];   // remove until actually needed
}

const TestCases: React.FC<TestCasesProps> = ({ testCases, results = [] }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Test Cases</Typography>
      {testCases.length === 0 ? (
        <Typography variant="body2" color="textSecondary">No test cases available.</Typography>
      ) : (
        testCases.map((testCase, index) => (
          <Card key={testCase.id || index} sx={{ mb: 2, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Input:</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{testCase.input}</Typography>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>Expected Output:</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{testCase.expectedOutput}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default TestCases; 