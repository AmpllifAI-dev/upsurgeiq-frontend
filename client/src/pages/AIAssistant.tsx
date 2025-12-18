import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Zap, MessageSquare, ArrowLeft, Send, Mic, Phone, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function AIAssistant() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: subscription } = trpc.subscription.get.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: business } = trpc.business.get.useQuery(undefined, {
    enabled: !!user,
  });

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant",
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to get response");
      setIsProcessing(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !subscription || !business) {
    setLocation("/");
    return null;
  }

  // Check if user has access to AI assistant (Pro or Scale tier)
  const hasAccess = subscription.plan === "pro" || subscription.plan === "scale";

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto py-16 max-w-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Sparkles className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">AI Assistant Unavailable</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                The Conversational AI Assistant is available for Pro and Scale tier subscribers
              </p>
              <Button onClick={() => setLocation("/subscribe")}>
                Upgrade to Pro or Scale
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    chatMutation.mutate({
      message: input,
      context: {
        businessName: business.name,
        industry: business.sicSection || "",
        brandVoice: business.brandVoiceTone || "formal",
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Assistant
                </Badge>
                <Badge variant="outline">{subscription.plan.toUpperCase()} Tier</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Conversational AI Assistant</h1>
              <p className="text-muted-foreground mt-1">
                Get instant help with PR strategy, content ideas, and marketing advice
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <Mic className="w-4 h-4 mr-2" />
                Voice (Coming Soon)
              </Button>
              <Button variant="outline" disabled>
                <Phone className="w-4 h-4 mr-2" />
                Call-In (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 max-w-4xl">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Ask me anything about PR strategy, content creation, media outreach, or marketing campaigns
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    "Help me write a press release about our new product launch",
                    "What's the best way to approach tech journalists?",
                    "Give me social media content ideas for this week",
                    "How can I improve our brand messaging?",
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-4 px-4 text-left justify-start"
                      onClick={() => setInput(suggestion)}
                    >
                      <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card/50">
          <div className="container mx-auto py-4 max-w-4xl">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about PR and marketing..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
