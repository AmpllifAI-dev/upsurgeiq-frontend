/**
 * Purchase Confirmation Email Templates
 * 
 * Sends email notifications when users purchase word count or image pack add-ons
 */

import { sendEmail } from "./_core/email";
import { WORD_COUNT_PRODUCTS, IMAGE_PACK_PRODUCTS } from "./products";

interface PurchaseEmailParams {
  to: string;
  name: string;
  productType: "word_count" | "image_pack";
  productKey: string;
  amountPaid: number; // in pence
  currency: string;
  purchaseDate: Date;
  availableCredits: {
    words?: number;
    images?: number;
  };
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmationEmail(params: PurchaseEmailParams) {
  const {
    to,
    name,
    productType,
    productKey,
    amountPaid,
    currency,
    purchaseDate,
    availableCredits,
  } = params;

  // Get product details
  let productName = "";
  let productDescription = "";
  let creditsAdded = 0;

  if (productType === "word_count") {
    const product = WORD_COUNT_PRODUCTS[productKey as keyof typeof WORD_COUNT_PRODUCTS];
    if (product) {
      productName = product.name;
      productDescription = product.description;
      creditsAdded = product.words;
    }
  } else if (productType === "image_pack") {
    const product = IMAGE_PACK_PRODUCTS[productKey as keyof typeof IMAGE_PACK_PRODUCTS];
    if (product) {
      productName = product.name;
      productDescription = product.description;
      creditsAdded = product.images;
    }
  }

  const formattedAmount = (amountPaid / 100).toFixed(2);
  const formattedDate = purchaseDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subject = `Purchase Confirmed: ${productName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ✅ Purchase Confirmed
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 24px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Thank you for your purchase! Your credits have been added to your account and are ready to use.
              </p>
            </td>
          </tr>

          <!-- Purchase Details Card -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" style="width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 18px; font-weight: 600;">
                      Purchase Details
                    </h2>
                    
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Product:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${productName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Credits Added:</td>
                        <td style="padding: 8px 0; color: #0d9488; font-size: 14px; font-weight: 600; text-align: right;">+${creditsAdded} ${productType === "word_count" ? "words" : "images"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">£${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${formattedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Current Balance Card -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" style="width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 18px; font-weight: 600;">
                      💎 Your Current Balance
                    </h2>
                    
                    <table role="presentation" style="width: 100%;">
                      ${availableCredits.words !== undefined ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Extra Words Available:</td>
                        <td style="padding: 8px 0; color: #0d9488; font-size: 18px; font-weight: 700; text-align: right;">${availableCredits.words}</td>
                      </tr>
                      ` : ""}
                      ${availableCredits.images !== undefined ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">AI Images Available:</td>
                        <td style="padding: 8px 0; color: #0d9488; font-size: 18px; font-weight: 700; text-align: right;">${availableCredits.images}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || "https://upsurgeiq.manus.space"}/dashboard" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Start Creating →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; text-align: center;">
                Need help? Contact us at <a href="mailto:support@upsurgeiq.com" style="color: #0d9488; text-decoration: none;">support@upsurgeiq.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} UpsurgeIQ. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Purchase Confirmed

Hi ${name},

Thank you for your purchase! Your credits have been added to your account and are ready to use.

Purchase Details:
- Product: ${productName}
- Credits Added: +${creditsAdded} ${productType === "word_count" ? "words" : "images"}
- Amount Paid: £${formattedAmount}
- Date: ${formattedDate}

Your Current Balance:
${availableCredits.words !== undefined ? `- Extra Words Available: ${availableCredits.words}` : ""}
${availableCredits.images !== undefined ? `- AI Images Available: ${availableCredits.images}` : ""}

Start creating: ${process.env.FRONTEND_URL || "https://upsurgeiq.manus.space"}/dashboard

Need help? Contact us at support@upsurgeiq.com

© ${new Date().getFullYear()} UpsurgeIQ. All rights reserved.
  `;

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}
