
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Exchange from "./pages/Exchange";
import Launchpad from "./pages/Launchpad";
import Game from "./pages/Game";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import React from "react";

const App = () => {
  // Create a new QueryClient instance inside the component
  // to avoid React hook issues
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30000,
      },
    },
  });
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/exchange" element={
                  <ProtectedRoute>
                    <Layout><Exchange /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/launchpad" element={
                  <ProtectedRoute>
                    <Layout><Launchpad /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/game" element={
                  <ProtectedRoute>
                    <Layout><Game /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
