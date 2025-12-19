import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  BookOpen,
  MessageCircle,
  FileText,
  Zap,
  Users,
  TrendingUp,
  Mail,
  Video,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";

interface HelpArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const helpArticles: HelpArticle[] = [
  {
    id: "pr-create",
    category: "Press Releases",
    question: "How do I create a press release?",
    answer: "Navigate to Press Releases from the sidebar, click 'Create Press Release', and fill in your content. You can use our AI assistant to help generate professional press releases based on your key points.",
    tags: ["press release", "create", "ai"],
  },
  {
    id: "pr-distribute",
    category: "Press Releases",
    question: "How do I distribute my press release to journalists?",
    answer: "After creating your press release, click 'Distribute' and select the media lists you want to send to. You can purchase access to our curated media lists (£4 per list) or create your own custom lists.",
    tags: ["press release", "distribute", "media lists"],
  },
  {
    id: "media-lists",
    category: "Media Lists",
    question: "What are media lists and how do I use them?",
    answer: "Media lists are curated databases of journalist contacts organized by industry and publication type. You can purchase access to our default lists or create custom lists by importing CSV files or adding contacts manually.",
    tags: ["media lists", "journalists", "contacts"],
  },
  {
    id: "campaigns",
    category: "Campaigns",
    question: "How do I create a marketing campaign?",
    answer: "Go to Campaign Lab, click 'Create Campaign', and define your campaign goals, budget, and timeline. You can add multiple content variants and track performance across different channels.",
    tags: ["campaign", "marketing", "create"],
  },
  {
    id: "social-media",
    category: "Social Media",
    question: "Can I schedule social media posts?",
    answer: "Yes! Connect your social media accounts in Settings, then create posts in the Social Media section. You can schedule posts for future publication across Facebook, Instagram, LinkedIn, and X (Twitter).",
    tags: ["social media", "schedule", "posts"],
  },
  {
    id: "ai-assistant",
    category: "AI Features",
    question: "How does the AI assistant work?",
    answer: "Our AI assistant helps you with content creation, strategy advice, and campaign planning. Simply ask questions or request help with specific tasks like writing press releases, crafting social media posts, or developing campaign strategies.",
    tags: ["ai", "assistant", "help"],
  },
  {
    id: "subscription-tiers",
    category: "Billing",
    question: "What are the differences between subscription tiers?",
    answer: "Starter (£29/mo): 10 press releases, 20 social posts, 5 campaigns. Pro (£79/mo): 50 press releases, 100 social posts, 20 campaigns, priority support. Scale (£199/mo): Unlimited everything, dedicated account manager, API access.",
    tags: ["subscription", "pricing", "tiers"],
  },
  {
    id: "analytics",
    category: "Analytics",
    question: "How do I track my press release performance?",
    answer: "Visit the Analytics dashboard to see detailed metrics including open rates, click-through rates, and engagement by publication. You can export reports as CSV or PDF for further analysis.",
    tags: ["analytics", "tracking", "metrics"],
  },
  {
    id: "api-access",
    category: "Advanced",
    question: "Does upsurgeIQ offer API access?",
    answer: "API access is available on the Scale plan. You can programmatically create press releases, manage campaigns, and retrieve analytics data. Contact support for API documentation and credentials.",
    tags: ["api", "integration", "scale"],
  },
  {
    id: "export-data",
    category: "Data Management",
    question: "Can I export my data?",
    answer: "Yes! You can export press releases, campaigns, and analytics data as CSV or JSON files. Go to your Profile settings and click 'Export Data' to download all your content.",
    tags: ["export", "data", "download"],
  },
];

const categories = Array.from(new Set(helpArticles.map((a) => a.category)));

export default function Help() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = helpArticles.filter((article) => {
    const matchesSearch =
      searchTerm === "" ||
      article.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-lime-600 text-white">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-teal-50 mb-8">
              Find answers, learn best practices, and get the most out of upsurgeIQ
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-white text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Articles
                  <Badge variant="secondary" className="ml-auto">
                    {helpArticles.length}
                  </Badge>
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                    <Badge variant="secondary" className="ml-auto">
                      {helpArticles.filter((a) => a.category === category).length}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/ai-assistant">
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    AI Assistant
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Video Tutorials
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search or browse by category
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedCategory || "All Articles"}{" "}
                    <Badge variant="secondary" className="ml-2">
                      {filteredArticles.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {searchTerm && `Showing results for "${searchTerm}"`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredArticles.map((article) => (
                      <AccordionItem key={article.id} value={article.id}>
                        <AccordionTrigger className="text-left">
                          <div>
                            <div className="font-semibold">{article.question}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {article.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-700 leading-relaxed">{article.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Popular Topics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <FileText className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Getting Started</h3>
                  <p className="text-sm text-gray-600">
                    Learn the basics of creating press releases and campaigns
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <Zap className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Best Practices</h3>
                  <p className="text-sm text-gray-600">
                    Tips for maximizing your PR and marketing impact
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Advanced Features</h3>
                  <p className="text-sm text-gray-600">
                    Unlock the full potential of upsurgeIQ
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
