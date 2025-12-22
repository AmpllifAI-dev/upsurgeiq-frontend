import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast as showToast } from "sonner";

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  suggestedPrompt?: string;
}

export function AIImageGenerator({ onImageGenerated, suggestedPrompt }: AIImageGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(suggestedPrompt || "");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);


  const generateMutation = trpc.ai.generateImage.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        setGeneratedImages([data.url]);
      }
      showToast.success("Image generated successfully", {
        description: "Your AI-generated image is ready to use.",
      });
    },
    onError: (error) => {
      showToast.error("Image generation failed", {
        description: error.message,
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      showToast.error("Prompt required", {
        description: "Please enter a description for the image you want to generate.",
      });
      return;
    }

    generateMutation.mutate({ prompt: prompt.trim() });
  };

  const handleSelectImage = (imageUrl: string) => {
    onImageGenerated(imageUrl);
    setOpen(false);
    showToast.success("Image added", {
      description: "The generated image has been added to your press release.",
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate AI Image
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate AI Image</DialogTitle>
            <DialogDescription>
              Describe the image you want to create, and our AI will generate it for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Image Description</Label>
              <Textarea
                id="prompt"
                placeholder="A professional business meeting in a modern office, people collaborating..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Be specific about style, colors, mood, and composition for best results.
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !prompt.trim()}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>

            {generatedImages.length > 0 && (
              <div className="space-y-3">
                <Label>Generated Images</Label>
                <div className="grid grid-cols-1 gap-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-auto rounded-lg border"
                      />
                      <Button
                        onClick={() => handleSelectImage(imageUrl)}
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Use This Image
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
