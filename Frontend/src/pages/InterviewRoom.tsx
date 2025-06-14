import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Code,
  Clock,
  Users,
  Play,
  Save,
  Monitor,
  VideoOff,
  Mic,
  MicOff,
  Webcam,
  MoreHorizontal,
  ArrowLeft,
  Settings,
  LogOut,
  ChevronsUpDown
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import TestCases from "@/components/TestCases";
import CandidateNotes from "@/components/CandidateNotes";
import { useAuth } from "@/contexts/AuthContext";
import html2canvas from 'html2canvas';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CodeExecutionService } from '../services/codeExecutionService';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  testCases: TestCase[];
}

interface Interview {
  id: string;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  questions: Question[];
}

const Interview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, authLoading, token } = useAuth();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLimit, setTimeLimit] = useState(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [code, setCode] = useState("// Write your solution here\n\nfunction solve(input) {\n    // Your code here\n    return result;\n}");
  const [notes, setNotes] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
  const [aiInsightsResult, setAiInsightsResult] = useState<{
    suggestions: string[];
    potentialBugs: string[];
    statusMessage?: string;
  } | null>(null);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(true);

  // WebRTC/MediaRecorder states
  const localStreamRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true); // Track video state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // Track audio state

  // Proctoring states
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  // Screenshot capture
  const [screenshotInterval, setScreenshotInterval] = useState<NodeJS.Timeout | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // WebSocket setup
  const ws = useRef<WebSocket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  // Movable video panel state
  const videoPanelRef = useRef<HTMLDivElement>(null);
  const [videoPanelPosition, setVideoPanelPosition] = useState({ x: window.innerWidth - 350, y: 20 }); // Initial position

  // Determine user role: prioritize authenticated user's role, then URL, then default to recruiter
  const userRole = user?.role?.toLowerCase() === "candidate" ? "candidate" :
                   user?.role?.toLowerCase() === "recruiter" || user?.role?.toLowerCase() === "admin" ? "recruiter" :
                   searchParams.get("role") || "recruiter";

  // Helper function to determine badge variant for difficulty
  const getBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'HARD':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Effect to get user media (camera and microphone)
  useEffect(() => {
    const getMedia = async () => {
      try {
        console.log('Attempting to get media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled,
      });
        console.log('Media stream obtained:', stream);

      if (localStreamRef.current) {
        localStreamRef.current.srcObject = stream;
          console.log('Video stream assigned to localStreamRef.current.srcObject');
          console.log('localStreamRef.current after assignment:', localStreamRef.current);
        } else {
          console.log('localStreamRef.current is null when trying to assign stream.');
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        toast({
          title: "Media Access Denied",
          description: "Please allow camera and microphone access to participate in the interview.",
          variant: "destructive",
        });
        // Optionally, disable video/audio toggles if access is denied
        if (err instanceof Error && err.name === 'NotAllowedError') {
          setIsVideoEnabled(false);
          setIsAudioEnabled(false);
        }
      }
    };

    getMedia();

    // Clean up function to stop media tracks when component unmounts or dependencies change
    return () => {
      if (localStreamRef.current && localStreamRef.current.srcObject) {
        console.log('Stopping media tracks.');
        const stream = localStreamRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoEnabled, isAudioEnabled, toast]); // Re-run if video/audio toggles change

  // WebSocket connection effect
  useEffect(() => {
    if (!id || !user) return;

    const socket = new WebSocket(`ws://localhost:3001?interviewId=${id}&userId=${user.id}`);

    socket.onopen = () => {
      console.log('WebSocket connected');
      setSocketConnected(true);
      socket.send(JSON.stringify({ type: 'join_interview', interviewId: id, userId: user.id }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received:', message);
      setMessageHistory((prev) => [...prev, JSON.stringify(message)]);

      if (message.type === 'code_update') {
        setCode(message.code);
      } else if (message.type === 'test_results_update') {
        setTestResults(message.results);
      } else if (message.type === 'ai_insights_update') {
        setAiInsightsResult(message.insights);
      } else if (message.type === 'notes_update') {
        setNotes(message.notes);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setSocketConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error.');
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [id, user]);

  // Send code updates over WebSocket
  const sendCodeUpdate = useCallback((newCode: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'code_update', interviewId: id, code: newCode }));
    }
  }, [id]);

  // Send notes updates over WebSocket
  const sendNotesUpdate = useCallback((newNotes: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'notes_update', interviewId: id, notes: newNotes }));
    }
  }, [id]);

  // Handle code editor changes
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    sendCodeUpdate(newCode);
  };

  // Handle notes changes
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    sendNotesUpdate(newNotes);
  };

  // Timer effect
  useEffect(() => {
    if (isSubmitted || !interview || timeElapsed >= timeLimit) return; // Stop timer if submitted or time limit reached

    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeElapsed, timeLimit, interview]);

  // Fetch interview details including questions
  useEffect(() => {
    const fetchInterview = async () => {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/interviews/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch interview details');
        }

        const data = await response.json();
        setInterview(data);
        setTimeLimit(data.duration);
        
        // Set initial problem if there are questions
        if (data.questions && data.questions.length > 0) {
          setCurrentProblem(0);
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError('Failed to load interview details');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchInterview();
    }
  }, [id, token]);

  // Movable video panel handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const panel = videoPanelRef.current;
    if (!panel) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPanelX = panel.offsetLeft;
    const initialPanelY = panel.offsetTop;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setVideoPanelPosition({
        x: initialPanelX + dx,
        y: initialPanelY + dy,
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [
      h.toString().padStart(2, '0'),
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0'),
    ].join(':');
  };

  const codeExecutionService = new CodeExecutionService();

  // Replace the old handleRunCode with this new implementation
  const handleRunCode = async () => {
    if (!currentProblemData || !token) {
      setAiInsightsResult({
        suggestions: [],
        potentialBugs: [],
        statusMessage: "Error: Please select a problem and ensure you are authenticated."
      });
      setLoading(false); // Ensure loading is off on early exit
      return;
    }

    if (userRole === "recruiter") {
      setAiInsightsResult({
        suggestions: [],
        potentialBugs: [],
        alternativeSolutions: [],
        statusMessage: "Access Denied: Recruiters cannot execute code."
      });
      setLoading(false); // Ensure loading is off on early exit
      return;
    }

    setLoading(true);
    setError(null);
    setTestResults([]); // Clear previous test results
    setAiInsightsResult({
      suggestions: [],
      potentialBugs: [],
      statusMessage: "Running code..." // Set initial message within AI insights
    }); 

    try {
      console.log('Attempting to run code...', {
        language: selectedLanguage,
        testCases: currentProblemData.testCases,
        codeLength: code.length
      });

      const executionService = new CodeExecutionService();
      const result = await executionService.executeCode(
        code,
        selectedLanguage,
        currentProblemData.testCases || [],
        interview?.id || "",
        currentProblemData.id,
        {
          title: currentProblemData.title,
          description: currentProblemData.description,
          difficulty: currentProblemData.difficulty
        },
        token
      );

      console.log('Code execution result received:', result);

      setTestResults(result.testResults || []);
      
      // Update aiInsightsResult with actual insights and status message
      setAiInsightsResult({
        ...(result.aiInsights || { suggestions: [], potentialBugs: [] }),
        statusMessage: `Code Execution Successful: ${result.message}`,
      });

      // Send test results and AI insights over WebSocket
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'test_results_update', results: result.testResults }));
        ws.current.send(JSON.stringify({ type: 'ai_insights_update', insights: result.aiInsights })); // Send the updated insights
      }

    } catch (err: any) {
      console.error('Error during code execution:', err);
      setError(err.message || "Failed to execute code"); // Keep existing error for problem section if needed
      
      // Update aiInsightsResult with error message
      setAiInsightsResult({
        suggestions: [],
        potentialBugs: [],
        statusMessage: `Code Execution Failed: ${err.message || "An unexpected error occurred."}`
      });

    } finally {
      setLoading(false);
    }
  };

  // Handle interview submission
  const handleSubmitInterview = async () => { // Made async to await backend call
    console.log('Interview submitted!');
    setIsSubmitted(true);

    if (!id || !token) {
      console.error('Interview ID or token is missing, cannot generate/navigate to feedback page.');
      // Optionally, display an error to the user
      return;
    }

    try {
      // Trigger feedback generation on the backend
      console.log(`Sending request to generate feedback for interview ID: ${id}`);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/feedback/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', // Even if body is empty, good practice to include
        },
        // No body needed as backend fetches necessary data from snapshots
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to generate feedback on backend:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Backend error: ${response.status} ${response.statusText}`);
      }

      console.log('Feedback generation triggered successfully.');
      // Navigate to the candidate feedback page after successful generation
      navigate(`/feedback/${id}`);

    } catch (error) {
      console.error('Error during feedback submission/generation:', error);
      // Optionally, display an error to the user
      toast({
        title: "Feedback Submission Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during feedback generation.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const problems = interview?.questions || [];
  const currentProblemData = problems[currentProblem];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InterviewAI
              </span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Coding Interview</h1>
              <p className="text-sm text-gray-600">Problem {currentProblem + 1} of {problems.length}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className="flex items-center space-x-1 text-gray-700">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeElapsed)} / {formatTime(timeLimit)}</span>
            </div>

            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="p-2 border rounded-md text-sm bg-white pr-8"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            {/* Buttons for navigation or submission */}
            <Button variant="outline" size="sm" onClick={() => setCurrentProblem(prev => Math.max(0, prev - 1))} disabled={currentProblem === 0}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentProblem(prev => Math.min(problems.length - 1, prev + 1))} disabled={currentProblem === problems.length - 1}>Next</Button>
            <Button size="sm" onClick={handleSubmitInterview}>Submit Interview</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
              </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                End Interview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative" ref={mainContentRef}>
        {/* Left Panel - Problem Statement & Test Cases */}
        <div className="w-2/5 flex flex-col bg-white border-r">
          <Tabs defaultValue="problem" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="problem" className="flex-1 p-4 pt-2 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Problem {currentProblem + 1} of {problems.length}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
                    {currentProblemData ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">{currentProblemData.title}</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{currentProblemData.description}</p>
                        <h4 className="font-medium">Test Cases:</h4>
              <TestCases
                          testCases={currentProblemData.testCases || []}
                results={testResults}
              />
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>Problem not found or no questions available.</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes" className="flex-1 p-4 pt-2">
              <CandidateNotes notes={notes} onNotesChange={handleNotesChange} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Middle Panel - Code Editor */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Code Editor Header */}
          <div className="border-b bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">solution.js</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleRunCode}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              value={code}
              language={selectedLanguage} // Use selectedLanguage for the editor
              onChange={handleCodeChange}
            />
          </div>

          {/* AI Insights Section */}
          {aiInsightsResult && (
            <Collapsible open={isAiInsightsOpen} onOpenChange={setIsAiInsightsOpen}>
              <Card className="mt-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Code className="mr-2 h-5 w-5" />AI Code Analysis
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle AI Insights</span>
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="max-h-[300px] overflow-y-auto">
                    {/* Display Status Message at the top of AI Insights */}
                    {aiInsightsResult.statusMessage && (
                      <Alert className={`mb-4 ${aiInsightsResult.statusMessage.includes("Successful") ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                        <AlertDescription>{aiInsightsResult.statusMessage}</AlertDescription>
                      </Alert>
                    )}
                    {aiInsightsResult.suggestions.length > 0 && (
                      <>
                        <h4 className="font-semibold mb-2">Suggestions:</h4>
                        <ul className="list-disc list-inside mb-4">
                          {aiInsightsResult.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {aiInsightsResult.potentialBugs.length > 0 && (
                      <>
                        <h4 className="font-semibold mb-2">Potential Bugs:</h4>
                        <ul className="list-disc list-inside mb-4">
                          {aiInsightsResult.potentialBugs.map((pb, i) => (
                            <li key={i}>{pb}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {aiInsightsResult.suggestions.length === 0 && 
                     aiInsightsResult.potentialBugs.length === 0 &&
                     !aiInsightsResult.statusMessage && (
                       <p>No specific AI insights available for this code at the moment.</p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>

        {/* Right Panel - Candidate View / Monitoring - NOW MOVABLE */}
        <div 
          ref={videoPanelRef}
          className="absolute w-80 flex flex-col bg-white border-l shadow-lg rounded-lg overflow-hidden cursor-grab"
          style={{
            left: videoPanelPosition.x,
            top: videoPanelPosition.y,
            zIndex: 1000, // Ensure it floats above other content
          }}
        >
          <div className="p-4 border-b flex justify-between items-center cursor-move" onMouseDown={handleMouseDown}>
            <h3 className="text-sm font-medium text-gray-700">Candidate View</h3>
            {userRole === "candidate" ? (
              <Badge className="bg-blue-100 text-blue-800">
                <Monitor className="w-3 h-3 mr-1" />
                Self-Preview
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800">
                <Users className="w-3 h-3 mr-1" />
                Monitoring
              </Badge>
            )}
          </div>

          <div className="flex-1 p-4">
            {/* Candidate Video Stream */}
            <div className="w-full aspect-video bg-gray-200 rounded-md overflow-hidden relative">
              <video
                ref={localStreamRef}
                autoPlay
                playsInline
                muted // Mute local preview
                className="w-full h-full object-cover"
              ></video>
              {userRole === "candidate" && localStreamRef.current?.srcObject && (
                <div className="absolute bottom-2 left-2 flex space-x-2 bg-gray-800 bg-opacity-50 p-2 rounded-md">
                  {/* Video Status Icon */}
                  {isVideoEnabled ? (
                    <Webcam className="h-5 w-5 text-green-400" />
                  ) : (
                    <VideoOff className="h-5 w-5 text-red-400" />
                  )}
                  {/* Audio Status Icon */}
                  {isAudioEnabled ? (
                    <Mic className="h-5 w-5 text-green-400" />
                  ) : (
                    <MicOff className="h-5 w-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;