import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, ShoppingCart, FileText, Image as ImageIcon } from "lucide-react";

/**
 * Purchases Page
 * 
 * Allows users to purchase word count and image pack add-ons
 */

export default function Purchases() {
  const [isLoadingWordCount, setIsLoadingWordCount] = useState<string | null>(null);
  const [isLoadingImagePack, setIsLoadingImagePack] = useState<string | null>(null);

  const createWordCountCheckout = trpc.purchases.createWordCountCheckout.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      alert(error.message || "Failed to create checkout session");
      setIsLoadingWordCount(null);
    },
  });

  const createImagePackCheckout = trpc.purchases.createImagePackCheckout.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      alert(error.message || "Failed to create checkout session");
      setIsLoadingImagePack(null);
    },
  });

  const handleWordCountPurchase = (wordCountKey: "words_300" | "words_600" | "words_900") => {
    setIsLoadingWordCount(wordCountKey);
    createWordCountCheckout.mutate({ wordCountKey });
  };

  const handleImagePackPurchase = (imagePackKey: "single" | "pack_5" | "pack_10") => {
    setIsLoadingImagePack(imagePackKey);
    createImagePackCheckout.mutate({ imagePackKey });
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Purchase Add-Ons</h1>
        <p className="text-muted-foreground">
          Extend your plan with additional word count and image credits
        </p>
      </div>

      {/* Word Count Add-Ons */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Extra Words for Press Releases</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Need longer press releases? Purchase additional words to extend beyond your tier limit.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 300 Words */}
          <Card>
            <CardHeader>
              <CardTitle>300 Extra Words</CardTitle>
              <CardDescription>Perfect for adding more detail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">£4</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>300 additional words</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Never expires</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Use anytime</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleWordCountPurchase("words_300")}
                disabled={isLoadingWordCount === "words_300"}
              >
                {isLoadingWordCount === "words_300" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* 600 Words */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>600 Extra Words</CardTitle>
                <Badge>Best Value</Badge>
              </div>
              <CardDescription>Ideal for comprehensive coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">£8</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>600 additional words</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Never expires</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Use anytime</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleWordCountPurchase("words_600")}
                disabled={isLoadingWordCount === "words_600"}
              >
                {isLoadingWordCount === "words_600" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* 900 Words */}
          <Card>
            <CardHeader>
              <CardTitle>900 Extra Words</CardTitle>
              <CardDescription>Maximum flexibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">£12</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>900 additional words</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Never expires</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Use anytime</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleWordCountPurchase("words_900")}
                disabled={isLoadingWordCount === "words_900"}
              >
                {isLoadingWordCount === "words_900" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Image Pack Add-Ons */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">AI Image Credits</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Generate additional professional images for your press releases and campaigns.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Single Image */}
          <Card>
            <CardHeader>
              <CardTitle>Single Image</CardTitle>
              <CardDescription>One professional AI image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">£3.99</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>1 AI-generated image</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>High resolution</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Commercial use</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleImagePackPurchase("single")}
                disabled={isLoadingImagePack === "single"}
              >
                {isLoadingImagePack === "single" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* 5 Images */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>5 Image Credits</CardTitle>
                <Badge>Save £5</Badge>
              </div>
              <CardDescription>Five professional AI images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">£14.99</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>5 AI-generated images</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>High resolution</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Commercial use</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleImagePackPurchase("pack_5")}
                disabled={isLoadingImagePack === "pack_5"}
              >
                {isLoadingImagePack === "pack_5" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* 10 Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>10 Image Credits</CardTitle>
                <Badge variant="secondary">Save £15</Badge>
              </div>
              <CardDescription>Ten professional AI images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">£24.99</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>10 AI-generated images</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>High resolution</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Commercial use</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleImagePackPurchase("pack_10")}
                disabled={isLoadingImagePack === "pack_10"}
              >
                {isLoadingImagePack === "pack_10" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
