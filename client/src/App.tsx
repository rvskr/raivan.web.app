import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthModal } from "@/components/auth-modal";
import { useAdmin } from "@/hooks/use-admin";
import { useState, useEffect } from "react";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAdmin, isLoading } = useAdmin();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Show auth modal after initial load if not admin (only once)
    if (!isLoading && !isAdmin && !localStorage.getItem('modalShown')) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
        localStorage.setItem('modalShown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAdmin]);

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
