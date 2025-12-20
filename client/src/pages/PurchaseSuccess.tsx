import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

/**
 * Purchase Success Page
 * 
 * Shown after successful Stripe checkout
 */

export default function PurchaseSuccess() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session_id from URL query params
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    setSessionId(id);
  }, []);

  const { data: verification, isLoading, error } = trpc.purchases.verifyPurchase.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-16 flex items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle>Verifying Purchase...</CardTitle>
            <CardDescription>Please wait while we confirm your payment</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="w-full border-destructive">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle>Verification Failed</CardTitle>
            <CardDescription>
              We couldn't verify your purchase. Please contact support if you were charged.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button onClick={() => navigate("/dashboard/purchases")}>
              Back to Purchases
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = verification.paymentStatus === "paid";
  const productType = verification.metadata?.productType;
  const productKey = verification.metadata?.productKey;

  return (
    <div className="container max-w-2xl py-16">
      <Card className="w-full border-green-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
          <CardDescription>
            {isPaid
              ? "Your payment has been processed and credits have been added to your account."
              : "Your payment is being processed. Credits will be added shortly."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Purchase Details */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Purchase Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">
                  {productType === "word_count" ? "Word Count Add-On" : "Image Pack"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-medium">{productKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-600">
                  {isPaid ? "Paid" : "Processing"}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Your credits have been added to your account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>You can use them immediately for press releases and campaigns</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Credits never expire</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/dashboard/press-releases/new")}
            >
              Create Press Release
            </Button>
          </div>

          {/* Receipt */}
          <div className="text-center text-sm text-muted-foreground">
            <p>A receipt has been sent to your email address.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
