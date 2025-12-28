import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/common";
import { FIXTURE_TRIP_ID } from "@/config/constants";
import Index from "./pages/Index";
import TripDetailPage from "./pages/TripDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/trips" element={<Index />} />
            <Route path="/trip/:tripId" element={<TripDetailPage />} />
            <Route path="/planner" element={<Navigate to={`/trip/${FIXTURE_TRIP_ID}`} replace />} />
            <Route path="/neighborhoods" element={<Navigate to={`/trip/${FIXTURE_TRIP_ID}?view=neighborhoods`} replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
