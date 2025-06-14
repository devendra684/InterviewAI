import { Badge } from "@/components/ui/badge";

interface Example { input: string; output: string; explanation?: string }
interface Problem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: Example[];
  constraints: string[];
}

const ProblemStatement = ({ problem }: { problem: Problem }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{problem.title}</h2>
      <Badge className="bg-green-100 text-green-800">{problem.difficulty}</Badge>
      <p className="text-gray-700">{problem.description}</p>

      <h3 className="text-lg font-semibold text-gray-800">Examples:</h3>
      {problem.examples.map((example: any, index: number) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
          <p className="font-mono text-sm text-gray-800 mb-1"><strong>Input:</strong> {example.input}</p>
          <p className="font-mono text-sm text-gray-800 mb-1"><strong>Output:</strong> {example.output}</p>
          {example.explanation && <p className="text-sm text-gray-600"><strong>Explanation:</strong> {example.explanation}</p>}
        </div>
      ))}

      <h3 className="text-lg font-semibold text-gray-800">Constraints:</h3>
      <ul className="list-disc list-inside text-gray-700">
        {problem.constraints.map((constraint: string, index: number) => (
          <li key={index}>{constraint}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemStatement; 