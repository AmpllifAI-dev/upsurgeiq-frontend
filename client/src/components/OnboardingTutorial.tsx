import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { trpc } from "@/lib/trpc";

interface OnboardingTutorialProps {
  tour: "dashboard" | "press-release" | "campaign" | "white-label";
}

const tourSteps: Record<string, Step[]> = {
  dashboard: [
    {
      target: ".dashboard-overview",
      content: "Welcome to UpsurgeIQ! This is your main dashboard where you can see all your activity at a glance.",
      disableBeacon: true,
    },
    {
      target: ".sidebar-press-releases",
      content: "Create and manage AI-powered press releases here. Choose between AI-assisted or manual distribution modes.",
    },
    {
      target: ".sidebar-campaigns",
      content: "Launch multi-channel marketing campaigns with our Intelligent Campaign Lab.",
    },
    {
      target: ".sidebar-analytics",
      content: "Track performance metrics, download reports, and analyze your content's impact.",
    },
    {
      target: ".usage-widget",
      content: "Monitor your tier limits and get intelligent upgrade recommendations based on usage patterns.",
    },
  ],
  "press-release": [
    {
      target: ".press-release-form",
      content: "Let's create your first press release! Fill in the basic information about your announcement.",
      disableBeacon: true,
    },
    {
      target: ".distribution-type-selector",
      content: "Choose AI-Assisted for smart distribution (uses tier credits) or Manual Distribution for unlimited self-service releases.",
    },
    {
      target: ".tone-selector",
      content: "Select the tone that matches your brand voice - from formal corporate to casual and friendly.",
    },
    {
      target: ".target-audience-input",
      content: "Define your target audience to help AI optimize the content and distribution strategy.",
    },
    {
      target: ".schedule-section",
      content: "Schedule your release for a specific time or publish immediately. We support timezone selection for global audiences.",
    },
    {
      target: ".generate-button",
      content: "Click here to generate your press release! AI will create professional content based on your inputs.",
    },
  ],
  campaign: [
    {
      target: ".campaign-lab-header",
      content: "Welcome to the Intelligent Campaign Lab! Create multi-channel marketing campaigns here.",
      disableBeacon: true,
    },
    {
      target: ".campaign-name-input",
      content: "Give your campaign a memorable name that reflects your marketing goals.",
    },
    {
      target: ".campaign-objectives",
      content: "Define your campaign objectives - brand awareness, lead generation, product launch, or custom goals.",
    },
    {
      target: ".campaign-channels",
      content: "Select distribution channels: press releases, social media, email, and more. Mix and match for maximum reach.",
    },
    {
      target: ".campaign-timeline",
      content: "Set your campaign duration and key milestones. Track progress against your timeline.",
    },
    {
      target: ".campaign-budget",
      content: "Allocate budget across channels and monitor spending in real-time.",
    },
    {
      target: ".campaign-analytics",
      content: "View performance metrics with interactive charts showing impressions, clicks, and conversions over time.",
    },
  ],
  "white-label": [
    {
      target: ".white-label-settings",
      content: "Customize UpsurgeIQ with your client's branding! Perfect for agencies and resellers.",
      disableBeacon: true,
    },
    {
      target: ".logo-upload",
      content: "Upload your client's logo. It will replace the UpsurgeIQ logo throughout the platform.",
    },
    {
      target: ".color-pickers",
      content: "Choose primary and secondary brand colors. They'll be applied to buttons, charts, and UI elements.",
    },
    {
      target: ".company-name-input",
      content: "Enter your client's company name. It will appear in the sidebar and email templates.",
    },
    {
      target: ".preview-toggle",
      content: "Enable preview mode to see changes across the platform before saving. Navigate around to test the look!",
    },
    {
      target: ".email-preview",
      content: "See how transactional emails will look with your client's branding applied.",
    },
    {
      target: ".delivered-by-footer",
      content: "All white-labeled instances include a 'Delivered by UpsurgeIQ' attribution footer.",
    },
  ],
};

export default function OnboardingTutorial({ tour }: OnboardingTutorialProps) {
  const [run, setRun] = useState(false);
  const { data: preferences } = trpc.notificationPreferences.get.useQuery();
  const utils = trpc.useUtils();

  const updatePreferences = trpc.notificationPreferences.update.useMutation({
    onSuccess: () => {
      utils.notificationPreferences.get.invalidate();
    },
  });

  useEffect(() => {
    // Check if user has completed this tour before
    const completedTours = localStorage.getItem("completedTours");
    const tours = completedTours ? JSON.parse(completedTours) : [];
    
    if (!tours.includes(tour)) {
      // Start tour after a short delay
      setTimeout(() => setRun(true), 500);
    }
  }, [tour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // Mark tour as completed
      const completedTours = localStorage.getItem("completedTours");
      const tours = completedTours ? JSON.parse(completedTours) : [];
      
      if (!tours.includes(tour)) {
        tours.push(tour);
        localStorage.setItem("completedTours", JSON.stringify(tours));
      }
    }
  };

  const steps = tourSteps[tour] || [];

  if (steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "8px",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          borderRadius: "6px",
          padding: "8px 16px",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: "8px",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
}
