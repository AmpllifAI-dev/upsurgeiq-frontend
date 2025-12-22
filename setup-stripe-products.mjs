import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51Sfl22IEVr3V21JeW8yq7W5hmvJeyRSWl0lqGPgRwaWSs0gy6Qu4IsjEefvkxOni3Tao2pobhJuNICKk46L3APsL00dfOpEnLz', {
  apiVersion: '2024-11-20.acacia',
});

async function setupProducts() {
  console.log('Creating Stripe products and prices...\n');

  try {
    // Create Starter Product
    console.log('Creating Starter product...');
    const starterProduct = await stripe.products.create({
      name: 'UpsurgeIQ Starter',
      description: 'Perfect for small businesses and startups getting started with PR',
    });
    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 4900, // £49.00
      currency: 'gbp',
      recurring: { interval: 'month' },
    });
    console.log(`✓ Starter: ${starterProduct.id} / ${starterPrice.id}\n`);

    // Create Pro Product
    console.log('Creating Pro product...');
    const proProduct = await stripe.products.create({
      name: 'UpsurgeIQ Pro',
      description: 'For growing businesses needing advanced features and higher limits',
    });
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 9900, // £99.00
      currency: 'gbp',
      recurring: { interval: 'month' },
    });
    console.log(`✓ Pro: ${proProduct.id} / ${proPrice.id}\n`);

    // Create Scale Product
    console.log('Creating Scale product...');
    const scaleProduct = await stripe.products.create({
      name: 'UpsurgeIQ Scale',
      description: 'Enterprise solution with unlimited usage and dedicated support',
    });
    const scalePrice = await stripe.prices.create({
      product: scaleProduct.id,
      unit_amount: 34900, // £349.00
      currency: 'gbp',
      recurring: { interval: 'month' },
    });
    console.log(`✓ Scale: ${scaleProduct.id} / ${scalePrice.id}\n`);

    // Create Additional Media List Product
    console.log('Creating Additional Media List product...');
    const mediaListProduct = await stripe.products.create({
      name: 'Additional Media List',
      description: 'Add extra media list to your subscription',
    });
    const mediaListPrice = await stripe.prices.create({
      product: mediaListProduct.id,
      unit_amount: 400, // £4.00
      currency: 'gbp',
    });
    console.log(`✓ Media List: ${mediaListProduct.id} / ${mediaListPrice.id}\n`);

    // Create Campaign Lab Product
    console.log('Creating Intelligent Campaign Lab product...');
    const campaignLabProduct = await stripe.products.create({
      name: 'Intelligent Campaign Lab',
      description: 'Advanced campaign optimization and A/B testing',
    });
    const campaignLabPrice = await stripe.prices.create({
      product: campaignLabProduct.id,
      unit_amount: 2900, // £29.00
      currency: 'gbp',
      recurring: { interval: 'month' },
    });
    console.log(`✓ Campaign Lab: ${campaignLabProduct.id} / ${campaignLabPrice.id}\n`);

    // Output configuration
    console.log('\n=== CONFIGURATION ===\n');
    console.log('Copy these IDs to server/products.ts:\n');
    console.log('starter:');
    console.log(`  stripeProductId: "${starterProduct.id}",`);
    console.log(`  stripePriceId: "${starterPrice.id}",\n`);
    console.log('pro:');
    console.log(`  stripeProductId: "${proProduct.id}",`);
    console.log(`  stripePriceId: "${proPrice.id}",\n`);
    console.log('scale:');
    console.log(`  stripeProductId: "${scaleProduct.id}",`);
    console.log(`  stripePriceId: "${scalePrice.id}",\n`);
    console.log('additionalMediaList:');
    console.log(`  stripeProductId: "${mediaListProduct.id}",`);
    console.log(`  stripePriceId: "${mediaListPrice.id}",\n`);
    console.log('intelligentCampaignLab:');
    console.log(`  stripeProductId: "${campaignLabProduct.id}",`);
    console.log(`  stripePriceId: "${campaignLabPrice.id}",\n`);

    // Return IDs for programmatic use
    return {
      starter: { productId: starterProduct.id, priceId: starterPrice.id },
      pro: { productId: proProduct.id, priceId: proPrice.id },
      scale: { productId: scaleProduct.id, priceId: scalePrice.id },
      mediaList: { productId: mediaListProduct.id, priceId: mediaListPrice.id },
      campaignLab: { productId: campaignLabProduct.id, priceId: campaignLabPrice.id },
    };
  } catch (error) {
    console.error('Error creating products:', error.message);
    throw error;
  }
}

setupProducts()
  .then((ids) => {
    console.log('\n✅ All products created successfully!');
    console.log('\nProduct IDs:', JSON.stringify(ids, null, 2));
  })
  .catch((error) => {
    console.error('\n❌ Failed to create products:', error);
    process.exit(1);
  });
