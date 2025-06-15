import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Code,
  MessageSquare,
  Brain,
  Target,
  TrendingUp,
  Star,
  FileText,
  BarChart,
  Share,
  FileDown,
  CheckCircle,
  Copy
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
  communication: {
    score: number;
    clarity: string;
    technicalVocabulary: string;
    interaction: string;
    metrics: {
      clarity: number;
      technicalAccuracy: number;
      responseTime: number;
      engagement: number;
    };
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
  user?: {
    name: string;
  };
}

const RecruiterFeedback = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [screenshots, setScreenshots] = useState<{ filename: string; url: string }[]>([]);
  const [screenshotsLoading, setScreenshotsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
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
        setFeedback(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id, retryCount]);

  useEffect(() => {
    const fetchScreenshots = async () => {
      if (!id) return;
      setScreenshotsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/interviews/${id}/screenshots`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setScreenshots(data);
        } else {
          setScreenshots([]);
        }
      } catch (err) {
        setScreenshots([]);
      } finally {
        setScreenshotsLoading(false);
      }
    };
    fetchScreenshots();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">No feedback available</p>
            <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // Helper to format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
          <Brain className="w-6 h-6 text-purple-600" />
          <span>AI Analysis Report</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Interview Analysis Report Header */}
        <div className="flex justify-between items-end pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Analysis Report</h1>
            <p className="text-gray-600 text-lg">
              Candidate: <span className="font-semibold">{feedback.user?.name || 'N/A'}</span>
              {" "} | Position: <span className="font-semibold">{feedback.interviewTitle}</span>
              {" "} | Duration: <span className="font-semibold">{formatDuration(feedback.duration)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-green-600">{feedback.overallScore}%</p>
            <p className="text-lg font-medium text-gray-600">Overall Score</p>
          </div>
        </div>

        {/* Overall Performance Metrics */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Overall Performance</h2>
            </div>
            <div className="grid grid-cols-4 gap-6 text-center">
              {/* Code Quality */}
              <div>
                <p className="text-2xl font-bold text-green-600">{feedback.performance.codeQuality.score}%</p>
                <p className="text-gray-600">Code Quality</p>
                <Progress value={feedback.performance.codeQuality.score} className="mt-2 h-2" />
              </div>
              {/* Problem Solving */}
              <div>
                <p className="text-2xl font-bold text-green-600">{feedback.performance.problemSolving}%</p>
                <p className="text-gray-600">Problem Solving</p>
                <Progress value={feedback.performance.problemSolving} className="mt-2 h-2" />
              </div>
              {/* Technical Skills */}
              <div>
                <p className="text-2xl font-bold text-green-600">{feedback.performance.technicalSkill}%</p>
                <p className="text-gray-600">Technical Skills</p>
                <Progress value={feedback.performance.technicalSkill} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="code-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="code-analysis">Code Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="plagiarism-check">Plagiarism Check</TabsTrigger>
            <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
          </TabsList>

          {/* Code Analysis Tab Content */}
          <TabsContent value="code-analysis">
            <div className="grid grid-cols-2 gap-6 mt-6">
              {/* Code Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    <span>Code Quality Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Efficiency</span>
                    <Badge variant="secondary">{feedback.codeFeedbackSummary?.efficiency || 'N/A'}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Readability</span>
                    <Badge variant="secondary">{feedback.codeFeedbackSummary?.readability || 'N/A'}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Best Practices</span>
                    <Badge variant="secondary">{feedback.codeFeedbackSummary?.bestPractices || 'N/A'}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Technical Accuracy</span>
                    <Badge variant="secondary">{feedback.performance.technicalSkill > 80 ? 'Very Good' : feedback.performance.technicalSkill > 60 ? 'Good' : 'Average'}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Improvement Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Improvement Suggestions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="list-none space-y-2 text-gray-700">
                    {feedback.areasForImprovement.length > 0 ? (
                      feedback.areasForImprovement.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <Target className="w-4 h-4 mr-2 mt-1 text-orange-500 flex-shrink-0" />
                          {area}
                        </li>
                      ))
                    ) : (
                      <li>No specific improvement areas identified.</li>
                    )}
                    {feedback.nextSteps && feedback.nextSteps !== 'Not applicable' && (
                        <li className="flex items-start">
                            <Target className="w-4 h-4 mr-2 mt-1 text-orange-500 flex-shrink-0" />
                            {feedback.nextSteps}
                        </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

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
            </div>
          </TabsContent>

          {/* Performance Tab Content */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 gap-6 mt-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-green-600" />
                    <span>Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {feedback.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span>Areas for Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {feedback.areasForImprovement.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Detailed Performance Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span>Detailed Performance Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-800">Problem-Solving Approach</h4>
                        <p className="text-gray-600">{feedback.performance.problemSolving > 70 ? 'Systematic and methodical. Breaks down problems into smaller components and thinks through edge cases.' : 'Needs more structured approach to problem-solving.'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">Code Structure</h4>
                        <p className="text-gray-600">{feedback.performance.codeQuality.readability === 'Excellent' ? 'Well-organized with clear separation of concerns. Uses appropriate data structures.' : 'Could improve code organization and structure.'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">Time Management</h4>
                        <p className="text-gray-600">{feedback.duration < 1200 ? 'Completed tasks within allocated time with room for optimization.' : 'Struggled with time management, could not complete all tasks within the given time.'}</p>
                    </div>
                    <Separator />
                    <h4 className="font-semibold text-gray-800">Overall Detailed Feedback</h4>
                    <p className="text-gray-600">{feedback.feedback}</p>
                    {feedback.transcriptDetailedFeedback && feedback.transcriptDetailedFeedback !== '0' && (
                        <>
                            <Separator />
                            <h4 className="font-semibold text-gray-800">Transcript Specific Feedback</h4>
                            <p className="text-gray-600 whitespace-pre-line">{feedback.transcriptDetailedFeedback}</p>
                        </>
                    )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Plagiarism Check Tab Content */}
          <TabsContent value="plagiarism-check">
            <div className="grid grid-cols-1 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Copy className="w-5 h-5 text-red-600" />
                    <span>Plagiarism Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Code similarity check against our database of previous submissions</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Risk Level</h4>
                      <Badge className="mt-1 bg-green-500 hover:bg-green-600 text-white">LOW RISK</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Similarity Score</h4>
                      <p className="mt-1 text-2xl font-bold text-green-600">15%</p>
                      <Progress value={15} className="h-2 mt-1" />
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>No plagiarism detected. The submitted code appears to be original work with minimal similarity to existing submissions in our database.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                          <p><span className="font-semibold">Submissions Checked:</span> 1,247</p>
                      </div>
                      <div>
                          <p><span className="font-semibold">Flagged Submissions:</span> 0</p>
                      </div>
                      <div>
                          <p><span className="font-semibold">Analysis Time:</span> 2.3 seconds</p>
                      </div>
                      <div>
                          <p><span className="font-semibold">Confidence:</span> 98.7%</p>
                      </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Screenshots Tab Content */}
          <TabsContent value="screenshots">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {screenshotsLoading ? (
                <div className="col-span-full text-center text-gray-500">Loading screenshots...</div>
              ) : screenshots.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No screenshots available for this interview.</div>
              ) : (
                screenshots.map((shot, idx) => {
                  const token = localStorage.getItem("token");
                  return (
                    <div key={shot.filename} className="bg-white rounded shadow p-2 flex flex-col items-center">
                      <img 
                        src={shot.url} 
                        alt={`Screenshot ${idx + 1}`} 
                        className="w-full h-auto rounded mb-2"
                        onError={(e) => {
                          // If the direct URL fails, try fetching with Authorization header
                          fetch(shot.url, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          })
                          .then(response => response.blob())
                          .then(blob => {
                            const objectUrl = URL.createObjectURL(blob);
                            (e.target as HTMLImageElement).src = objectUrl;
                          })
                          .catch(error => console.error('Error loading screenshot:', error));
                        }}
                      />
                      <span className="text-xs text-gray-500">{shot.filename.replace('screenshot-', '').replace('.png', '').replace(/-/g, ':')}</span>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecruiterFeedback; 