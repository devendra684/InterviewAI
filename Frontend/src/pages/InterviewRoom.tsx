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
  ChevronsUpDown,
  Loader2
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
  company: string;
  description: string;
  startTime: string;
  duration: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  interviewerId: string;
  candidateId: string;
  questions: Question[];
}

const Interview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, loading, token } = useAuth();

  // State declarations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loadingInterview, setLoadingInterview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLimit, setTimeLimit] = useState(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [code, setCode] = useState("// Write your solution here\n\nfunction solve(input) {\n    // Your code here\n    return result;\n}");
  const [notes, setNotes] = useState("No notes were provided by the candidate.");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
  const [aiInsightsResult, setAiInsightsResult] = useState<{
    suggestions: string[];
    potentialBugs: string[];
    statusMessage?: string;
    alternativeSolutions?: string[];
  } | null>(null);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(true);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [videoPanelPosition, setVideoPanelPosition] = useState({ x: window.innerWidth - 350, y: 20 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

  // Ref declarations
  const localStreamRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const violationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const screenshotInterval = useRef<NodeJS.Timeout | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const videoPanelRef = useRef<HTMLDivElement>(null);

  // Derived state/constants
  const userRole = user?.role?.toLowerCase() === "candidate" ? "candidate" :
                   user?.role?.toLowerCase() === "recruiter" || user?.role?.toLowerCase() === "admin" ? "recruiter" :
                   searchParams.get("role") || "recruiter";

  let screenshotIntervalId: NodeJS.Timeout | null = null;

  // Callback functions
  const handleSubmitInterview = useCallback(async () => {
    if (!id || !token || !user) {
      toast({
        title: "Error",
        description: "Cannot submit interview. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting interview with notes:", notes);
      console.log("Current code:", code);
      console.log("Test results:", testResults);

      // Format test results for the backend
      const formattedTestResults = testResults ? {
        results: testResults.map(result => ({
          testCase: result.testCase,
          passed: result.passed,
          executionTime: result.executionTime,
          output: result.output
        }))
      } : { results: [] };

      // First, save the final code snapshot
      const saveResponse = await fetch(`/api/interviews/${id}/code/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'solution.js',
          language: selectedLanguage,
          code: code || "// No code was written",
          transcript: notes || "No notes were provided",
          communicationData: {
            clarity: 80,
            technicalAccuracy: 85,
            responseTime: 75,
            engagement: 80
          },
          testResults: formattedTestResults
        })
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save final code snapshot: ${saveResponse.status}`);
      }

      // Then, end the interview
      const endResponse = await fetch(`/api/interviews/${id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!endResponse.ok) {
        const errorData = await endResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to end interview: ${endResponse.status}`);
      }

      // Finally, trigger feedback generation
      const feedbackResponse = await fetch(`/api/feedback/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!feedbackResponse.ok) {
        const errorData = await feedbackResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Error generating feedback: ${feedbackResponse.status}`);
      }

      const feedbackData = await feedbackResponse.json();
      
      toast({
        title: "Success!",
        description: "Your interview has been submitted and feedback is being generated.",
        variant: "default",
      });

      // Navigate to dashboard after successful submission
      navigate("/dashboard");
    } catch (error) {
      console.error('Error during interview submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [id, token, user, toast, navigate, selectedLanguage, code, notes, testResults]);

  const sendCodeUpdate = useCallback((newCode: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'code_update', interviewId: id, code: newCode }));
    }
  }, [id]);

  const sendNotesUpdate = useCallback((newNotes: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'notes_update', interviewId: id, notes: newNotes }));
    }
  }, [id]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    sendCodeUpdate(newCode);
  };

  const handleNotesChange = (newNotes: string) => {
    console.log("handleNotesChange called with:", newNotes);
    setNotes(newNotes);
    sendNotesUpdate(newNotes);
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

  const codeExecutionService = new CodeExecutionService();

  const handleRunCode = async () => {
    const currentProblemData = interview?.questions[currentProblem];
    if (!currentProblemData || !token) {
      setAiInsightsResult({
        suggestions: [],
        potentialBugs: [],
        statusMessage: "Error: Please select a problem and ensure you are authenticated."
      });
      setLoadingInterview(false); 
      return;
    }

    if (userRole === "recruiter") {
      setAiInsightsResult({
        suggestions: [],
        potentialBugs: [],
        statusMessage: "Access Denied: Recruiters cannot execute code."
      });
      setLoadingInterview(false);
      return;
    }

    setLoadingInterview(true);
    setError(null);
    setTestResults([]); 
    setAiInsightsResult({
      suggestions: [],
      potentialBugs: [],
      statusMessage: "Running code..." 
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
      
      setAiInsightsResult({
        ...(result.aiInsights || { suggestions: [], potentialBugs: [] }),
        statusMessage: `Code Execution Successful: ${result.message}`,
      });

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'test_results_update', results: result.testResults }));
        ws.current.send(JSON.stringify({ type: 'ai_insights_update', insights: result.aiInsights })); 
      }

    } catch (err: any) {
      console.error('Error during code execution:', err);
      setError(err.message || "Failed to execute code"); 
      
      setAiInsightsResult({
        suggestions: [],
        potentialBugs: [],
        statusMessage: `Code Execution Failed: ${err.message || "An unexpected error occurred."}`
      });

    } finally {
      setLoadingInterview(false);
    }
  };

  const handleGrantPermissions = async () => {
    try {
      // First request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Stop the stream immediately as we just needed the permissions
      stream.getTracks().forEach(track => track.stop());

      setPermissionsGranted(true);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      // Hide our modal after permissions are granted
      setShowPermissionsModal(false);

      // Start screen sharing immediately after permissions are granted
      await startScreenSharing();

    } catch (err) {
      console.error('Error granting media permissions:', err);
      toast({
        title: "Permission Error",
        description: "Please allow camera and microphone access to continue with the interview.",
        variant: "destructive",
      });
      // Show the modal again if permissions were denied
      setShowPermissionsModal(true);
    }
  };

  const handleScreenShareEnd = () => {
    // Clear the screen stream
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }

    setIsScreenSharing(false);

    // Show warning and re-request permissions
    toast({
      title: "Screen Sharing Stopped",
      description: "Screen sharing is required. Please allow screen sharing to continue.",
      variant: "destructive",
    });

    // Show permissions modal again
    setShowPermissionsModal(true);
  };

  const checkScreenSharing = async () => {
    if (!screenStream && permissionsGranted) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        setScreenStream(stream);
        setIsScreenSharing(true);

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        // Handle when user stops sharing
        stream.getVideoTracks()[0].onended = () => {
          stopScreenSharing();
          // Show warning toast when screen sharing is stopped
          toast({
            title: "Screen Sharing Required",
            description: "Screen sharing is mandatory for this interview. Please enable it again.",
            variant: "destructive",
          });
        };
      } catch (err) {
        console.error('Error starting screen share:', err);
        toast({
          title: "Screen Sharing Required",
          description: "Screen sharing is mandatory for this interview. Please enable it.",
          variant: "destructive",
        });
      }
    }
  };

  const startScreenSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      // Validate that the user shared the entire screen
      const videoTrack = stream.getVideoTracks()[0];
      // @ts-ignore: displaySurface is not in the standard spec but is supported in Chrome/Edge/Opera/Brave
      const displaySurface = videoTrack.getSettings().displaySurface || videoTrack.label.toLowerCase();
      if (displaySurface !== 'monitor' && !videoTrack.label.toLowerCase().includes('screen')) {
        stream.getTracks().forEach(track => track.stop());
        toast({
          title: "Screen Sharing Error",
          description: "You must share your entire screen (not a window or tab). Please try again and select 'Entire Screen'.",
          variant: "destructive",
        });
        setShowPermissionsModal(true);
        return;
      }

      // Store the stream
      setScreenStream(stream);

      // Add event listener for when user stops sharing
      videoTrack.addEventListener('ended', () => {
        handleScreenShareEnd();
      });

      setIsScreenSharing(true);

    } catch (err) {
      console.error('Error starting screen share:', err);
      toast({
        title: "Screen Sharing Error",
        description: "Please allow screen sharing to continue with the interview.",
        variant: "destructive",
      });
      // Show permissions modal again if screen sharing was denied
      setShowPermissionsModal(true);
    }
  };

  const stopScreenSharing = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
    }
  };

  const takeAndUploadScreenshot = async () => {
    console.log('Attempting to take screenshot...');
    try {
      // Try to capture the screen video element if available
      if (screenVideoRef.current) {
        console.log('Screen video ref found, capturing from video element...');
        const canvas = await html2canvas(screenVideoRef.current, { useCORS: true });
        console.log('Canvas created from video element');
        canvas.toBlob(blob => {
          if (blob) {
            console.log('Blob created, size:', blob.size, 'bytes');
            uploadScreenshot(blob);
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/png');
      } else {
        console.log('No screen video ref, capturing entire document body...');
        const canvas = await html2canvas(document.body, { useCORS: true });
        console.log('Canvas created from document body');
        canvas.toBlob(blob => {
          if (blob) {
            console.log('Blob created, size:', blob.size, 'bytes');
            uploadScreenshot(blob);
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/png');
      }
    } catch (err) {
      console.error('Error taking screenshot:', err);
    }
  };

  const uploadScreenshot = async (blob: Blob) => {
    if (!id || !token) {
      console.error('Missing id or token for screenshot upload');
      return;
    }
    console.log('Uploading screenshot...');
    const formData = new FormData();
    formData.append('screenshot', blob, `screenshot-${Date.now()}.png`);
    try {
      const response = await fetch(`/api/interviews/${id}/screenshots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        console.log('Screenshot uploaded successfully');
      } else {
        console.error('Failed to upload screenshot:', await response.text());
      }
    } catch (err) {
      console.error('Failed to upload screenshot:', err);
    }
  };

  // Start screenshot interval when screen sharing starts
  useEffect(() => {
    if (isScreenSharing) {
      screenshotIntervalId = setInterval(takeAndUploadScreenshot, 15000); // 15 seconds
    } else {
      if (screenshotIntervalId) {
        clearInterval(screenshotIntervalId);
        screenshotIntervalId = null;
      }
    }
    return () => {
      if (screenshotIntervalId) {
        clearInterval(screenshotIntervalId);
        screenshotIntervalId = null;
      }
    };
  }, [isScreenSharing]);

  // Render loading state early
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // useEffect hooks
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
        if (err instanceof Error && err.name === 'NotAllowedError') {
          setIsVideoEnabled(false);
          setIsAudioEnabled(false);
        }
      }
    };

    getMedia();

    return () => {
      if (localStreamRef.current && localStreamRef.current.srcObject) {
        console.log('Stopping media tracks.');
        const stream = localStreamRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoEnabled, isAudioEnabled, toast]);

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

  useEffect(() => {
    if (isSubmitted || !interview || timeElapsed >= timeLimit) return;

    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeElapsed, timeLimit, interview]);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!token) {
        setError('Authentication required');
        setLoadingInterview(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/interviews/${id}`, {
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
        
        if (data.questions && data.questions.length > 0) {
          setCurrentProblem(0);
          setCode(data.questions[0].initialCode || "// Write your solution here\n\nfunction solve(input) {\n    // Your code here\n    return result;\n}");
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError('Failed to load interview details');
      } finally {
        setLoadingInterview(false);
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

  const problems = interview?.questions || [];
  const currentProblemData = problems[currentProblem];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl relative z-[9999]">
            <h2 className="text-2xl font-bold mb-4">Interview Requirements</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                To ensure a secure and effective interview experience, we need the following permissions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Screen sharing access (mandatory and cannot be disabled)</li>
                <li>Screen recording (automatic and cannot be stopped)</li>
                <li>Camera access for video recording</li>
                <li>Microphone access for audio recording</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 font-medium">Important:</p>
                <ul className="list-disc list-inside text-red-600 mt-2">
                  <li>Screen sharing and recording are mandatory and cannot be disabled</li>
                  <li>Attempting to stop screen sharing will result in a violation</li>
                  <li>Multiple violations may lead to automatic interview termination</li>
                </ul>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGrantPermissions}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Interview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment out fullscreen modal
      {showFullscreenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl relative z-[9999]">
            <h2 className="text-2xl font-bold mb-4">Enter Fullscreen Mode</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Please click the button below to enter fullscreen mode. After entering fullscreen, you will be prompted to share your screen.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-600 font-medium">Note:</p>
                <ul className="list-disc list-inside text-yellow-600 mt-2">
                  <li>Fullscreen mode is mandatory for the interview</li>
                  <li>You must maintain fullscreen mode throughout the interview</li>
                  <li>Exiting fullscreen will stop screen sharing and recording</li>
                  <li>Multiple violations may lead to automatic interview termination</li>
                </ul>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFullscreenButtonClick}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Enter Fullscreen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      */}

      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{interview?.title}</h1>
              <p className="text-sm text-gray-500">{interview?.company}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
            <Button 
              size="sm" 
              onClick={handleSubmitInterview}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Interview"
              )}
            </Button>
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
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
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
              {loadingInterview ? (
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
              language={selectedLanguage} 
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
                    <Button variant="ghost" size="icon">
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle AI Insights</span>
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="max-h-[300px] overflow-y-auto">
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
            zIndex: 1000, 
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
                muted 
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