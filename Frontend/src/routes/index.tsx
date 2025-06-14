import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CreateInterview from "@/pages/CreateInterview";
import InterviewRoom from "@/pages/InterviewRoom";
import JoinInterview from "@/pages/JoinInterview";
import CandidateFeedback from "@/pages/CandidateFeedback";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/interview/create" element={user ? <CreateInterview /> : <Navigate to="/login" />} />
      <Route path="/interview/:id" element={user ? <InterviewRoom /> : <Navigate to="/login" />} />
      <Route path="/join-interview" element={<JoinInterview />} />
      <Route path="/feedback/:id" element={user ? <CandidateFeedback /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes; 