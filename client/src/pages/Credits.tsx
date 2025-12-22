import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Credits() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch credit balance
  const { data: creditBalance, refetch: refetchBalance } = trpc.mediaList.getCredits.useQuery();

  // Fetch credit transactions
  const { data: transactions } = trpc.mediaList.getCreditTransactions.useQuery();

  // Fetch available products
  const { data: products } = trpc.stripe.getProducts.useQuery();

  // Create checkout session mutation
  const createCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      toast.error(`Checkout failed: ${error.message}`);
      setIsCheckingOut(false);
    },
  });

  const handlePurchase = (productId: "STARTER" | "PROFESSIONAL" | "ENTERPRISE") => {
    setIsCheckingOut(true);
    createCheckout.mutate({ productId });
  };

  // Check for success/cancel params in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Payment successful! Credits have been added to your account.");
      refetchBalance();
      // Clean up URL
      window.history.replaceState({}, "", "/credits");
    } else if (params.get("canceled") === "true") {
      toast.info("Payment was canceled.");
      // Clean up URL
      window.history.replaceState({}, "", "/credits");
    }
  }, [refetchBalance]);

  return (
    <div className="container mx-auto py-8">
      {/* Back button */}
      <Link href="/media-lists">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Media Lists
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Credit Management</h1>
        <p className="text-muted-foreground text-lg">
          Purchase credits to distribute your press releases to media lists
        </p>
      </div>

      {/* Credit Balance Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Credit Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-6xl font-bold mb-2">{creditBalance ?? 0}</p>
            <p className="text-muted-foreground">Credits</p>
          </div>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm text-muted-foreground">
              Each credit = 1 media list per distribution
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Options */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Purchase Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card key={product.id} className={product.id === "PROFESSIONAL" ? "border-primary border-2" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{product.name}</CardTitle>
                  {product.id === "PROFESSIONAL" && (
                    <Badge className="bg-primary">POPULAR</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold">£{(product.priceGBP / 100).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.credits} Credits
                    </p>
                    <p className="text-sm text-muted-foreground">
                      £{(product.priceGBP / 100 / product.credits).toFixed(2)}/credit
                    </p>
                  </div>
                  {product.id !== "STARTER" && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-sm text-green-800 font-medium">
                        {product.description.includes("Save") && product.description.match(/Save £\d+/)?.[0]}
                      </p>
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(product.id as "STARTER" | "PROFESSIONAL" | "ENTERPRISE")}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How Credits Work */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How Credits Work</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>1 credit = 1 media list per press release distribution</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Example: Sending a press release to 3 media lists costs 3 credits</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Credits never expire</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Unused credits roll over</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge
                            variant={
                              transaction.type === "purchase"
                                ? "default"
                                : transaction.type === "deduction"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {transaction.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
