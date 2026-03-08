import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AddTrade from "@/pages/AddTrade";
import Journal from "@/pages/Journal";
import TradingCalendar from "@/pages/TradingCalendar";
import Analytics from "@/pages/Analytics";
import Leaderboard from "@/pages/Leaderboard";
import Reflections from "@/pages/Reflections";
import ConnectAccount from "@/pages/ConnectAccount";
import BacktestingGuide from "@/pages/BacktestingGuide";
import AdminPanel from "@/pages/AdminPanel";
import Landing from "@/pages/Landing";
import TradingNews from "@/pages/TradingNews";
import StrategyJournal from "@/pages/StrategyJournal";
import Backtesting from "@/pages/Backtesting";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/landing" replace />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-trade" element={<AddTrade />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/calendar" element={<TradingCalendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/reflections" element={<Reflections />} />
        <Route path="/connect" element={<ConnectAccount />} />
        <Route path="/backtesting-guide" element={<BacktestingGuide />} />
        <Route path="/news" element={<TradingNews />} />
        <Route path="/strategy-journal" element={<StrategyJournal />} />
        <Route path="/backtesting" element={<Backtesting />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

function LandingRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Landing />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/landing" element={<LandingRoute />} />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
