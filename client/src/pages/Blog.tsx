import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, Menu, X, Search, Calendar, User, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Blog() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch blog posts from WordPress REST API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          'https://amplifai.wpenginepowered.com/index.php?rest_route=/wp/v2/posts&_embed'
        );
        const posts = await response.json();
        
        // Transform WordPress posts to our format
        const transformedPosts = posts.map((post: any) => ({
          id: post.id,
          title: post.title.rendered,
          slug: post.slug,
          excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, ''), // Strip HTML tags
          coverImageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Uncategorized',
          publishedAt: new Date(post.date),
          author: post._embedded?.author?.[0]?.name || 'Christopher Logue',
          viewCount: 0, // WordPress doesn't track views by default
        }));
        
        setBlogPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const categories = ["All", "AI in PR", "Best Practices", "Case Studies", "Industry News"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog - Insights & Best Practices"
        description="Expert advice on AI-powered PR, marketing strategies, and industry trends. Learn how to amplify your brand voice and grow your business with professional content creation."
        keywords="PR blog, marketing insights, AI content creation, press release tips, media relations, content marketing strategies"
        canonicalUrl="https://upsurgeiq.com/blog"
      />
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

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Insights & Best Practices
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert advice on AI-powered PR, marketing strategies, and industry trends to help you grow your business.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No articles found matching your search.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setLocation(`/blog/${post.slug}`)}
              >
                {post.coverImageUrl && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:text-primary">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
