import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Clock, Users, Mail, User, BookOpen, Hash, ArrowLeft, Code, Check, ChevronsUpDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

const CreateInterview = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    candidateEmail: "",
    duration: 60,
    startTime: new Date(),
    selectedQuestions: [] as string[],
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({ ...prev }));
    }
    fetchQuestions();
  }, [user]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/questions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionToggle = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(questionId)
        ? prev.selectedQuestions.filter(id => id !== questionId)
        : [...prev.selectedQuestions, questionId]
    }));
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.filter(id => id !== questionId)
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      if (formData.startTime) {
        newDate.setHours(formData.startTime.getHours());
        newDate.setMinutes(formData.startTime.getMinutes());
      }
      setFormData(prev => ({ ...prev, startTime: newDate }));
    }
  };

  const handleTimeChange = (timeString: string) => {
    if (!timeString) return;
    
    const [hours, minutes] = timeString.split(':').map((v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
});
    const newDate = new Date(formData.startTime || new Date());
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setFormData(prev => ({ ...prev, startTime: newDate }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!user || !token) {
      setError("You must be logged in to create an interview.");
      setIsLoading(false);
      return;
    }

    if (user.role?.toLowerCase() !== "recruiter" && user.role?.toLowerCase() !== "admin") {
      setError("Only recruiters and admins can schedule interviews.");
      setIsLoading(false);
      return;
    }

    if (formData.selectedQuestions.length === 0) {
      setError("Please select at least one question for the interview.");
      setIsLoading(false);
      return;
    }

    try {
      const candidateResponse = await fetch(`http://localhost:3001/api/users/by-email/${encodeURIComponent(formData.candidateEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const candidateData = await candidateResponse.json();
      
      if (!candidateResponse.ok) {
        throw new Error(candidateData.message || "Candidate not found. Please make sure they are registered in the system.");
      }

      if (candidateData.role !== "CANDIDATE") {
        throw new Error("The specified user is not registered as a candidate.");
      }
      
      const response = await fetch('http://localhost:3001/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          company: user.company || "Default Company",
          description: formData.description || "",
          interviewerId: user.id,
          candidateId: candidateData.id,
          duration: formData.duration * 60,
          startTime: formData.startTime.toISOString(),
          questionIds: formData.selectedQuestions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Interview scheduled successfully.",
          variant: "default",
        });
        navigate("/dashboard");
      } else {
        setError(data.message || "Failed to schedule interview.");
      }
    } catch (err: any) {
      console.error("Create interview error:", err);
      setError(err.message || "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl">
              <Link to="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>

              <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      InterviewAI
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Schedule New Interview</CardTitle>
                  <CardDescription className="text-gray-600">
                    Fill in the details to schedule a new coding interview.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Interview Title</Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="e.g., Senior Frontend Engineer Interview"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        type="text"
                        placeholder="Brief description of the interview"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="candidateEmail">Candidate Email</Label>
                      <Input
                        id="candidateEmail"
                        type="email"
                        placeholder="candidate@example.com"
                        value={formData.candidateEmail}
                        onChange={(e) => handleInputChange("candidateEmail", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !formData.startTime && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startTime ? format(formData.startTime, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.startTime}
                              onSelect={handleDateSelect}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.startTime ? format(formData.startTime, "HH:mm") : ""}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="e.g., 60"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                        min="15"
                        step="15"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Select Questions</Label>
                      <div className="flex flex-col gap-2">
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                            >
                              Select questions...
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className=" p-0">
                            <Command>
                              <CommandInput placeholder="Search questions..." />
                              <CommandEmpty>No questions found.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {questions.map((question) => (
                                  <CommandItem
                                    key={question.id}
                                    onSelect={() => {
                                      handleQuestionToggle(question.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.selectedQuestions.includes(question.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{question.title}</span>
                                      <span className="text-sm text-gray-500">
                                        Difficulty: {question.difficulty}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.selectedQuestions.map((questionId) => {
                            const question = questions.find(q => q.id === questionId);
                            return question ? (
                              <Badge
                                key={questionId}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {question.title}
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(questionId)}
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove {question.title}</span>
                                </button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Scheduling..." : "Schedule Interview"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateInterview;
 