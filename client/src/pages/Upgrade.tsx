import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Check, Zap } from "lucide-react";

export default function Upgrade() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 10 press releases/month",
        "3 social media platforms (Facebook, Instagram, LinkedIn)",
        "Basic AI content generation",
        "Email distribution to 50 journalists",
        "Basic analytics",
      ],
    },
    {
      name: "Pro",
      price: "$299",
      period: "/month",
      description: "For growing businesses with regular PR needs",
      features: [
        "Up to 50 press releases/month",
        "3 social media platforms (Facebook, Instagram, LinkedIn)",
        "Advanced AI content generation",
        "Email distribution to 500 journalists",
        "Advanced analytics & reporting",
        "Priority support",
        "Custom media lists",
      ],
      popular: true,
    },
    {
      name: "Scale",
      price: "$799",
      period: "/month",
      description: "For enterprises and agencies",
      features: [
        "Unlimited press releases",
        "3 social media platforms (Facebook, Instagram, LinkedIn)",
        "Premium AI content generation",
        "Email distribution to unlimited journalists",
        "White-label reporting",
        "Dedicated account manager",
        "API access",
        "Multi-user team collaboration",
      ],
    },
  ];

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <Badge className="mb-4">Pricing</Badge>
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your PR and social media needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.popular ? "border-primary shadow-lg" : ""}
          >
            <CardHeader>
              {plan.popular && (
                <Badge className="w-fit mb-2">Most Popular</Badge>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full mb-6"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => setLocation("/subscribe")}
              >
                <Zap className="w-4 h-4 mr-2" />
                Get Started
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
