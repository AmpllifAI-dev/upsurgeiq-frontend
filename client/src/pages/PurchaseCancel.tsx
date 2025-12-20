import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

/**
 * Purchase Cancel Page
 * 
 * Shown when user cancels Stripe checkout
 */

export default function PurchaseCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="container max-w-2xl py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle>Purchase Cancelled</CardTitle>
          <CardDescription>
            Your purchase was cancelled. No charges were made to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>If you encountered any issues during checkout, please contact our support team.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={() => navigate("/dashboard/purchases")}>
              Back to Purchases
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
