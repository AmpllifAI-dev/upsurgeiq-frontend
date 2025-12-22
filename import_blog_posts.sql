-- Import blog posts into the database

INSERT INTO blog_posts (title, slug, excerpt, content, author, category, tags, featured_image, published_at, created_at, updated_at)
VALUES
(
  'PR Best Practices That Actually Work in 2025',
  'pr-best-practices-2025',
  'Public relations has evolved dramatically over the past decade. Learn the essential practices that separate effective PR campaigns from those that disappear into the void.',
  '$(cat BLOG_POST_PR_BEST_PRACTICES.md | sed "s/'/''/g")',
  'Christopher Lembke',
  'Public Relations',
  'PR,Best Practices,Media Relations',
  NULL,
  '2025-12-21 00:00:00',
  NOW(),
  NOW()
),
(
  'The Future of AI in Marketing: Beyond the Hype',
  'ai-in-marketing-future',
  'Artificial intelligence has transitioned from experimental technology to essential marketing infrastructure. Discover how AI is transforming marketing work and what it means for your business.',
  '$(cat BLOG_POST_AI_IN_MARKETING.md | sed "s/'/''/g")',
  'Christopher Lembke',
  'Artificial Intelligence',
  'AI,Marketing,Digital Transformation',
  NULL,
  '2025-12-21 00:00:00',
  NOW(),
  NOW()
),
(
  'Press Release Writing Tips: How to Get Journalists to Actually Read Your Story',
  'press-release-writing-tips',
  'Every day, journalists receive hundreds of press releases. Learn the fundamental writing principles that make the difference between coverage and obscurity.',
  '$(cat BLOG_POST_PRESS_RELEASE_TIPS.md | sed "s/'/''/g")',
  'Christopher Lembke',
  'Public Relations',
  'Press Releases,Writing,Media Relations',
  NULL,
  '2025-12-21 00:00:00',
  NOW(),
  NOW()
),
(
  'Measuring Digital Marketing Effectiveness: A Data-Driven Methodology',
  'digital-marketing-effectiveness',
  'Digital marketing promises unprecedented measurability, yet many businesses struggle to determine what actually drives results. Learn a rigorous framework for measuring what matters.',
  '$(cat BLOG_POST_DIGITAL_MARKETING_EFFECTIVENESS.md | sed "s/'/''/g")',
  'Christopher Lembke',
  'Digital Marketing',
  'Analytics,Marketing Strategy,Data-Driven',
  NULL,
  '2025-12-21 00:00:00',
  NOW(),
  NOW()
);
