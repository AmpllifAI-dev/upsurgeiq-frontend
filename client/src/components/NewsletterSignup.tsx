import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface NewsletterSignupProps {
  source?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function NewsletterSignup({
  source = "resources_page",
  title = "Stay Updated with PR & Marketing Insights",
  description = "Get exclusive templates, guides, and industry insights delivered to your inbox. Join thousands of PR professionals who trust UpsurgeIQ.",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setStatus("success");
        setEmail("");
        setErrorMessage("");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to subscribe");
      }
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("idle");
    setErrorMessage("");
    subscribe.mutate({ email, source });
  };

  return (
    <Card className={`p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {description}
          </p>

          {status === "success" ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Successfully subscribed!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Check your inbox for a confirmation email.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white dark:bg-gray-800"
                disabled={subscribe.isPending}
              />
              <Button
                type="submit"
                disabled={subscribe.isPending || !email}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {subscribe.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          )}

          {status === "error" && errorMessage && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {errorMessage}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            By subscribing, you agree to receive marketing emails from UpsurgeIQ. 
            You can unsubscribe at any time. View our{" "}
            <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-200">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </Card>
  );
}
