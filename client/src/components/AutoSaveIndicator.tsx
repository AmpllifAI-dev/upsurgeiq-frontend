import { Check, Cloud, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "saving" | "saved" | "idle";
  lastSaved?: Date;
}

export function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
  if (status === "idle") return null;

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span>
            Saved {lastSaved ? getTimeAgo(lastSaved) : ""}
          </span>
        </>
      )}
    </div>
  );
}
