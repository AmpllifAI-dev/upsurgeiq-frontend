import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mic, MicOff, Star, Send, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface FeedbackWidgetProps {
  context?: string; // e.g., "press_release_creation", "dashboard"
}

export function FeedbackWidget({ context }: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"rating" | "text" | "voice">("rating");
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve UpsurgeIQ.",
      });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit feedback",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFeedbackType("rating");
    setRating(0);
    setFeedbackText("");
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice feedback.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleSubmit = async () => {
    if (feedbackType === "rating" && rating === 0) {
      toast({
        variant: "destructive",
        title: "Please select a rating",
        description: "Choose a star rating before submitting.",
      });
      return;
    }

    if (feedbackType === "text" && !feedbackText.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter feedback",
        description: "Write some feedback before submitting.",
      });
      return;
    }

    if (feedbackType === "voice" && !audioBlob) {
      toast({
        variant: "destructive",
        title: "No recording found",
        description: "Please record your feedback before submitting.",
      });
      return;
    }

    // TODO: Upload audio to S3 if voice feedback
    let voiceRecordingUrl = null;
    if (feedbackType === "voice" && audioBlob) {
      // For now, we'll skip the upload and just note that voice feedback was provided
      // In production, you'd upload to S3 here using storagePut
      voiceRecordingUrl = "pending_upload";
    }

    submitFeedback.mutate({
      feedbackType,
      rating: feedbackType === "rating" ? rating : undefined,
      feedbackText: feedbackText || undefined,
      voiceRecordingUrl: voiceRecordingUrl || undefined,
      voiceRecordingDuration: feedbackType === "voice" ? recordingDuration : undefined,
      context: context || window.location.pathname,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          title="Send Feedback"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve UpsurgeIQ by sharing your thoughts, suggestions, or reporting issues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feedback Type Selector */}
          <div className="flex gap-2">
            <Button
              variant={feedbackType === "rating" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedbackType("rating")}
              className="flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              Rate Us
            </Button>
            <Button
              variant={feedbackType === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedbackType("text")}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Write
            </Button>
            <Button
              variant={feedbackType === "voice" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedbackType("voice")}
              className="flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </Button>
          </div>

          {/* Rating Input */}
          {feedbackType === "rating" && (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Tell us more about your experience (optional)"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Text Input */}
          {feedbackType === "text" && (
            <Textarea
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={6}
            />
          )}

          {/* Voice Recording */}
          {feedbackType === "voice" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voice Feedback</CardTitle>
                <CardDescription>
                  Record a quick voice message to share your thoughts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  {!audioBlob ? (
                    <>
                      <Button
                        size="lg"
                        variant={isRecording ? "destructive" : "default"}
                        onClick={isRecording ? stopRecording : startRecording}
                        className="w-full"
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="h-5 w-5 mr-2" />
                            Stop Recording ({formatDuration(recordingDuration)})
                          </>
                        ) : (
                          <>
                            <Mic className="h-5 w-5 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>
                      {isRecording && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          Recording...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mic className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Recording Complete</p>
                            <p className="text-sm text-muted-foreground">
                              Duration: {formatDuration(recordingDuration)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAudioBlob(null);
                            setRecordingDuration(0);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <audio controls className="w-full" src={URL.createObjectURL(audioBlob)} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitFeedback.isPending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
