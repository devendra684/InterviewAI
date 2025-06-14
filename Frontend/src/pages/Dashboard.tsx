
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
  MoreHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [userRole, setUserRole] = useState("recruiter"); // or "candidate"
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const upcomingInterviews = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      candidate: "John Smith",
      candidateEmail: "john@example.com",
      date: "2024-06-14",
      time: "14:00",
      duration: 60,
      status: "scheduled",
      language: "JavaScript"
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      candidate: "Sarah Johnson",
      candidateEmail: "sarah@example.com",
      date: "2024-06-14",
      time: "16:00",
      duration: 90,
      status: "scheduled",
      language: "Python"
    }
  ];

  const recentInterviews = [
    {
      id: 3,
      title: "Backend Developer",
      candidate: "Mike Wilson",
      date: "2024-06-13",
      status: "completed",
      score: 85,
      language: "Java"
    },
    {
      id: 4,
      title: "DevOps Engineer",
      candidate: "Lisa Chen",
      date: "2024-06-12",
      status: "completed",
      score: 92,
      language: "Python"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
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
      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InterviewAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentTime.toLocaleTimeString()}
              </span>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Alex!
          </h1>
          <p className="text-gray-600">
            {userRole === "recruiter" 
              ? "Manage your interviews and review candidate performance" 
              : "View your upcoming interviews and track your progress"
            }
          </p>
        </div>

        {/* Stats Cards */}
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
            <div className="grid gap-4">
              {upcomingInterviews.map((interview) => (
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
                          <Badge variant="outline">
                            {interview.language}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{interview.candidate}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {interview.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {interview.time} ({interview.duration}min)
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
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="grid gap-4">
              {recentInterviews.map((interview) => (
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
                          <Badge variant="outline">
                            {interview.language}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{interview.candidate}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {interview.date}
                          </div>
                          <div className="flex items-center">
                            <Brain className="w-4 h-4 mr-1" />
                            AI Score: <span className={`ml-1 font-semibold ${getScoreColor(interview.score)}`}>
                              {interview.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link to={`/interview/${interview.id}/report`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Performance</CardTitle>
                  <CardDescription>
                    Average scores over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                  <CardDescription>
                    Most frequently tested technologies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["JavaScript", "Python", "React", "Node.js", "Java"].map((skill, index) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="font-medium">{skill}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" 
                              style={{ width: `${(5-index) * 20}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{(5-index) * 20}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;