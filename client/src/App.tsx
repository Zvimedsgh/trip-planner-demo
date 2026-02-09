import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import SharedTrip from "./pages/SharedTrip";
import Instructions from "./pages/Instructions";
import InviteLink from "./pages/InviteLink";
import Demo from "./pages/Demo";
import { DemoBanner } from "./components/DemoBanner";
import { DemoExpiryDialog } from "./components/DemoExpiryDialog";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demo" component={Demo} />
      <Route path="/trips" component={Trips} />
      <Route path="/trip/:id" component={TripDetail} />
      <Route path="/shared/:token" component={SharedTrip} />
      <Route path="/invite/:token" component={InviteLink} />
      <Route path="/instructions" component={Instructions} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <DemoBanner />
            <DemoExpiryDialog />
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
