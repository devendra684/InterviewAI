import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Brain, 
  Settings,
  LogOut,
  Play,
  Eye,
  MoreHorizontal,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from '@/components/Navbar';

interface Interview { // Define an interface for Interview
  id: string;
  title: string;
  company: string;
  description?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  duration: number;
  startTime?: string;
  endTime?: string;
  joinCode: string;
  interviewerId: string;
  candidateId?: string;
  score?: number; // Add score for recent interviews
  language?: string; // Add language for recent interviews
}

const Dashboard = () => {
  const [userRole, setUserRole] = useState("candidate"); // Default to candidate for initial render
  const [currentTime, setCurrentTime] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { logout, user, token } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && user.role) {
      setUserRole(user.role.toLowerCase());
    }
  }, [user]);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!token) {
        setLoading(false);
        setError("Not authenticated. Please log in.");
        return;
      }
      setLoading(true);
      const controller = new AbortController();
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/interviews`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data: Interview[] = await response.json();
        setInterviews(data);
      } catch (err: any) {
        console.error("Failed to fetch interviews:", err);
        setError(err.message || "Failed to load interviews.");
      } finally {
        setLoading(false);
      }
      return () => controller.abort();
    };
    fetchInterviews();
  }, [token]); // Refetch when token changes (login/logout)

  const upcomingInterviews = interviews.filter(
    (interview) =>
      interview.status === "SCHEDULED" &&
      new Date(interview.startTime || new Date()).getTime() > Date.now()
  ).sort((a, b) => new Date(a.startTime || '').getTime() - new Date(b.startTime || '').getTime());

  const recentInterviews = interviews.filter(
    (interview) =>
      interview.status === "COMPLETED" ||
      new Date(interview.startTime || new Date()).getTime() < Date.now()
  ).sort((a, b) => new Date(b.startTime || '').getTime() - new Date(a.startTime || '').getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-gray-100 text-gray-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user ? user.name || user.email : 'User'}!
          </h1>
          <p className="text-gray-600">
            {userRole === "recruiter" 
              ? "Manage your interviews and review candidate performance" 
              : "View your upcoming interviews and track your progress"
            }
          </p>
        </div>

        {/* Stats Cards - These are still mock, will integrate later if needed */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                This Week
              </CardTitle>
              <Calendar className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="text-xs text-gray-600">Interviews scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Now
              </CardTitle>
              <Video className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">2</div>
              <p className="text-xs text-gray-600">Live interviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg. Score
              </CardTitle>
              <Brain className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">87</div>
              <p className="text-xs text-gray-600">AI assessment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Success Rate
              </CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">73%</div>
              <p className="text-xs text-gray-600">Candidates passed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            {userRole === "recruiter" && (
              <Link to="/interview/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Interview
                </Button>
              </Link>
            )}
          </div>

          <TabsContent value="upcoming">
            {loading && <p className="text-center text-gray-500">Loading interviews...</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}
            {!loading && !error && upcomingInterviews.length === 0 && (
              <p className="text-center text-gray-500">No upcoming interviews.</p>
            )}
            <div className="grid gap-4">
              {!loading && !error && upcomingInterviews.map((interview) => (
                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {interview.title}
                          </h3>
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>
                          {interview.language && (
                            <Badge variant="outline">
                              {interview.language}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{interview.candidateId}</p> {/* Display candidateId for now */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {interview.startTime ? new Date(interview.startTime).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {interview.startTime ? new Date(interview.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} ({interview.duration}min)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link to={`/interview/${interview.id}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                          Options
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            {loading && <p className="text-center text-gray-500">Loading interviews...</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}
            {!loading && !error && recentInterviews.length === 0 && (
              <p className="text-center text-gray-500">No recent interviews.</p>
            )}
            <div className="grid gap-4">
              {!loading && !error && recentInterviews.map((interview) => (
                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {interview.title}
                          </h3>
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>
                          {interview.language && (
                            <Badge variant="outline">
                              {interview.language}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{interview.candidateId}</p> {/* Display candidateId for now */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {interview.startTime ? new Date(interview.startTime).toLocaleDateString() : 'N/A'}
                          </div>
                          {interview.score && (
                            <div className="flex items-center">
                              <Brain className="w-4 h-4 mr-1" />
                              <span className={getScoreColor(interview.score)}>{interview.score}%</span> AI Score
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link to={`/interview/${interview.id}/feedback`}>
                          <Button size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                          Options
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center text-gray-500 py-10">
              Analytics content goes here.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;