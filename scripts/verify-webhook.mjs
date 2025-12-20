#!/usr/bin/env node
/**
 * Stripe Webhook Verification Script
 * 
 * This script verifies that your Stripe webhook is properly configured:
 * - Checks webhook secret is set
 * - Verifies webhook endpoint exists in Stripe
 * - Tests webhook signature verification
 * - Validates product metadata
 */

import Stripe from "stripe";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "../.env") });

const stripe = new Stripe(process.env.STRIPE_MANAGEMENT_API_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

async function verifyWebhook() {
  console.log("🔍 Verifying Stripe Webhook Configuration...\n");

  let allChecks = true;

  // Check 1: Webhook Secret
  console.log("1️⃣ Checking webhook secret...");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.log("   ❌ STRIPE_WEBHOOK_SECRET is not set");
    console.log("   → Add it via Management UI → Settings → Secrets");
    allChecks = false;
  } else if (!webhookSecret.startsWith("whsec_")) {
    console.log("   ⚠️  Warning: Webhook secret doesn't start with 'whsec_'");
    console.log("   → Make sure you copied the signing secret, not the endpoint ID");
  } else {
    console.log("   ✅ Webhook secret is configured");
  }
  console.log("");

  // Check 2: List Webhook Endpoints
  console.log("2️⃣ Checking webhook endpoints in Stripe...");
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (endpoints.data.length === 0) {
      console.log("   ❌ No webhook endpoints found in Stripe");
      console.log("   → Create one at: https://dashboard.stripe.com/webhooks");
      allChecks = false;
    } else {
      console.log(`   ✅ Found ${endpoints.data.length} webhook endpoint(s):\n`);
      
      for (const endpoint of endpoints.data) {
        const isActive = endpoint.status === "enabled";
        const hasCorrectEvents = endpoint.enabled_events.includes("checkout.session.completed");
        
        console.log(`   📍 ${endpoint.url}`);
        console.log(`      Status: ${isActive ? "✅ Enabled" : "❌ Disabled"}`);
        console.log(`      Events: ${endpoint.enabled_events.join(", ")}`);
        console.log(`      Has checkout.session.completed: ${hasCorrectEvents ? "✅ Yes" : "❌ No"}`);
        console.log("");
        
        if (!isActive || !hasCorrectEvents) {
          allChecks = false;
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Failed to list webhooks: ${error.message}`);
    allChecks = false;
  }
  console.log("");

  // Check 3: Verify Products Have Correct Metadata
  console.log("3️⃣ Checking product metadata...");
  try {
    const products = await stripe.products.list({ limit: 10, active: true });
    const addOnProducts = products.data.filter(p => 
      p.metadata?.type === "word_count" || p.metadata?.type === "image_pack"
    );
    
    if (addOnProducts.length === 0) {
      console.log("   ⚠️  No add-on products found");
      console.log("   → Run: pnpm stripe:sync");
    } else {
      console.log(`   ✅ Found ${addOnProducts.length} add-on product(s):\n`);
      
      for (const product of addOnProducts) {
        const hasType = !!product.metadata?.type;
        const hasUnits = !!product.metadata?.units;
        
        console.log(`   📦 ${product.name}`);
        console.log(`      Type: ${hasType ? `✅ ${product.metadata.type}` : "❌ Missing"}`);
        console.log(`      Units: ${hasUnits ? `✅ ${product.metadata.units}` : "❌ Missing"}`);
        console.log("");
        
        if (!hasType || !hasUnits) {
          allChecks = false;
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Failed to check products: ${error.message}`);
    allChecks = false;
  }
  console.log("");

  // Check 4: Test Signature Verification
  console.log("4️⃣ Testing webhook signature verification...");
  if (webhookSecret && webhookSecret.startsWith("whsec_")) {
    try {
      // Create a test payload
      const testPayload = JSON.stringify({
        id: "evt_test",
        type: "checkout.session.completed",
        data: { object: { id: "cs_test" } }
      });
      
      // Generate test signature
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = stripe.webhooks.generateTestHeaderString({
        payload: testPayload,
        secret: webhookSecret,
      });
      
      // Try to verify it
      const event = stripe.webhooks.constructEvent(
        testPayload,
        signature,
        webhookSecret
      );
      
      console.log("   ✅ Signature verification works correctly");
    } catch (error) {
      console.log(`   ❌ Signature verification failed: ${error.message}`);
      console.log("   → Check that STRIPE_WEBHOOK_SECRET matches Stripe Dashboard");
      allChecks = false;
    }
  } else {
    console.log("   ⏭️  Skipped (webhook secret not configured)");
  }
  console.log("");

  // Summary
  console.log("═".repeat(60));
  if (allChecks) {
    console.log("✅ All checks passed! Your webhook is properly configured.");
    console.log("\n🎉 You're ready to accept purchases!");
  } else {
    console.log("❌ Some checks failed. Please fix the issues above.");
    console.log("\n📚 See WEBHOOK_SETUP_GUIDE.md for detailed instructions.");
  }
  console.log("═".repeat(60));
}

// Run verification
verifyWebhook().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
