import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Image, Plus, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface CreditBalanceDisplayProps {
  variant?: "compact" | "full";
  showPurchaseButton?: boolean;
}

export function CreditBalanceDisplay({ 
  variant = "compact",
  showPurchaseButton = true 
}: CreditBalanceDisplayProps) {
  const [, setLocation] = useLocation();
  
  const { data: wordCredits, isLoading: loadingWords } = trpc.purchases.getWordCountCredits.useQuery();
  const { data: imageCredits, isLoading: loadingImages } = trpc.purchases.getImageCredits.useQuery();

  if (loadingWords || loadingImages) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    );
  }

  const wordCount = wordCredits?.availableWords || 0;
  const imageCount = imageCredits?.availableImages || 0;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        {/* Word Count Badge */}
        <Badge variant="outline" className="gap-2 px-3 py-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span className="font-medium">{wordCount}</span>
          <span className="text-muted-foreground text-xs">words</span>
        </Badge>

        {/* Image Credit Badge */}
        <Badge variant="outline" className="gap-2 px-3 py-1.5">
          <Image className="h-3.5 w-3.5" />
          <span className="font-medium">{imageCount}</span>
          <span className="text-muted-foreground text-xs">images</span>
        </Badge>

        {showPurchaseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard/purchases")}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Buy More
          </Button>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Available Credits</h3>
          </div>
          {showPurchaseButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/dashboard/purchases")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Purchase More
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Word Count Credits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Extra Words</span>
            </div>
            <div className="text-3xl font-bold">{wordCount}</div>
            <p className="text-xs text-muted-foreground">
              Available for press releases
            </p>
          </div>

          {/* Image Credits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Image className="h-4 w-4" />
              <span className="text-sm font-medium">AI Images</span>
            </div>
            <div className="text-3xl font-bold">{imageCount}</div>
            <p className="text-xs text-muted-foreground">
              Available for generation
            </p>
          </div>
        </div>

        {(wordCount === 0 && imageCount === 0) && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Purchase add-on credits to extend your limits beyond your subscription tier
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
