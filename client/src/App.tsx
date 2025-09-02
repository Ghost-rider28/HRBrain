import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Hiring from "@/pages/hiring";
import Evaluation from "@/pages/evaluation";
import Onboarding from "@/pages/onboarding";
import Support from "@/pages/support";
import FloatingChat from "@/components/shared/floating-chat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/hiring" component={Hiring} />
      <Route path="/evaluation" component={Evaluation} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/support" component={Support} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <FloatingChat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
