import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone, 
  Users, 
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  X,
  Save,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import VideoCall from "@/components/VideoCall";
import NotesEditor from "@/components/NotesEditor";

const Interview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const userRole = searchParams.get("role") || "recruiter"; // Get role from URL
  
  const [currentTab, setCurrentTab] = useState("main.js");
  const [isRecording, setIsRecording] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLimit, setTimeLimit] = useState(3600); // 60 minutes
  const [participants, setParticipants] = useState([
    { id: 1, name: "Alex Smith", role: "recruiter", isOnline: true },
    { id: 2, name: "John Doe", role: "candidate", isOnline: true }
  ]);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [tabs, setTabs] = useState([
    { id: "main.js", name: "main.js", language: "javascript", code: "// Welcome to your coding interview!\n// Write your solution here\n\nfunction solve(input) {\n  // Your code here\n  return result;\n}" }
  ]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= timeLimit) {
          // Time's up!
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit]);

  // Simulate window blur detection
  useEffect(() => {
    const handleWindowBlur = () => {
      if (violationCount < 3) {
        setViolationCount(prev => prev + 1);
        setShowViolationWarning(true);
        setTimeout(() => setShowViolationWarning(false), 5000);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [violationCount]);

  const handleEndInterview = () => {
    // Show confirmation toast
    toast({
      title: "Interview Ended",
      description: "The interview has been ended successfully. Redirecting...",
    });
    
    // Navigate based on user role
    setTimeout(() => {
      if (userRole === "candidate") {
        navigate(`/feedback/${id}`);
      } else {
        navigate(`/interview/${id}/report`);
      }
    }, 2000);
  };

  const handleSaveCode = () => {
    // Save current code
    const currentTabData = tabs.find(tab => tab.id === currentTab);
    
    // In a real app, this would save to backend
    console.log('Saving code for tab:', currentTab, currentTabData?.code);
    
    toast({
      title: "Code Saved",
      description: "Your code has been saved successfully.",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const addNewTab = () => {
    const newTabName = `file${tabs.length + 1}.js`;
    const newTab = {
      id: newTabName,
      name: newTabName,
      language: "javascript",
      code: "// New file\n"
    };
    setTabs([...tabs, newTab]);
    setCurrentTab(newTabName);
  };

  const removeTab = (tabId: string) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(newTabs);
      if (currentTab === tabId) {
        setCurrentTab(newTabs[0].id);
      }
    }
  };

  const updateTabCode = (tabId: string, newCode: string) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId ? { ...tab, code: newCode } : tab
    ));
  };

  const currentTabData = tabs.find(tab => tab.id === currentTab);
  const timeRemaining = timeLimit - timeElapsed;
  const timePercentage = (timeElapsed / timeLimit) * 100;

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
              <h1 className="text-lg font-semibold text-gray-900">Frontend Developer Interview</h1>
              <p className="text-sm text-gray-600">with John Doe</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <div className="text-sm">
                <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-gray-500 ml-1">remaining</span>
              </div>
            </div>

            {/* Participants */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">{participants.length} online</span>
            </div>

            {/* Recording Status */}
            <Badge className={isRecording ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
              {isRecording ? "Recording" : "Not Recording"}
            </Badge>

            {/* End Interview */}
            <Button variant="destructive" size="sm" onClick={handleEndInterview}>
              <Square className="w-4 h-4 mr-2" />
              End Interview
            </Button>
          </div>
        </div>

        {/* Time Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-1000 ${
                timePercentage > 80 ? 'bg-red-500' : timePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${timePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Violation Warning */}
      {showViolationWarning && (
        <Alert className="mx-6 mt-4 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Warning #{violationCount}:</strong> Window focus lost detected. Please keep the interview window active.
            {violationCount >= 2 && " Further violations may result in interview termination."}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col bg-white border-r">
          {/* Tab Bar */}
          <div className="border-b bg-gray-50 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 overflow-x-auto">
                {tabs.map(tab => (
                  <div
                    key={tab.id}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-md cursor-pointer transition-colors ${
                      currentTab === tab.id 
                        ? 'bg-white border shadow-sm' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentTab(tab.id)}
                  >
                    <Code className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{tab.name}</span>
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTab(tab.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addNewTab}
                  className="flex items-center space-x-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleSaveCode}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <select className="text-sm border rounded px-2 py-1">
                  <option>JavaScript</option>
                  <option>Python</option>
                  <option>Java</option>
                  <option>C++</option>
                </select>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              value={currentTabData?.code || ""}
              language={currentTabData?.language || "javascript"}
              onChange={(value) => updateTabCode(currentTab, value)}
            />
          </div>
        </div>

        {/* Right Panel - Video & Notes */}
        <div className="w-96 flex flex-col bg-white">
          <Tabs defaultValue="video" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="video">Video Call</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="flex-1 p-4 pt-2">
              <div className="h-full flex flex-col">
                {/* Video Call Component */}
                <div className="flex-1 mb-4">
                  <VideoCall />
                </div>

                {/* Video Controls */}
                <div className="flex justify-center space-x-3 bg-gray-50 rounded-lg p-3">
                  <Button 
                    variant={isVideoEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant={isAudioEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  >
                    {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>

                {/* Participants List */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Participants</h3>
                  <div className="space-y-2">
                    {participants.map(participant => (
                      <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm font-medium">{participant.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {participant.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 p-4 pt-2">
              <div className="h-full">
                <NotesEditor />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Interview;
