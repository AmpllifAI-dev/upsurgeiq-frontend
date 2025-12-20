import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Plus, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface WordCountPurchaseCTAProps {
  requiredWords: number;
  tierLimit: number;
  purchasedWords: number;
  onPurchaseSuccess?: () => void;
}

export function WordCountPurchaseCTA({
  requiredWords,
  tierLimit,
  purchasedWords,
  onPurchaseSuccess,
}: WordCountPurchaseCTAProps) {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckout = trpc.purchases.createWordCountCheckout.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      setIsLoading(false);
      alert(`Failed to create checkout: ${error.message}`);
    },
  });

  const handlePurchase = (wordCountKey: "words_300" | "words_600" | "words_900") => {
    setIsLoading(true);
    createCheckout.mutate({ wordCountKey });
  };

  const wordsNeeded = requiredWords - tierLimit - purchasedWords;

  return (
    <div className="space-y-4">
      <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          Word Count Limit Reached
        </AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          You need <strong>{wordsNeeded} more words</strong> to generate this press release.
          <br />
          Your tier allows <strong>{tierLimit} words</strong>, and you have{" "}
          <strong>{purchasedWords} purchased words</strong> remaining.
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Purchase Extra Words
          </CardTitle>
          <CardDescription>
            Add more words to your account and continue creating professional press releases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* 300 Words */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">300 Words</CardTitle>
                <div className="text-3xl font-bold">£4.00</div>
                <CardDescription>Perfect for short releases</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handlePurchase("words_300")}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase
                </Button>
              </CardContent>
            </Card>

            {/* 600 Words */}
            <Card className="relative overflow-hidden border-primary hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">600 Words</CardTitle>
                <div className="text-3xl font-bold">£8.00</div>
                <CardDescription>Ideal for detailed releases</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handlePurchase("words_600")}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase
                </Button>
              </CardContent>
            </Card>

            {/* 900 Words */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">900 Words</CardTitle>
                <div className="text-3xl font-bold">£12.00</div>
                <CardDescription>Maximum flexibility</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handlePurchase("words_900")}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              💡 <strong>Tip:</strong> Journalists prefer press releases under 500 words for better
              engagement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
