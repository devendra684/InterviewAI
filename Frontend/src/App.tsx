import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';

// Import your authentication context
import { AuthProvider } from '@/contexts/AuthContext';

import Index from '@/pages/index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import InterviewRoom from '@/pages/InterviewRoom';
import AIReport from '@/pages/AIReport';
import JoinInterview from '@/pages/JoinInterview';
import CandidateFeedback from '@/pages/CandidateFeedback';
import NotFound from '@/pages/NotFound';
import CreateInterview from '@/pages/CreateInterview';
import Positions from './pages/Positions';
import Questions from './pages/Questions';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter must wrap AuthProvider and all components using routing hooks */}
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/interview/create" element={<CreateInterview />} />
              <Route path="/interview/:id" element={<InterviewRoom />} />
              <Route path="/interview/:id/report" element={<AIReport />} />
              <Route path="/join" element={<JoinInterview />} />
              <Route path="/feedback/:id" element={<CandidateFeedback />} />
              <Route path="/positions" element={<Positions />} />
              <Route path="/questions" element={<Questions />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;