import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Mail, Download, CheckCircle2 } from "lucide-react";

interface EmailCaptureFormProps {
  source: string; // 'blog', 'calculator', 'homepage'
  leadMagnet?: string; // 'pr_template', 'roi_guide', etc.
  title?: string;
  description?: string;
  buttonText?: string;
  compact?: boolean;
}

export function EmailCaptureForm({
  source,
  leadMagnet,
  title = "Get Free PR Resources",
  description = "Subscribe to receive exclusive PR templates, guides, and industry insights.",
  buttonText = "Get Free Resources",
  compact = false,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const captureEmail = trpc.marketing.captureEmail.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    captureEmail.mutate({
      email,
      source,
      leadMagnet,
    });
  };

  if (submitted) {
    return (
      <Card className={compact ? "border-primary/50" : ""}>
        <CardContent className={compact ? "p-6" : "p-8"}>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Thank You!</h3>
              <p className="text-muted-foreground">
                Check your email for your free resources. We've sent you a confirmation with download links.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
              className="mt-4"
            >
              Subscribe Another Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={captureEmail.isPending}
          className="whitespace-nowrap"
        >
          {captureEmail.isPending ? (
            "Subscribing..."
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={captureEmail.isPending}
            className="w-full"
          >
            {captureEmail.isPending ? (
              "Subscribing..."
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
