import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { IssueReportDialog } from "./IssueReportDialog";

export function FloatingIssueButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
        size="icon"
        title="Report an Issue"
      >
        <Bug className="h-6 w-6" />
      </Button>
      <IssueReportDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
