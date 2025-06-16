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

interface CodeQuality {
  efficiency: string;
  readability: string;
  bestPractices: string;
  correctness: string;
}

interface CodeFeedbackSummary {
  score: number;
  efficiency: string;
  readability: string;
  bestPractices: string;
  correctness: string;
  testResults?: any[];
}

interface Performance {
  problemSolving: number;
  technicalSkill: number;
  codeQuality: CodeFeedbackSummary;
}

interface FeedbackData {
  interviewTitle: string;
  company: string;
  completedAt: string;
  duration: number;
  overallScore: number;
  performance: Performance;
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

  // Plagiarism analysis state
  const [plagiarism, setPlagiarism] = useState<any>(null);
  const [plagiarismLoading, setPlagiarismLoading] = useState(true);
  const [plagiarismError, setPlagiarismError] = useState<string | null>(null);

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

  // Fetch plagiarism analysis
  useEffect(() => {
    if (!id) return;
    const fetchPlagiarism = async () => {
      setPlagiarismLoading(true);
      setPlagiarismError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/interviews/${id}/plagiarism`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch plagiarism analysis");
        const data = await response.json();
        setPlagiarism(data);
      } catch (err) {
        setPlagiarismError(err instanceof Error ? err.message : "Failed to load plagiarism analysis");
      } finally {
        setPlagiarismLoading(false);
      }
    };
    fetchPlagiarism();
  }, [id]);

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

  // Calculate overall score as the average of code quality, problem solving, and technical skills
  const codeQualityScore = feedback.codeFeedbackSummary?.score ?? 0;
  const problemSolvingScore = feedback.performance?.problemSolving ?? 0;
  const technicalSkillScore = feedback.performance?.technicalSkill ?? 0;
  const overallScore = Math.round((codeQualityScore + problemSolvingScore + technicalSkillScore) / 3);

  // Helper for risk badge color
  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-500 hover:bg-green-600 text-white";
      case "medium": return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "high": return "bg-red-500 hover:bg-red-600 text-white";
      default: return "bg-gray-300 text-gray-800";
    }
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
            <p className="text-5xl font-bold text-green-600">{overallScore}%</p>
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
              {/* Overall Score */}
              <div>
                <p className="text-2xl font-bold text-green-600">{overallScore}%</p>
                <p className="text-gray-600">Overall Score</p>
                <Progress value={overallScore} className="mt-2 h-2" />
              </div>
              {/* Code Quality */}
              <div>
                <p className="text-2xl font-bold text-green-600">{codeQualityScore}%</p>
                <p className="text-gray-600">Code Quality</p>
                <Progress value={codeQualityScore} className="mt-2 h-2" />
              </div>
              {/* Problem Solving */}
              <div>
                <p className="text-2xl font-bold text-green-600">{problemSolvingScore}%</p>
                <p className="text-gray-600">Problem Solving</p>
                <Progress value={problemSolvingScore} className="mt-2 h-2" />
              </div>
              {/* Technical Skills */}
              <div>
                <p className="text-2xl font-bold text-green-600">{technicalSkillScore}%</p>
                <p className="text-gray-600">Technical Skills</p>
                <Progress value={technicalSkillScore} className="mt-2 h-2" />
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
            <div className="mt-6">
              {/* Code Quality Details (full width, with icons) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    <span>Code Quality Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Efficiency</h3>
                      </div>
                      <p className="text-gray-600 ml-13">{feedback.codeFeedbackSummary?.efficiency || 'Not evaluated'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Readability</h3>
                      </div>
                      <p className="text-gray-600 ml-13">{feedback.codeFeedbackSummary?.readability || 'Not evaluated'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Best Practices</h3>
                      </div>
                      <p className="text-gray-600 ml-13">{feedback.codeFeedbackSummary?.bestPractices || 'Not evaluated'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Correctness</h3>
                      </div>
                      <p className="text-gray-600 ml-13">{feedback.codeFeedbackSummary?.correctness || 'Not evaluated'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.strengths && feedback.strengths.length > 0 ? (
                      feedback.strengths.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))
                    ) : (
                      <li>No strengths identified.</li>
                    )}
                  </ul>
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
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 ? (
                      feedback.areasForImprovement.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))
                    ) : (
                      <li>No areas for improvement identified.</li>
                    )}
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
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{feedback.feedback}</p>
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
                <CardContent>
                  {plagiarismLoading ? (
                    <div className="text-gray-500">Loading plagiarism analysis...</div>
                  ) : plagiarismError ? (
                    <div className="text-red-500">{plagiarismError}</div>
                  ) : plagiarism ? (
                    <>
                      <p className="text-gray-600 mb-4">Code similarity check against our database of previous submissions</p>
                      <div className="grid grid-cols-2 gap-4 items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Risk Level</h4>
                          <Badge className={`mt-1 ${getRiskBadgeClass(plagiarism.riskLevel)}`}>{plagiarism.riskLevel?.toUpperCase()} RISK</Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Similarity Score</h4>
                          <p className="text-2xl font-bold text-green-600">{plagiarism.similarityScore}%</p>
                          <Progress value={plagiarism.similarityScore} className="h-2" />
                        </div>
                      </div>
                      <div className={`plagiarism-status-message bg-${plagiarism.riskLevel === 'low' ? 'green' : plagiarism.riskLevel === 'medium' ? 'yellow' : 'red'}-50 text-${plagiarism.riskLevel === 'low' ? 'green' : plagiarism.riskLevel === 'medium' ? 'yellow' : 'red'}-700 p-3 rounded-md flex items-center space-x-2 text-sm`}>
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="flex items-center">{plagiarism.statusMessage}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-gray-600">Submissions Checked:</p>
                          <p className="text-gray-800">{plagiarism.submissionsChecked}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-600">Flagged Submissions:</p>
                          <p className="text-gray-800">{plagiarism.flaggedSubmissions}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-600">Analysis Time:</p>
                          <p className="text-gray-800">{plagiarism.analysisTime} seconds</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-600">Confidence:</p>
                          <p className="text-gray-800">{plagiarism.confidence}%</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500">No plagiarism data available.</div>
                  )}
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