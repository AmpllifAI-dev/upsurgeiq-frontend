import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Subscribe from "./pages/Subscribe";
import Onboarding from "./pages/Onboarding";
import PressReleaseNew from "./pages/PressReleaseNew";
import PressReleases from "./pages/PressReleases";
import SocialMediaNew from "./pages/SocialMediaNew";
import MediaLists from "./pages/MediaLists";
import AIAssistant from "./pages/AIAssistant";
import CampaignLab from "./pages/CampaignLab";
import Partners from "./pages/Partners";
import WordPressSettings from "./pages/WordPressSettings";
import ErrorLogs from "./pages/ErrorLogs";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/press-releases/new" component={PressReleaseNew} />
      <Route path="/press-releases" component={PressReleases} />
      <Route path="/social-media/new" component={SocialMediaNew} />
      <Route path="/media-lists" component={MediaLists} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/campaign-lab" component={CampaignLab} />
      <Route path="/partners" component={Partners} />
      <Route path="/wordpress-settings" component={WordPressSettings} />
      <Route path="/error-logs" component={ErrorLogs} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
