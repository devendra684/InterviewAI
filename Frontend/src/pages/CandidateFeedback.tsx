
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Lightbulb,
  Award,
  Home,
  Download
} from "lucide-react";

interface PerformanceData {
  codeQuality: number;
  problemSolving: number;
  communication: number;
  timeManagement: number;
}

interface FeedbackData {
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
}

const CandidateFeedback = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch candidate feedback
    setTimeout(() => {
      const mockFeedback: FeedbackData = {
        interviewTitle: "Frontend Developer Interview",
        company: "TechCorp Inc.",
        completedAt: new Date().toISOString(),
        duration: 58, // minutes
        overallScore: 78,
        performance: {
          codeQuality: 82,
          problemSolving: 75,
          communication: 80,
          timeManagement: 72
        },
        strengths: [
          "Strong understanding of JavaScript fundamentals",
          "Good problem-solving approach with systematic thinking",
          "Clean and readable code structure",
          "Effective communication during problem discussion"
        ],
        areasForImprovement: [
          "Consider edge cases in solution design",
          "Practice algorithm optimization techniques",
          "Improve time management for complex problems"
        ],
        feedback: "Overall, you demonstrated solid programming skills and a good understanding of frontend development concepts. Your code was well-structured and you communicated your thought process clearly. With some practice on algorithm optimization and edge case handling, you'll be even stronger in future interviews. Keep up the great work!",
        nextSteps: "The recruiter will contact you within 2-3 business days regarding the next steps in the hiring process."
      };
      
      setFeedback(mockFeedback);
      setIsLoading(false);
    }, 1500);
  }, [id]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your interview feedback...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load feedback data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
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
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">{feedback.interviewTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{feedback.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {feedback.duration} minutes
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBgColor(feedback.overallScore)} mb-2`}>
                    <span className={`text-2xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                      {feedback.overallScore}
                    </span>
                  </div>
                  <p className="font-medium text-gray-700">Overall Score</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Performance Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Object.entries(feedback.performance) as [string, number][]).map(([skill, score]) => (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Award className="w-5 h-5" />
                <span>Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <Lightbulb className="w-5 h-5" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{feedback.feedback}</p>
            <Separator className="my-4" />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
              <p className="text-blue-800 text-sm">{feedback.nextSteps}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </Button>
          <Link to="/">
            <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Footer Message */}
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">
            Thank you for using InterviewAI. Good luck with your career journey!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateFeedback;
