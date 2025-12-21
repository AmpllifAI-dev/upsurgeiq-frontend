import axios from 'axios';
import fs from 'fs';

const WORDPRESS_URL = 'https://blog.upsurgeiq.com';
const USERNAME = 'christopher';
const APP_PASSWORD = 'Wg3R fmqH 6zYJ UQb4 Gg1S Yz0r';

const auth = Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64');

const client = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wp/v2`,
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  },
});

// Read the updated blog post files
const blogPosts = [
  { file: 'BLOG_POST_PR_BEST_PRACTICES.md', slug: 'pr-best-practices-that-actually-work-in-2025' },
  { file: 'BLOG_POST_AI_IN_MARKETING.md', slug: 'the-future-of-ai-in-marketing-beyond-the-hype' },
  { file: 'BLOG_POST_PRESS_RELEASE_TIPS.md', slug: 'press-release-writing-tips-how-to-get-journalists-to-actually-read-your-story' },
  { file: 'BLOG_POST_DIGITAL_MARKETING_EFFECTIVENESS.md', slug: 'measuring-digital-marketing-effectiveness-a-data-driven-methodology' },
];

async function updateBlogPosts() {
  for (const post of blogPosts) {
    try {
      // Get the post by slug
      const searchResponse = await client.get('/posts', {
        params: { slug: post.slug }
      });

      if (searchResponse.data.length === 0) {
        console.log(`Post not found: ${post.slug}`);
        continue;
      }

      const postId = searchResponse.data[0].id;
      const content = fs.readFileSync(post.file, 'utf8');

      // Update the post content
      await client.put(`/posts/${postId}`, {
        content: content,
      });

      console.log(`✅ Updated: ${post.slug}`);
    } catch (error) {
      console.error(`❌ Error updating ${post.slug}:`, error.message);
    }
  }
}

updateBlogPosts().then(() => {
  console.log('\n✅ All blog posts updated with corrected author name!');
}).catch(error => {
  console.error('Error:', error.message);
});
