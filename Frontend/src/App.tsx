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
import RecruiterFeedback from '@/pages/RecruiterFeedback';
import NotFound from '@/pages/NotFound';
import CreateInterview from '@/pages/CreateInterview';
import Questions from './pages/Questions';
import AppRoutes from './routes';

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
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;