import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocationProvider } from "@/context/location-context";
import { AppLayout } from "@/components/layout/app-layout";

// Pages
import Dashboard from "@/pages/dashboard";
import BreakPlanner from "@/pages/break-planner";
import AttendanceImport from "@/pages/attendance-import";
import AdminSettings from "@/pages/admin-settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/planner" component={BreakPlanner} />
        <Route path="/import" component={AttendanceImport} />
        <Route path="/settings" component={AdminSettings} />
        {/* Simple placeholder for directory to prevent 404s on nav click */}
        <Route path="/directory">
          <div className="text-muted-foreground p-12 text-center glass-panel rounded-xl">Directory implementation pending.</div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocationProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </LocationProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
