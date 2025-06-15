import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Code, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowLeft,
  Loader2,
  Brain,
  Target,
  TrendingUp,
  MessageSquare,
  FileText,
  BarChart
} from "lucide-react";
import { format } from "date-fns";

interface PerformanceData {
  technicalSkill: number;
  codeQuality: {
    score: number;
    efficiency: string;
    readability: string;
    bestPractices: string;
  };
  problemSolving: number;
}

interface CodeFeedbackSummary {
  score: number;
  efficiency: string;
  readability: string;
  bestPractices: string;
  correctness?: string;
  testResults?: any[];
}

interface FeedbackData {
  interviewTitle: string;
  company: string;
  completedAt: string;
  duration: number;
  overallScore: number;
  performance: PerformanceData;
  codeFeedbackSummary: CodeFeedbackSummary;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  nextSteps: string;
  transcriptDetailedFeedback: string;
}

const CandidateFeedback = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/interviews/${id}/feedback`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404 && retryCount < 3) {
          // If feedback is not ready, retry after 5 seconds
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 5000);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }

        const data = await response.json();
        console.log("Feedback data:", data);
        setFeedback(data);
      } catch (err: any) {
        console.error('Feedback fetch error:', err);
        setError(err instanceof Error ? err.message : "Failed to load feedback");
        toast({
          title: "Error",
          description: "Failed to load feedback. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFeedback();
    }
  }, [id, token, toast, retryCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            {retryCount > 0 ? "Feedback is being generated..." : "Loading feedback..."}
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few moments. Retrying... ({retryCount}/3)
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Code className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Error Loading Feedback</h2>
              <p className="text-gray-600">
                {error || "Failed to load feedback. Please try again later."}
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';
  const isCandidate = user?.role === 'CANDIDATE';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRecruiter ? 'Interview Feedback Report' : 'Interview Complete!'}
          </h1>
          <p className="text-gray-600">
            {isRecruiter 
              ? 'Detailed analysis of the candidate\'s performance'
              : 'Thank you for participating in the coding interview'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Interview Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interview Summary - Show to both roles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Position</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{feedback.interviewTitle}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{feedback.company}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {Math.round(feedback.duration / 60)} minutes
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {feedback.completedAt ? format(new Date(feedback.completedAt), "PPP") : 'N/A'}
                </p>
              </div>
            </div>

            {/* Overall Score - Show to both roles */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-500">Overall Score</h3>
                <Badge className="text-lg font-semibold">
                  {feedback.overallScore}%
                </Badge>
              </div>
              <Progress value={feedback.overallScore} className="h-2" />
            </div>

            {/* Performance Breakdown - Show to both roles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Technical Skills</span>
                    <span className="text-sm font-medium">{feedback.performance.technicalSkill}%</span>
                  </div>
                  <Progress value={feedback.performance.technicalSkill} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Problem Solving</span>
                    <span className="text-sm font-medium">{feedback.performance.problemSolving}%</span>
                  </div>
                  <Progress value={feedback.performance.problemSolving} className="h-2" />
                </div>
              </div>
            </div>

            {/* Code Feedback Summary - Show to both roles */}
            {feedback.codeFeedbackSummary && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Code Quality Details</h3>
                
                {(() => {
                  const testResults = feedback.codeFeedbackSummary.testResults;
                  let passedTests = 0;
                  let totalTests = 0;
                  let codeQualityColorClass = "text-gray-600"; // Default color

                  if (testResults && Array.isArray(testResults)) {
                    totalTests = testResults.length;
                    passedTests = testResults.filter(test => test.passed === true).length;

                    if (totalTests > 0) {
                      if (passedTests === totalTests) {
                        codeQualityColorClass = "text-green-600"; // All passed
                      } else if (passedTests > 0) {
                        codeQualityColorClass = "text-orange-600"; // Some passed
                      } else {
                        codeQualityColorClass = "text-red-600"; // All failed
                      }
                    }
                  }

                  return (
                    <div className={codeQualityColorClass}>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Efficiency:</strong> {feedback.codeFeedbackSummary.efficiency}</li>
                        <li><strong>Readability:</strong> {feedback.codeFeedbackSummary.readability}</li>
                        <li><strong>Best Practices:</strong> {feedback.codeFeedbackSummary.bestPractices}</li>
                        {feedback.codeFeedbackSummary.correctness && (
                          <li><strong>Correctness:</strong> {feedback.codeFeedbackSummary.correctness}</li>
                        )}
                        {testResults && testResults.length > 0 && (
                          <li>
                            <strong>Test Cases:</strong> {passedTests}/{totalTests} passed
                            {testResults.map((test, index) => (
                              <div key={index} className="ml-4 text-sm">
                                Test {test.testCase}: {test.passed ? '✓' : '✗'} ({test.executionTime})
                              </div>
                            ))}
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Detailed Feedback - Show to both roles */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Feedback</h3>
              <p className="text-gray-600">{feedback.feedback}</p>
            </div>

            {/* Recruiter-only sections */}
            {isRecruiter && (
              <>
                {/* Transcript Analysis */}
                {feedback.transcriptDetailedFeedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span>Transcript Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 whitespace-pre-line">{feedback.transcriptDetailedFeedback}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Performance Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart className="w-5 h-5 text-green-600" />
                      <span>Performance Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Strengths */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">Key Strengths</h3>
                      <div className="flex flex-wrap gap-2">
                        {feedback.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        {feedback.areasForImprovement.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Steps */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
                      <p className="text-gray-600">{feedback.nextSteps}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span>Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Brain className="w-4 h-4 mr-2" />
                        Schedule Follow-up
                      </Button>
                      <Button variant="outline" size="sm">
                        <Target className="w-4 h-4 mr-2" />
                        Add to Candidate Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Share Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateFeedback;
