
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Code, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Copy,
  Download,
  Share,
  ArrowLeft,
  Star,
  Target,
  Zap,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const AIReport = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const analysisData = {
    interviewId: "12345",
    candidateName: "John Doe",
    position: "Senior Frontend Developer",
    completedAt: "2024-06-13T14:30:00Z",
    duration: "1h 15m",
    overallScore: 87,
    codeQuality: {
      score: 85,
      efficiency: "Good",
      readability: "Excellent",
      bestPractices: "Good",
      technicalAccuracy: "Very Good",
      suggestions: [
        "Consider using more descriptive variable names",
        "Add error handling for edge cases",
        "Optimize the nested loop in the sorting algorithm"
      ]
    },
    performance: {
      strengths: [
        "Excellent problem-solving approach",
        "Clear communication skills",
        "Strong JavaScript fundamentals",
        "Good understanding of React concepts",
        "Efficient algorithm implementation"
      ],
      weaknesses: [
        "Could improve error handling",
        "Limited experience with testing frameworks",
        "Needs more practice with system design"
      ],
      problemSolvingApproach: "Systematic and methodical. Breaks down problems into smaller components and thinks through edge cases.",
      codeStructure: "Well-organized with clear separation of concerns. Uses appropriate data structures.",
      timeManagement: "Completed tasks within allocated time with room for optimization."
    },
    plagiarismCheck: {
      similarityScore: 15,
      riskLevel: "low",
      flaggedSubmissions: [],
      suspiciousPatterns: []
    },
    professionalFeedback: "John demonstrated strong technical skills and problem-solving abilities during the interview. His approach to breaking down complex problems was impressive, and he showed excellent JavaScript fundamentals. Areas for growth include error handling and testing practices. Overall, he would be a strong addition to the development team with some mentoring in advanced concepts."
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "high": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Analysis Report
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Interview Analysis Report
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span>Candidate: <strong>{analysisData.candidateName}</strong></span>
                <span>Position: <strong>{analysisData.position}</strong></span>
                <span>Duration: <strong>{analysisData.duration}</strong></span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(analysisData.overallScore)}`}>
                {analysisData.overallScore}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${getScoreBackground(analysisData.overallScore)}`}></div>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Overall Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysisData.codeQuality.score)}`}>
                  {analysisData.codeQuality.score}%
                </div>
                <div className="text-sm text-gray-600">Code Quality</div>
                <Progress value={analysisData.codeQuality.score} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-gray-600">Problem Solving</div>
                <Progress value={85} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-gray-600">Communication</div>
                <Progress value={92} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">78%</div>
                <div className="text-sm text-gray-600">Technical Skills</div>
                <Progress value={78} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Code Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="plagiarism">Plagiarism Check</TabsTrigger>
            <TabsTrigger value="feedback">Professional Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                    <span className="text-gray-600">Efficiency</span>
                    <Badge variant="outline">{analysisData.codeQuality.efficiency}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Readability</span>
                    <Badge variant="outline">{analysisData.codeQuality.readability}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Best Practices</span>
                    <Badge variant="outline">{analysisData.codeQuality.bestPractices}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Technical Accuracy</span>
                    <Badge variant="outline">{analysisData.codeQuality.technicalAccuracy}</Badge>
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
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.codeQuality.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.performance.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-yellow-600" />
                    <span>Areas for Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.performance.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Detailed Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Problem-Solving Approach</h4>
                    <p className="text-gray-700 text-sm">{analysisData.performance.problemSolvingApproach}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Code Structure</h4>
                    <p className="text-gray-700 text-sm">{analysisData.performance.codeStructure}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Time Management</h4>
                    <p className="text-gray-700 text-sm">{analysisData.performance.timeManagement}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plagiarism" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Plagiarism Analysis</span>
                </CardTitle>
                <CardDescription>
                  Code similarity check against our database of previous submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Risk Level */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Risk Level</span>
                    <Badge className={getRiskColor(analysisData.plagiarismCheck.riskLevel)}>
                      {analysisData.plagiarismCheck.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>

                  {/* Similarity Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">Similarity Score</span>
                      <span className="text-2xl font-bold text-green-600">
                        {analysisData.plagiarismCheck.similarityScore}%
                      </span>
                    </div>
                    <Progress value={analysisData.plagiarismCheck.similarityScore} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      Scores below 30% indicate original work
                    </p>
                  </div>

                  {/* Results */}
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>No plagiarism detected.</strong> The submitted code appears to be original work with minimal similarity to existing submissions in our database.
                    </AlertDescription>
                  </Alert>

                  {/* Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Analysis Details</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Submissions Checked:</span>
                        <span className="ml-2 font-medium">1,247</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Flagged Submissions:</span>
                        <span className="ml-2 font-medium">{analysisData.plagiarismCheck.flaggedSubmissions.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Analysis Time:</span>
                        <span className="ml-2 font-medium">2.3 seconds</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidence:</span>
                        <span className="ml-2 font-medium">98.7%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span>Professional Feedback</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(analysisData.professionalFeedback, 'feedback')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedSection === 'feedback' ? 'Copied!' : 'Copy'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  AI-generated professional summary ready for sharing with stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {analysisData.professionalFeedback}
                  </p>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Email to Hiring Manager
                  </Button>
                  <Button variant="outline" size="sm">
                    Add to Candidate Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    Schedule Follow-up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIReport;