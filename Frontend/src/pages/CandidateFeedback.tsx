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
  Loader2
} from "lucide-react";

interface PerformanceData {
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  codeQualityScore: number;
}

interface FeedbackData {
  id: string;
  interviewTitle: string;
  company: string;
  completedAt: string;
  duration: number;
  overallScore: number;
  performance: PerformanceData;
  strengths: string[];
  areasForImprovement: string[];
  feedback: string;
  nextSteps: string;
  codeFeedbackSummary?: string;
  communicationFeedbackSummary?: string;
  transcriptDetailedFeedback?: string;
}

const CandidateFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/interviews/${id}/feedback`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch feedback' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setFeedback(data);
      } catch (err: any) {
        console.error('Feedback fetch error:', err);
        setError(err.message);
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
  }, [id, token, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading feedback...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
          <p className="text-gray-600">Thank you for participating in the coding interview</p>
        </div>

        {/* Interview Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Interview Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  {feedback.duration} minutes
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(feedback.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Overall Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-500">Overall Score</h3>
                <Badge className="text-lg font-semibold">
                  {feedback.overallScore}%
                </Badge>
              </div>
              <Progress value={feedback.overallScore} className="h-2" />
            </div>

            {/* Performance Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Technical Skills</span>
                    <span className="text-sm font-medium">{feedback.performance.technicalScore}%</span>
                  </div>
                  <Progress value={feedback.performance.technicalScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Problem Solving</span>
                    <span className="text-sm font-medium">{feedback.performance.problemSolvingScore}%</span>
                  </div>
                  <Progress value={feedback.performance.problemSolvingScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Communication</span>
                    <span className="text-sm font-medium">{feedback.performance.communicationScore}%</span>
                  </div>
                  <Progress value={feedback.performance.communicationScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Code Quality</span>
                    <span className="text-sm font-medium">{feedback.performance.codeQualityScore}%</span>
                  </div>
                  <Progress value={feedback.performance.codeQualityScore} className="h-2" />
                </div>
              </div>
            </div>

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

            {/* Detailed Feedback */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Feedback</h3>
              <p className="text-gray-600 whitespace-pre-line">{feedback.feedback}</p>
            </div>

            {/* New: AI Code Feedback */}
            {feedback.codeFeedbackSummary && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">AI Code Feedback</h3>
                <p className="text-gray-600 whitespace-pre-line">{feedback.codeFeedbackSummary}</p>
              </div>
            )}

            {/* New: AI Communication Feedback */}
            {feedback.communicationFeedbackSummary && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">AI Communication Feedback</h3>
                <p className="text-gray-600 whitespace-pre-line">{feedback.communicationFeedbackSummary}</p>
              </div>
            )}

            {/* New: AI Transcript Detailed Feedback */}
            {feedback.transcriptDetailedFeedback && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">AI Transcript Analysis</h3>
                <p className="text-gray-600 whitespace-pre-line">{feedback.transcriptDetailedFeedback}</p>
              </div>
            )}

            {/* Next Steps */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
              <p className="text-gray-600">{feedback.nextSteps}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateFeedback;
