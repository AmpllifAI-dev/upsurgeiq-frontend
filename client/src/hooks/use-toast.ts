import { useState } from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (toast: Toast) => {
    // For now, just use console.log
    // In production, you'd integrate with a toast library like sonner or react-hot-toast
    console.log("[Toast]", toast);
    
    // Show browser notification as fallback
    if (toast.variant === "destructive") {
      alert(`Error: ${toast.title}\n${toast.description || ""}`);
    }
  };

  return { toast, toasts };
}
