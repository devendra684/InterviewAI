import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

interface QuestionFormProps {
  onSubmit: (question: {
    title: string;
    description: string;
    difficulty: string;
    testCases: TestCase[];
  }) => void;
  initialData?: {
    title: string;
    description: string;
    difficulty: string;
    testCases: TestCase[];
  };
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'EASY');
  const [testCases, setTestCases] = useState<TestCase[]>(
    initialData?.testCases || [{ input: '', expectedOutput: '', hidden: false }]
  );

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', hidden: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string | boolean) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setTestCases(newTestCases);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      difficulty,
      testCases: testCases.filter(tc => tc.input && tc.expectedOutput)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter question title"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter question description"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Test Case {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTestCase(index)}
                    disabled={testCases.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Input</label>
                    <Input
                      value={testCase.input}
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      placeholder="Enter test input"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm">Expected Output</label>
                    <Input
                      value={testCase.expectedOutput}
                      onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                      placeholder="Enter expected output"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`hidden-${index}`}
                    checked={testCase.hidden}
                    onChange={(e) => handleTestCaseChange(index, 'hidden', e.target.checked)}
                  />
                  <label htmlFor={`hidden-${index}`} className="text-sm">
                    Hide this test case from candidates
                  </label>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTestCase}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Test Case
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        {initialData ? 'Update Question' : 'Create Question'}
      </Button>
    </form>
  );
};

export default QuestionForm; 