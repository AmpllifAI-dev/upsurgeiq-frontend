import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "wouter";

/**
 * Usage Warning Banner
 * 
 * Displays warnings when users approach 80% of their tier limits
 */

export default function UsageWarningBanner() {
  const { data: warnings } = trpc.usage.getWarnings.useQuery();

  if (!warnings || !warnings.hasWarnings) {
    return null;
  }

  const activeWarnings = [
    warnings.pressReleases,
    warnings.campaigns,
    warnings.aiChatMessages,
    warnings.images,
  ].filter((w) => w.shouldWarn);

  if (activeWarnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {activeWarnings.map((warning) => (
        <Alert key={warning.feature} variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">
            Usage Warning: {warning.percentage}% Used
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="flex items-center justify-between gap-4">
              <span>{warning.message}</span>
              <div className="flex gap-2 flex-shrink-0">
                {(warning.feature === "images" || warning.feature.includes("word")) && (
                  <Link href="/dashboard/purchases">
                    <Button size="sm" variant="outline" className="border-amber-600 text-amber-900 hover:bg-amber-100">
                      Buy More
                    </Button>
                  </Link>
                )}
                <Link href="/pricing">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
