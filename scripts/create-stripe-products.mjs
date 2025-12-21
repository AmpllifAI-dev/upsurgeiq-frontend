#!/usr/bin/env node
/**
 * Script to create Stripe products for AI Chat and AI Call-in add-ons
 * 
 * Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-products.mjs
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is required');
  console.error('Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-products.mjs');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
});

async function createProducts() {
  console.log('Creating Stripe products for add-ons...\n');

  try {
    // Create AI Chat product
    console.log('Creating AI Chat product...');
    const aiChatProduct = await stripe.products.create({
      name: 'AI Chat',
      description: 'Conversational AI assistant for content generation and refinement (32 messages/month)',
      metadata: {
        addon_type: 'aiChat',
        credits_per_month: '32',
      },
    });

    const aiChatPrice = await stripe.prices.create({
      product: aiChatProduct.id,
      unit_amount: 3900, // £39.00 in pence
      currency: 'gbp',
      recurring: {
        interval: 'month',
      },
    });

    console.log('✅ AI Chat product created:');
    console.log(`   Product ID: ${aiChatProduct.id}`);
    console.log(`   Price ID: ${aiChatPrice.id}`);
    console.log('');

    // Create AI Call-in product
    console.log('Creating AI Call-in product...');
    const aiCallInProduct = await stripe.products.create({
      name: 'AI Call-in',
      description: 'Voice call-in feature with Whisper transcription for hands-free content creation (32 calls/month)',
      metadata: {
        addon_type: 'aiCallIn',
        credits_per_month: '32',
      },
    });

    const aiCallInPrice = await stripe.prices.create({
      product: aiCallInProduct.id,
      unit_amount: 5900, // £59.00 in pence
      currency: 'gbp',
      recurring: {
        interval: 'month',
      },
    });

    console.log('✅ AI Call-in product created:');
    console.log(`   Product ID: ${aiCallInProduct.id}`);
    console.log(`   Price ID: ${aiCallInPrice.id}`);
    console.log('');

    // Print update instructions
    console.log('='.repeat(80));
    console.log('SUCCESS! Products created successfully.');
    console.log('='.repeat(80));
    console.log('');
    console.log('Next step: Update server/products.ts with the following IDs:');
    console.log('');
    console.log('aiChat: {');
    console.log(`  stripeProductId: "${aiChatProduct.id}",`);
    console.log(`  stripePriceId: "${aiChatPrice.id}",`);
    console.log('},');
    console.log('');
    console.log('aiCallIn: {');
    console.log(`  stripeProductId: "${aiCallInProduct.id}",`);
    console.log(`  stripePriceId: "${aiCallInPrice.id}",`);
    console.log('},');
    console.log('');

  } catch (error) {
    console.error('Error creating products:', error.message);
    process.exit(1);
  }
}

createProducts();
