import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useGlobalShortcuts } from "./hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "./components/KeyboardShortcutsDialog";
import { CommandPalette } from "./components/CommandPalette";
import { useState, useEffect } from "react";
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
import CampaignDetail from "./pages/CampaignDetail";
import CampaignTemplates from "./pages/CampaignTemplates";
import Partners from "./pages/Partners";
import WordPressSettings from "./pages/WordPressSettings";
import ErrorLogs from "./pages/ErrorLogs";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import PressReleaseDistribution from "./pages/PressReleaseDistribution";
import DistributePressRelease from "./pages/DistributePressRelease";
import Help from "./pages/Help";
import ContentCalendar from "./pages/ContentCalendar";
import EmailTemplates from "./pages/EmailTemplates";
import PressReleaseTemplates from "./pages/PressReleaseTemplates";
import TeamManagement from "./pages/TeamManagement";
import WebhookSettings from "./pages/WebhookSettings";
import JournalistList from "./pages/JournalistList";
import JournalistForm from "./pages/JournalistForm";
import JournalistDetail from "./pages/JournalistDetail";
import AdminCreditMonitoring from "./pages/AdminCreditMonitoring";
import AdminAlertManagement from "./pages/AdminAlertManagement";

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
      <Route path="/press-release/:id/distribution" component={PressReleaseDistribution} />
      <Route path="/press-releases/:id/distribute" component={DistributePressRelease} />
      <Route path="/social-media/new" component={SocialMediaNew} />
      <Route path="/media-lists" component={MediaLists} />
      <Route path="/journalists" component={JournalistList} />
      <Route path="/journalists/new" component={JournalistForm} />
      <Route path="/journalists/:id" component={JournalistDetail} />
      <Route path="/journalists/:id/edit" component={JournalistForm} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/campaign-lab" component={CampaignLab} />
      <Route path="/dashboard/campaign/:id" component={CampaignDetail} />
      <Route path="/dashboard/campaign-lab" component={CampaignLab} />
      <Route path="/dashboard/campaign-templates" component={CampaignTemplates} />
      <Route path="/partners" component={Partners} />
      <Route path="/wordpress-settings" component={WordPressSettings} />
      <Route path="/error-logs" component={ErrorLogs} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/profile" component={Profile} />
      <Route path="/content-calendar" component={ContentCalendar} />
      <Route path="/email-templates" component={EmailTemplates} />
      <Route path="/press-release-templates" component={PressReleaseTemplates} />
      <Route path="/team" component={TeamManagement} />
      <Route path="/webhook-settings" component={WebhookSettings} />
      <Route path="/help" component={Help} />
      <Route path="/admin/credit-monitoring" component={AdminCreditMonitoring} />
      <Route path="/admin/alerts" component={AdminAlertManagement} />
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
  useGlobalShortcuts();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for command palette (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <KeyboardShortcutsDialog />
          <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
