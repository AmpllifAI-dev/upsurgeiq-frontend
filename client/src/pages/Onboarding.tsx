import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Building2, Palette, Globe, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type OnboardingStep = "company" | "industry" | "brand" | "social" | "complete";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("company");
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [sicSection, setSicSection] = useState("");
  const [sicDivision, setSicDivision] = useState("");
  const [sicGroup, setSicGroup] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [brandStyle, setBrandStyle] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [aiImageStyle, setAiImageStyle] = useState("");
  const [aiImageMood, setAiImageMood] = useState("");

  const createBusinessMutation = trpc.business.create.useMutation({
    onSuccess: () => {
      setCurrentStep("complete");
      toast.success("Business profile created successfully!");
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create business profile");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const steps: { id: OnboardingStep; title: string; icon: any }[] = [
    { id: "company", title: "Company Info", icon: Building2 },
    { id: "industry", title: "Industry", icon: Globe },
    { id: "brand", title: "Brand Voice", icon: Palette },
    { id: "social", title: "Social Media", icon: Zap },
    { id: "complete", title: "Complete", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep === "company") {
      if (!companyName) {
        toast.error("Company name required", {
          description: "Please enter your company name to continue."
        });
        return;
      }
      if (!website) {
        toast.error("Website required", {
          description: "Please enter your company website URL to help us understand your brand."
        });
        return;
      }
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        toast.error("Invalid website URL", {
          description: "Please enter a valid URL starting with http:// or https://"
        });
        return;
      }
      setCurrentStep("industry");
    } else if (currentStep === "industry") {
      if (!sicSection) {
        toast.error("Industry section required", {
          description: "Please select your primary industry section."
        });
        return;
      }
      if (!sicDivision) {
        toast.error("Industry division required", {
          description: "Please select your industry division within the section."
        });
        return;
      }
      if (!sicGroup) {
        toast.error("Industry group required", {
          description: "Please select your specific industry group for targeted media lists."
        });
        return;
      }
      setCurrentStep("brand");
    } else if (currentStep === "brand") {
      if (!brandTone) {
        toast.error("Brand tone required", {
          description: "Please select a tone that matches how you want to communicate with your audience."
        });
        return;
      }
      if (!brandStyle) {
        toast.error("Brand style required", {
          description: "Please select a style that reflects your brand personality."
        });
        return;
      }
      setCurrentStep("social");
    } else if (currentStep === "social") {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsGeneratingDossier(true);
    
    // Simulate AI dossier generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const dossier = `${companyName} is a ${sicGroup} company focused on ${targetAudience || "their target market"}. 
    The brand communicates with a ${brandTone} tone and ${brandStyle} style, positioning itself as a professional 
    and innovative player in the ${sicSection} sector.`;

    createBusinessMutation.mutate({
      name: companyName,
      website,
      sicSection,
      sicDivision,
      sicGroup,
      brandVoiceTone: brandTone as any,
      brandVoiceStyle: brandStyle as any,
      targetAudience,
      dossier,
      aiImageStyle,
      aiImageMood,
    });
  };

  const handleBack = () => {
    if (currentStep === "industry") setCurrentStep("company");
    else if (currentStep === "brand") setCurrentStep("industry");
    else if (currentStep === "social") setCurrentStep("brand");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-12 max-w-4xl">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center gap-2 flex-1 min-w-[80px]">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-center">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <Badge variant="secondary" className="w-fit mb-2">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
            <CardTitle className="text-3xl">
              {currentStep === "company" && "Tell us about your company"}
              {currentStep === "industry" && "Select your industry"}
              {currentStep === "brand" && "Define your brand voice"}
              {currentStep === "social" && "Connect social media (Optional)"}
              {currentStep === "complete" && "All set!"}
            </CardTitle>
            <CardDescription>
              {currentStep === "company" && "We'll use this information to create your personalized business dossier"}
              {currentStep === "industry" && "This helps us curate relevant media lists and content"}
              {currentStep === "brand" && "Choose how you want your AI-generated content to sound"}
              {currentStep === "social" && "Connect your social accounts or skip for now"}
              {currentStep === "complete" && "Your business profile is being created"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === "company" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website *</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Our AI will analyze your website to understand your business
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="Describe your ideal customer..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {currentStep === "industry" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sicSection">Industry Section *</Label>
                  <Select value={sicSection} onValueChange={setSicSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="technology">Technology & Information</SelectItem>
                      <SelectItem value="professional">Professional Services</SelectItem>
                      <SelectItem value="retail">Retail & Wholesale</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance & Insurance</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="hospitality">Hospitality & Food Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sicDivision">Division *</Label>
                  <Select value={sicDivision} onValueChange={setSicDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software & SaaS</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sicGroup">Group *</Label>
                  <Select value={sicGroup} onValueChange={setSicGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2b_software">B2B Software</SelectItem>
                      <SelectItem value="b2c_software">B2C Software</SelectItem>
                      <SelectItem value="management_consulting">Management Consulting</SelectItem>
                      <SelectItem value="marketing_consulting">Marketing Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {currentStep === "brand" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="brandTone">Brand Tone *</Label>
                  <Select value={brandTone} onValueChange={setBrandTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal & Professional</SelectItem>
                      <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                      <SelectItem value="inspirational">Inspirational & Visionary</SelectItem>
                      <SelectItem value="witty">Witty & Playful</SelectItem>
                      <SelectItem value="educational">Educational & Informative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandStyle">Brand Style *</Label>
                  <Select value={brandStyle} onValueChange={setBrandStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise & To-the-Point</SelectItem>
                      <SelectItem value="detailed">Detailed & Thorough</SelectItem>
                      <SelectItem value="story_driven">Story-Driven & Narrative</SelectItem>
                      <SelectItem value="data_driven">Data-Driven & Analytical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiImageStyle">AI Image Style (Optional)</Label>
                  <Input
                    id="aiImageStyle"
                    placeholder="Modern, minimalist, vibrant..."
                    value={aiImageStyle}
                    onChange={(e) => setAiImageStyle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiImageMood">AI Image Mood (Optional)</Label>
                  <Input
                    id="aiImageMood"
                    placeholder="Professional, energetic, calm..."
                    value={aiImageMood}
                    onChange={(e) => setAiImageMood(e.target.value)}
                  />
                </div>
              </>
            )}

            {currentStep === "social" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your social media accounts to enable automatic posting. You can also do this later from your dashboard.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20" disabled>
                    <div className="text-center">
                      <div className="font-semibold">Facebook</div>
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20" disabled>
                    <div className="text-center">
                      <div className="font-semibold">Instagram</div>
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20" disabled>
                    <div className="text-center">
                      <div className="font-semibold">LinkedIn</div>
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20" disabled>
                    <div className="text-center">
                      <div className="font-semibold">X (Twitter)</div>
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "complete" && (
              <div className="text-center py-8">
                {isGeneratingDossier ? (
                  <>
                    <Zap className="w-16 h-16 text-primary mx-auto animate-pulse mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Generating your business dossier...</h3>
                    <p className="text-muted-foreground">Our AI is analyzing your information</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All set!</h3>
                    <p className="text-muted-foreground">Redirecting to your dashboard...</p>
                  </>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== "complete" && (
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === "company"}
                >
                  Back
                </Button>
                <Button onClick={handleNext} disabled={createBusinessMutation.isPending}>
                  {currentStep === "social" ? "Complete Setup" : "Continue"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
