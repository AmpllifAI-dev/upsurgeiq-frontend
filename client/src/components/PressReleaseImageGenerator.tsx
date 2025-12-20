import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, RefreshCw, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PressReleaseImageGeneratorProps {
  title: string;
  content: string;
  onImageGenerated?: (imageUrl: string) => void;
}

export function PressReleaseImageGenerator({
  title,
  content,
  onImageGenerated,
}: PressReleaseImageGeneratorProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("photorealistic");
  const [selectedMood, setSelectedMood] = useState<string>("professional");
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const { data: stylePresets } = trpc.pressRelease.getImageStylePresets.useQuery();

  const generateMutation = trpc.pressRelease.generateImage.useMutation({
    onSuccess: (data) => {
      setGeneratedImage(data.url);
      if (onImageGenerated) {
        onImageGenerated(data.url);
      }
    },
  });

  const regenerateMutation = trpc.pressRelease.regenerateImage.useMutation({
    onSuccess: (data) => {
      setGeneratedImage(data.url);
      if (onImageGenerated) {
        onImageGenerated(data.url);
      }
    },
  });

  const handleGenerate = () => {
    if (!title || !content) {
      return;
    }

    generateMutation.mutate({
      title,
      content,
      style: selectedStyle as any,
      mood: selectedMood as any,
    });
  };

  const handleRegenerate = () => {
    if (!customPrompt) {
      return;
    }

    regenerateMutation.mutate({
      prompt: customPrompt,
    });
  };

  const isLoading = generateMutation.isPending || regenerateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          AI Image Generation
        </CardTitle>
        <CardDescription>
          Generate a professional image for your press release using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedImage ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {stylePresets?.styles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger id="mood">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {stylePresets?.moods.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!title || !content ? (
              <Alert>
                <AlertDescription>
                  Please enter a title and content for your press release before generating an image.
                </AlertDescription>
              </Alert>
            ) : null}

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !title || !content}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={generatedImage}
                  alt="Generated press release image"
                  className="w-full h-auto"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(generatedImage, "_blank")}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>

              {showCustomPrompt && (
                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Custom Prompt (Optional)</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="Describe the image you want to generate..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleRegenerate}
                    disabled={isLoading || !customPrompt}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate with Custom Prompt
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  setGeneratedImage(null);
                  setCustomPrompt("");
                  setShowCustomPrompt(false);
                }}
                className="w-full"
              >
                Generate New Image
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
