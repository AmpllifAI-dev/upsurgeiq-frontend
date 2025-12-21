import fs from 'fs';
import fetch from 'node-fetch';

/**
 * Import blog posts to WordPress via REST API
 * 
 * This script reads the 4 blog post markdown files and creates them
 * as WordPress posts using the REST API with Basic Authentication.
 */

const WP_SITE = 'https://amplifai.wpenginepowered.com';
const WP_USERNAME = 'AmplifAI-dev@thealchemyexperience.co.uk';
// Use Application Password (passed as command line argument)
const WP_APP_PASSWORD = process.argv[2] || 'MylE1oa5EG7ojxBanHAcdkGr';

// Create Basic Auth header
const auth = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');

const blogPosts = [
  {
    file: 'BLOG_POST_PR_BEST_PRACTICES.md',
    title: 'PR Best Practices That Actually Work in 2025',
    excerpt: 'Public relations has evolved dramatically over the past decade. Learn the essential practices that separate effective PR campaigns from those that disappear into the void.',
    categories: ['Public Relations'],
    tags: ['PR', 'Best Practices', 'Media Relations']
  },
  {
    file: 'BLOG_POST_AI_IN_MARKETING.md',
    title: 'The Future of AI in Marketing: Beyond the Hype',
    excerpt: 'Artificial intelligence has transitioned from experimental technology to essential marketing infrastructure. Discover how AI is transforming marketing work and what it means for your business.',
    categories: ['Artificial Intelligence', 'Marketing'],
    tags: ['AI', 'Marketing', 'Digital Transformation']
  },
  {
    file: 'BLOG_POST_PRESS_RELEASE_TIPS.md',
    title: 'Press Release Writing Tips: How to Get Journalists to Actually Read Your Story',
    excerpt: 'Every day, journalists receive hundreds of press releases. Learn the fundamental writing principles that make the difference between coverage and obscurity.',
    categories: ['Public Relations', 'Writing'],
    tags: ['Press Releases', 'Writing', 'Media Relations']
  },
  {
    file: 'BLOG_POST_DIGITAL_MARKETING_EFFECTIVENESS.md',
    title: 'Measuring Digital Marketing Effectiveness: A Data-Driven Methodology',
    excerpt: 'Digital marketing promises unprecedented measurability, yet many businesses struggle to determine what actually drives results. Learn a rigorous framework for measuring what matters.',
    categories: ['Digital Marketing', 'Analytics'],
    tags: ['Analytics', 'Marketing Strategy', 'Data-Driven']
  }
];

async function createPost(post) {
  try {
    // Read markdown content
    const content = fs.readFileSync(post.file, 'utf8');
    
    // Create WordPress post
    // WP Engine requires index.php?rest_route= format instead of /wp-json/
    const response = await fetch(`${WP_SITE}/index.php?rest_route=/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        title: post.title,
        content: content,
        excerpt: post.excerpt,
        status: 'publish',
        // author defaults to authenticated user
        format: 'standard'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create post: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log(`✅ Created: "${post.title}"`);
    console.log(`   URL: ${result.link}`);
    console.log(`   ID: ${result.id}\n`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error creating "${post.title}":`, error.message);
    return null;
  }
}

async function main() {
  console.log('Starting WordPress blog post import...\n');
  console.log(`Target site: ${WP_SITE}\n`);
  
  for (const post of blogPosts) {
    await createPost(post);
    // Small delay between posts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ Import complete!');
}

main().catch(console.error);
