import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, 
  Clock, 
  User, 
  Mail,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Mic,
  Video,
  Wifi,
  Volume2,
  Info
} from "lucide-react";

interface InterviewDetails {
  id: string;
  title: string;
  company: string;
  description: string;
  startTime: string;
  duration: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  interviewerId: string;
  candidateId: string;
  joinCode: string;
}

const JoinInterview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState("instructions"); // "instructions" or "form"
  const [candidateInfo, setCandidateInfo] = useState({
    name: "",
    email: searchParams.get("email") || ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
  const [error, setError] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  
  const joinCode = searchParams.get("code");

  useEffect(() => {
    if (!joinCode) {
      setError("Invalid or missing join code. Please check your email for the correct link.");
      return;
    }

    const fetchInterviewDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/interviews/join/${joinCode}`);
        if (!response.ok) {
          throw new Error("Failed to fetch interview details");
        }
        const data = await response.json();
        setInterviewDetails(data);
      } catch (err: any) {
        setError(err.message || "Failed to load interview details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [joinCode]);

  const handleJoinInterview = async () => {
    if (!candidateInfo.name.trim() || !candidateInfo.email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!candidateInfo.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/interviews/join/${joinCode}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: candidateInfo.name,
          email: candidateInfo.email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to join interview");
      }

      const data = await response.json();
      
      toast({
        title: "Joining Interview",
        description: "Please wait while we prepare your interview environment...",
      });

      // Navigate to interview room with the token
      navigate(`/interview/${data.interviewId}?role=candidate&token=${data.token}`);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const isExpired = interviewDetails && new Date() > (
  interviewDetails.endTime
    ? new Date(interviewDetails.endTime)
    : new Date(new Date(interviewDetails.startTime).getTime() + interviewDetails.duration * 60000)
);

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Interview Expired</h2>
              <p className="text-gray-600">
                This interview link has expired. Please contact the recruiter for a new invitation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Interview</h1>
          <p className="text-gray-600">Please verify your details to join the interview</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === "instructions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span>Important Instructions Before Joining</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                To ensure a smooth and fair interview experience, please read and agree to the following conditions:
              </p>
              <ul className="list-disc list-inside space-y-3 text-gray-700">
                <li className="flex items-center">
                  <Video className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
                  Ensure your **camera is working** and you grant permission when prompted.
                </li>
                <li className="flex items-center">
                  <Mic className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
                  Ensure your **microphone is working** and you grant permission when prompted.
                </li>
                <li className="flex items-center">
                  <Wifi className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
                  You have a **stable internet connection**.
                </li>
                <li className="flex items-center">
                  <Volume2 className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
                  You are in a **quiet and well-lit environment**.
                </li>
                <li>
                  Any attempt to cheat or use unauthorized assistance will result in immediate disqualification.
                </li>
              </ul>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreement"
                  checked={hasAgreed}
                  onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                />
                <Label htmlFor="agreement">
                  I have read and agree to the above conditions.
                </Label>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setCurrentStep("form")}
                disabled={!hasAgreed}
              >
                Proceed to Interview Details
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "form" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={candidateInfo.name}
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={candidateInfo.email}
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleJoinInterview}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Interview"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {interviewDetails && currentStep === "form" && (
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
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {interviewDetails.duration} minutes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JoinInterview;