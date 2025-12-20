import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, AlertCircle } from "lucide-react";

interface AIGenerationWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  creditsToUse: number;
  creditsRemaining?: number;
  actionDescription: string;
}

const STORAGE_KEY = "aiGenerationWarningDismissed";

export function AIGenerationWarning({
  open,
  onOpenChange,
  onConfirm,
  creditsToUse,
  creditsRemaining,
  actionDescription,
}: AIGenerationWarningProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Generation Confirmation
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-2">
            <p>{actionDescription}</p>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Credits to use:</span>
                <span className="text-sm font-semibold text-foreground">{creditsToUse}</span>
              </div>
              {creditsRemaining !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Credits remaining:</span>
                  <span className="text-sm font-semibold text-foreground">{creditsRemaining}</span>
                </div>
              )}
            </div>

            {creditsRemaining !== undefined && creditsRemaining < creditsToUse && (
              <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  You don't have enough credits. Please purchase additional credits or upgrade your plan.
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="dontShowAgain"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <Label
                htmlFor="dontShowAgain"
                className="text-sm font-normal cursor-pointer"
              >
                Don't show this warning again
              </Label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={creditsRemaining !== undefined && creditsRemaining < creditsToUse}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Check if the user has dismissed the AI generation warning
 */
export function shouldShowAIWarning(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) !== "true";
}

/**
 * Reset the AI generation warning preference
 */
export function resetAIWarningPreference(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
