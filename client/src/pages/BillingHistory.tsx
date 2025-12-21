import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, CreditCard, Calendar, DollarSign, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BillingHistory() {
  const { user, loading: authLoading } = useAuth();
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  const { data: invoices, isLoading } = trpc.billing.getInvoices.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: paymentMethod } = trpc.billing.getPaymentMethod.useQuery(undefined, {
    enabled: !!user,
  });

  const downloadInvoiceMutation = trpc.billing.downloadInvoice.useMutation({
    onSuccess: (data) => {
      // Open invoice URL in new tab
      window.open(data.url, "_blank");
      setDownloadingInvoice(null);
      toast.success("Invoice opened in new tab");
    },
    onError: (error) => {
      toast.error(`Failed to download invoice: ${error.message}`);
      setDownloadingInvoice(null);
    },
  });

  const handleDownloadInvoice = (invoiceId: string) => {
    setDownloadingInvoice(invoiceId);
    downloadInvoiceMutation.mutate({ invoiceId });
  };

  if (authLoading) {
    return <DashboardLayout><div className="p-8"><Skeleton className="h-96" /></div></DashboardLayout>;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Invoices</h1>
          <p className="text-muted-foreground">
            View your payment history, download invoices, and manage payment methods
          </p>
        </div>

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Your default payment method for subscriptions</CardDescription>
              </div>
              <Button variant="outline">Update Payment Method</Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentMethod ? (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">
                    {paymentMethod.brand.toUpperCase()} •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No payment method on file</p>
            )}
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice History
            </CardTitle>
            <CardDescription>Download past invoices and view payment details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : invoices && invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Invoice #{invoice.number}</p>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "open"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {(invoice.amountPaid / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                          </span>
                        </div>
                        {invoice.description && (
                          <p className="text-sm text-muted-foreground mt-1">{invoice.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      disabled={downloadingInvoice === invoice.id}
                    >
                      {downloadingInvoice === invoice.id ? (
                        "Opening..."
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground">
                  Your invoices will appear here once you make a payment
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
