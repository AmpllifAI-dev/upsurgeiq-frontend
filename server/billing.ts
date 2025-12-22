import Stripe from "stripe";
import { ENV } from "./_core/env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-12-15.clover",
});

/**
 * Get all invoices for a customer
 */
export async function getCustomerInvoices(customerId: string) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 100,
  });

  return invoices.data.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    created: invoice.created,
    dueDate: invoice.due_date,
    paidAt: invoice.status_transitions.paid_at,
    hostedInvoiceUrl: invoice.hosted_invoice_url,
    invoicePdf: invoice.invoice_pdf,
    description: invoice.description,
    lines: invoice.lines.data.map((line) => ({
      description: line.description,
      amount: line.amount,
      currency: line.currency,
      quantity: line.quantity,
    })),
  }));
}

/**
 * Get payment methods for a customer
 */
export async function getCustomerPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  return paymentMethods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand,
    last4: pm.card?.last4,
    expMonth: pm.card?.exp_month,
    expYear: pm.card?.exp_year,
    isDefault: false, // Will be set by checking customer's default payment method
  }));
}

/**
 * Get customer's default payment method
 */
export async function getCustomerDefaultPaymentMethod(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) {
    return null;
  }

  return customer.invoice_settings.default_payment_method;
}

/**
 * Create a billing portal session for managing subscriptions and payment methods
 */
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    url: session.url,
  };
}

/**
 * Get upcoming invoice for a customer (preview of next billing)
 */
export async function getUpcomingInvoice(customerId: string) {
  try {
    // Get the most recent unpaid invoice or upcoming invoice
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 1,
      status: 'open',
    });

    if (invoices.data.length === 0) {
      return null;
    }

    const invoice = invoices.data[0];
    return {
      amountDue: invoice.amount_due,
      currency: invoice.currency,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      lines: invoice.lines.data.map((line: any) => ({
        description: line.description,
        amount: line.amount,
        currency: line.currency,
      })),
    };
  } catch (error) {
    // No upcoming invoice (customer has no active subscriptions)
    return null;
  }
}
