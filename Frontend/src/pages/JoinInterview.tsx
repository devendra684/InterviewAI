
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, 
  Clock, 
  User, 
  Mail,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";

const JoinInterview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [candidateInfo, setCandidateInfo] = useState({
    name: "",
    email: searchParams.get("email") || ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [error, setError] = useState("");
  
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invite link. Please check your email for the correct link.");
      return;
    }

    // Simulate fetching interview details
    const mockInterviewDetails = {
      title: "Frontend Developer Interview",
      company: "TechCorp Inc.",
      recruiter: "Alex Smith",
      duration: 60,
      language: "JavaScript",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };
    
    setInterviewDetails(mockInterviewDetails);
  }, [token]);

  const handleJoinInterview = () => {
    if (!candidateInfo.name.trim() || !candidateInfo.email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!candidateInfo.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to validate and join interview
    setTimeout(() => {
      if (candidateInfo.email !== searchParams.get("email")) {
        setError("Email address doesn't match the invited candidate.");
        setIsLoading(false);
        return;
      }

      toast({
        title: "Joining Interview",
        description: "Please wait while we prepare your interview environment...",
      });

      // Navigate to interview page
      setTimeout(() => {
        navigate(`/interview/${token}?role=candidate`);
      }, 1500);
    }, 1000);
  };

  const isExpired = interviewDetails && new Date() > new Date(interviewDetails.expiresAt);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            InterviewAI
          </h1>
          <p className="text-gray-600 mt-2">Join Your Coding Interview</p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {interviewDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Interview Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">{interviewDetails.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{interviewDetails.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interviewer:</span>
                  <span className="font-medium">{interviewDetails.recruiter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {interviewDetails.duration} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{interviewDetails.language}</span>
                </div>
              </div>

              {isExpired && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    This interview invitation has expired. Please contact the recruiter for a new link.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {interviewDetails && !isExpired && (
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={candidateInfo.name}
                    onChange={(e) => setCandidateInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={candidateInfo.email}
                    onChange={(e) => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    disabled={!!searchParams.get("email")}
                  />
                </div>
                {searchParams.get("email") && (
                  <p className="text-sm text-gray-500">Email pre-filled from invitation</p>
                )}
              </div>

              <Button 
                onClick={handleJoinInterview}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining Interview...
                  </>
                ) : (
                  "Join Interview"
                )}
              </Button>

              <div className="text-sm text-gray-500 space-y-2">
                <p className="font-medium">Before joining, please ensure:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Your camera and microphone are working</li>
                  <li>• You have a stable internet connection</li>
                  <li>• You're in a quiet, well-lit environment</li>
                  <li>• Your browser supports video calling</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JoinInterview;