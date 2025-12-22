import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">UpsurgeIQ</h2>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Welcome to UpsurgeIQ</h1>
            <p className="text-muted-foreground text-xl mb-8">
              Your AI-powered press release distribution platform
            </p>
            {isAuthenticated ? (
              <div className="flex gap-4 justify-center">
                <Link href="/media-lists">
                  <Button size="lg">Browse Media Lists</Button>
                </Link>
                <Link href="/credits">
                  <Button size="lg" variant="outline">
                    Purchase Credits
                  </Button>
                </Link>
              </div>
            ) : (
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Media Lists</CardTitle>
                <CardDescription>
                  Browse journalist contacts by Genre, Geography, and Industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our AI researches and builds comprehensive media lists automatically. 
                  Choose from lifestyle categories like Yachting, Fishing, Model Trains, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credit-Based Distribution</CardTitle>
                <CardDescription>
                  Pay only for what you use with our flexible credit system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  1 credit = 1 media list per distribution. Credits never expire and roll over.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Protected</CardTitle>
                <CardDescription>
                  Journalist contact details are proprietary information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We send personalized emails to journalists on your behalf. You never see individual contact details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 UpsurgeIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
