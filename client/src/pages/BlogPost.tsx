import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Menu, X, Calendar, User, ArrowLeft, Clock, Eye } from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function BlogPost() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Placeholder - will be replaced with real data from tRPC
  const post = {
    title: "The Future of AI in Public Relations: Trends for 2025",
    slug: "future-of-ai-in-pr-2025",
    excerpt: "Discover how artificial intelligence is transforming the PR industry and what it means for your business communications strategy.",
    content: `
# Introduction

Artificial intelligence is revolutionizing the public relations industry, transforming how businesses communicate with their audiences, manage media relationships, and measure campaign success. As we move into 2025, understanding these trends is crucial for staying competitive.

## The Rise of AI-Powered Content Creation

Traditional PR workflows often involve hours of manual writing, editing, and refinement. AI-powered tools like UpsurgeIQ are changing this paradigm by:

- **Automating press release generation** based on your business context and brand voice
- **Creating platform-specific social media content** that resonates with each audience
- **Generating multiple content variations** for A/B testing and optimization

This doesn't mean replacing human creativity—it means augmenting it. AI handles the heavy lifting of initial drafts, allowing PR professionals to focus on strategy, relationship building, and creative refinement.

## Personalization at Scale

One of the most significant advantages of AI in PR is the ability to personalize communications at scale. Modern AI systems can:

1. Analyze journalist preferences and beat coverage
2. Customize pitch angles for different media outlets
3. Optimize send times based on engagement patterns
4. Track and learn from response rates

## Predictive Analytics and Performance Tracking

AI doesn't just help create content—it helps you understand what works. Advanced analytics can:

- Predict which press releases will generate the most media coverage
- Identify trending topics before they peak
- Measure sentiment across multiple channels
- Provide actionable insights for campaign optimization

## The Human Touch Remains Essential

While AI is powerful, the most successful PR strategies combine artificial intelligence with human expertise. AI excels at:

- Data analysis and pattern recognition
- Content generation and variation testing
- Workflow automation and efficiency

But humans are still essential for:

- Building authentic relationships with journalists
- Understanding nuanced cultural contexts
- Making strategic decisions based on business goals
- Providing creative direction and brand stewardship

## Getting Started with AI-Powered PR

If you're ready to embrace AI in your PR strategy, start with these steps:

1. **Audit your current workflow** - Identify repetitive tasks that could be automated
2. **Choose the right tools** - Look for platforms that integrate with your existing systems
3. **Train your team** - Ensure everyone understands how to leverage AI effectively
4. **Start small** - Begin with one use case and expand as you see results
5. **Measure everything** - Track metrics to understand ROI and optimize over time

## Conclusion

The future of PR is not about choosing between human expertise and artificial intelligence—it's about combining both to achieve results that neither could accomplish alone. As AI tools become more sophisticated, the PR professionals who thrive will be those who embrace these technologies while maintaining the human connections that make great PR possible.

Ready to experience the future of PR? [Start your free trial with UpsurgeIQ](/subscribe) and see how AI can transform your communications strategy.
    `,
    coverImageUrl: null,
    category: "AI in PR",
    publishedAt: new Date("2025-01-15"),
    author: "Christopher Logue",
    authorTitle: "Founder & CEO, UpsurgeIQ",
    viewCount: 1247,
    readTime: 8,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
          <a href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UpsurgeIQ</span>
          </a>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="/blog" className="text-sm font-medium text-foreground transition-colors">Blog</a>
              <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
            </div>
            <Button onClick={() => setLocation("/dashboard")} variant="default" className="hidden sm:flex">Go to Dashboard</Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto py-6 space-y-6">
            <div className="space-y-3">
              <a href="/#features" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="/#pricing" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="/blog" className="block text-sm font-medium text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Blog</a>
              <a href="/about" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
            </div>
            <div className="pt-4 sm:hidden">
              <Button onClick={() => setLocation("/dashboard")} variant="default" className="w-full">Go to Dashboard</Button>
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/blog")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-md font-medium">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount.toLocaleString()} views
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
              {post.author.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="font-medium text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.authorTitle}</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-8">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <Card className="p-8 md:p-12">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {/* In production, this would use a markdown renderer like react-markdown */}
            <div dangerouslySetInnerHTML={{ __html: post.content.split('\n').map(line => {
              if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
              if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
              if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
              if (line.match(/^\d+\./)) return `<li>${line.slice(line.indexOf('.') + 2)}</li>`;
              if (line.trim() === '') return '<br>';
              return `<p>${line}</p>`;
            }).join('') }} />
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your PR Strategy?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of businesses using UpsurgeIQ to create professional press releases, 
              manage media relationships, and track campaign performance—all powered by AI.
            </p>
            <Button size="lg" onClick={() => setLocation("/subscribe")}>
              Start Free Trial
            </Button>
          </div>
        </Card>
      </article>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-20">
        <div className="container mx-auto py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="/status" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} UpsurgeIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
