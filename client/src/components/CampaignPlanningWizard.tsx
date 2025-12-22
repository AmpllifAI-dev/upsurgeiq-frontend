import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Target, Users, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { HelpTooltip } from "@/components/HelpTooltip";

interface CampaignPlanningWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CampaignPlanningWizard({
  open,
  onOpenChange,
  onSuccess,
}: CampaignPlanningWizardProps) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);

  // Step 1: Campaign Basics
  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");

  // Step 2: Target Audience
  const [targetAudience, setTargetAudience] = useState("");

  // Step 3: Timeline & Budget
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  // Step 4: Platforms
  const [platforms, setPlatforms] = useState<string[]>([]);

  // Step 5: AI-Generated Strategy
  const [aiStrategy, setAiStrategy] = useState("");
  const [keyMessages, setKeyMessages] = useState("");
  const [successMetrics, setSuccessMetrics] = useState("");

  const createMutation = trpc.campaign.create.useMutation({
    onSuccess: () => {
      toast.success("Campaign created!", {
        description: "Your AI-powered campaign strategy is ready to execute.",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create campaign");
    },
  });

  const updateMutation = trpc.campaign.update.useMutation({
    onSuccess: () => {},
    onError: (error) => {
      toast.error(error.message || "Failed to update campaign");
    },
  });

  // Load template from session storage if available
  useEffect(() => {
    if (open && !templateLoaded) {
      const templateData = sessionStorage.getItem("campaignTemplate");
      if (templateData) {
        try {
          const template = JSON.parse(templateData);
          setCampaignName(template.name || "");
          setCampaignGoal(template.goal || "");
          setTargetAudience(template.targetAudience || "");
          setBudget(template.suggestedBudget || "");
          setPlatforms(template.platforms ? template.platforms.split(", ") : []);
          setAiStrategy(template.strategy || "");
          setKeyMessages(template.keyMessages || "");
          setSuccessMetrics(template.successMetrics || "");
          
          // Calculate suggested dates based on duration
          if (template.suggestedDuration) {
            const today = new Date();
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + template.suggestedDuration);
            setStartDate(today.toISOString().split('T')[0]);
            setEndDate(endDate.toISOString().split('T')[0]);
          }
          
          setTemplateLoaded(true);
          sessionStorage.removeItem("campaignTemplate");
          toast.success("Template loaded!", {
            description: "Campaign wizard pre-filled with template data.",
          });
        } catch (error) {
          console.error("Failed to parse template data:", error);
        }
      }
    }
  }, [open, templateLoaded]);

  const resetForm = () => {
    setStep(1);
    setCampaignName("");
    setCampaignGoal("");
    setTargetAudience("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setPlatforms([]);
    setAiStrategy("");
    setKeyMessages("");
    setSuccessMetrics("");
    setTemplateLoaded(false);
  };

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const generateStrategyMutation = trpc.ai.generateCampaignStrategy.useMutation({
    onSuccess: (data) => {
      setAiStrategy(data.strategy || "");
      setKeyMessages(data.keyMessages || "");
      setSuccessMetrics(data.successMetrics || "");
      setStep(5);
      setGenerating(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI strategy. Please try again.");
      setGenerating(false);
    },
  });

  const generateStrategy = () => {
    setGenerating(true);
    generateStrategyMutation.mutate({
      campaignName,
      goal: campaignGoal,
      targetAudience,
      platforms: platforms.join(", "),
      budget,
    });
  };

  const handleNext = () => {
    if (step === 1 && (!campaignName || !campaignGoal)) {
      toast.error("Please enter campaign name and goal");
      return;
    }
    if (step === 2 && !targetAudience) {
      toast.error("Please describe your target audience");
      return;
    }
    if (step === 3 && (!startDate || !endDate || !budget)) {
      toast.error("Please enter timeline and budget");
      return;
    }
    if (step === 4 && platforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    if (step === 4) {
      generateStrategy();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    createMutation.mutate({
      name: campaignName,
      goal: campaignGoal,
      targetAudience,
      startDate,
      endDate,
      budget,
      platforms: platforms.join(","),
      status: "planning",
      aiGeneratedStrategy: aiStrategy,
      keyMessages,
      successMetrics,
    });
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Campaign Planning Wizard
          </DialogTitle>
          <DialogDescription>
            Let's create a comprehensive campaign strategy with AI assistance
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Campaign Basics */}
        {step === 1 && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Campaign Basics</h3>
                <p className="text-sm text-muted-foreground">
                  Define your campaign name and primary goal
                </p>
              </div>
            </div>

            <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <HelpTooltip content="Give your campaign a clear, descriptive name that reflects its purpose. This will help you identify it later." />
              </div>
              <Input
                  id="campaignName"
                  placeholder="e.g., Spring Product Launch 2025"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="campaignGoal">Campaign Goal *</Label>
                <HelpTooltip content="Describe what you want to achieve with this campaign. Be specific about your objectives (e.g., increase brand awareness, drive sales, launch a product)." />
              </div>
              <Textarea
                  id="campaignGoal"
                  placeholder="What do you want to achieve? (e.g., Generate 500 qualified leads, Increase brand awareness by 30%, Launch new product line)"
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Target Audience */}
        {step === 2 && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Target Audience</h3>
                <p className="text-sm text-muted-foreground">
                  Describe who you're trying to reach
                </p>
              </div>
            </div>

            <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <HelpTooltip content="Describe your ideal audience in detail. Include demographics (age, location), psychographics (interests, values), and behaviors. The more specific you are, the better the AI can tailor your strategy." />
              </div>
              <Textarea
                  id="targetAudience"
                  placeholder="Describe your ideal audience: demographics, interests, pain points, behaviors, etc. (e.g., Small business owners aged 30-50, interested in digital marketing, struggling with social media management)"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  rows={6}
                />
              </div>

              <Card className="bg-muted/50 border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Tip:</strong> The more specific you are about your target audience,
                    the better AI can tailor your campaign strategy and messaging.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Timeline & Budget */}
        {step === 3 && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Timeline & Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Set your campaign duration and budget
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

                 <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
              <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Campaign Budget (£) *
                </Label>
                <HelpTooltip content="Enter your total campaign budget in GBP. This will help the AI recommend appropriate strategies and tactics within your budget constraints." />
              </div>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your total campaign budget in British Pounds
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Platforms */}
        {step === 4 && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Select Platforms</h3>
                <p className="text-sm text-muted-foreground">
                  Choose where you'll run your campaign
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Facebook", "Instagram", "LinkedIn", "X (Twitter)", "Email", "Press Release"].map(
                (platform) => (
                  <Card
                    key={platform}
                    className={`cursor-pointer transition-all ${
                      platforms.includes(platform)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => togglePlatform(platform)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="font-medium">{platform}</span>
                      {platforms.includes(platform) && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        )}

        {/* Step 5: AI-Generated Strategy */}
        {step === 5 && (
          <div className="space-y-6 py-4">
            {generating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Generating Your Campaign Strategy...</h3>
                  <p className="text-sm text-muted-foreground">
                    AI is analyzing your inputs and creating a comprehensive campaign plan
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI-Generated Strategy</h3>
                    <p className="text-sm text-muted-foreground">
                      Review and customize your campaign strategy
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Campaign Strategy</Label>
                    <Textarea
                      value={aiStrategy}
                      onChange={(e) => setAiStrategy(e.target.value)}
                      rows={6}
                      placeholder="AI-generated campaign strategy will appear here..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Messages</Label>
                    <Textarea
                      value={keyMessages}
                      onChange={(e) => setKeyMessages(e.target.value)}
                      rows={4}
                      placeholder="AI-generated key messages will appear here..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Success Metrics</Label>
                    <Textarea
                      value={successMetrics}
                      onChange={(e) => setSuccessMetrics(e.target.value)}
                      rows={4}
                      placeholder="AI-generated success metrics will appear here..."
                    />
                  </div>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-sm">
                      <strong>Note:</strong> You can edit any of these AI-generated suggestions
                      to better match your vision before creating the campaign.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || generating || createMutation.isPending}
          >
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={generating || createMutation.isPending}
            >
              Cancel
            </Button>

            {step < 5 ? (
              <Button onClick={handleNext} disabled={generating}>
                {step === 4 ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Strategy
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={generating || createMutation.isPending || !aiStrategy}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
