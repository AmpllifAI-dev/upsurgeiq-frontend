import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useLocation } from "wouter";

export default function CookiePolicy() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
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
              <a href="/about" className="block text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
            </div>
            <div className="pt-4 sm:hidden">
              <Button onClick={() => setLocation("/dashboard")} variant="default" className="w-full">Go to Dashboard</Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto py-16 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely 
                used to make websites work more efficiently, provide a better user experience, and provide information to the website owners. 
                Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device after you close your browser, 
                while session cookies are deleted when you close your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                UpsurgeIQ uses cookies and similar tracking technologies to improve your experience on our platform, analyze usage patterns, 
                and provide personalized content. We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Essential Cookies:</strong> Required for the platform to function properly (authentication, security, session management)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our platform</li>
                <li><strong>Performance Cookies:</strong> Monitor and improve platform performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Strictly Necessary Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                These cookies are essential for the platform to function and cannot be disabled. They include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Authentication Cookies:</strong> Keep you logged in as you navigate the platform</li>
                <li><strong>Security Cookies:</strong> Protect against unauthorized access and fraudulent activity</li>
                <li><strong>Session Cookies:</strong> Maintain your session state across page requests</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Functional Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                These cookies enable enhanced functionality and personalization:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Preference Cookies:</strong> Remember your language, theme, and display preferences</li>
                <li><strong>Feature Cookies:</strong> Remember your choices (e.g., dashboard layout, notification settings)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Analytics and Performance Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                These cookies help us understand how visitors interact with our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Usage Analytics:</strong> Track pages visited, features used, and time spent</li>
                <li><strong>Error Tracking:</strong> Identify and diagnose technical issues</li>
                <li><strong>Performance Monitoring:</strong> Measure page load times and optimize performance</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                We use our own analytics system to collect this data. No personal information is shared with third parties for analytics purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the following third-party services that may set cookies on your device:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Stripe:</strong> Payment processing (essential for subscription management)</li>
                <li><strong>Social Media Platforms:</strong> When you connect Facebook, Instagram, or LinkedIn accounts</li>
                <li><strong>AI Services:</strong> For content generation (cookies are session-based and not used for tracking)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                These third-party services have their own cookie policies. We recommend reviewing their policies to understand how they use cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. How Long Do Cookies Last?</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The duration of cookies varies depending on their purpose:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Authentication Cookies:</strong> Last for 30 days or until you log out</li>
                <li><strong>Preference Cookies:</strong> Last for 1 year</li>
                <li><strong>Analytics Cookies:</strong> Last for 2 years</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Managing Cookies</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Browser Settings</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies from specific websites</li>
                <li>Block all cookies from being set</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that blocking or deleting cookies may impact your experience on UpsurgeIQ and prevent certain features from working properly.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Browser-Specific Instructions</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Do Not Track Signals</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some browsers have a "Do Not Track" feature that signals to websites that you do not want to have your online activity tracked. 
                Currently, there is no industry standard for how to respond to Do Not Track signals. We do not currently respond to Do Not Track 
                signals, but we only use cookies as described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Cookies and Personal Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some cookies may collect personal data (such as your user ID or email address). This data is processed in accordance with our 
                <a href="/privacy" className="text-primary hover:underline"> Privacy Policy</a>. We use appropriate security measures to protect 
                cookie data from unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Changes to This Cookie Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. 
                We will notify you of any significant changes by posting the new Cookie Policy on this page and updating the "Last updated" date. 
                We encourage you to review this Cookie Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> info@upsurgeiq.com</p>
                <p><strong>Address:</strong> London, United Kingdom</p>
                <p><strong>Contact Form:</strong> <a href="/contact" className="text-primary hover:underline">https://upsurgeiq.com/contact</a></p>
              </div>
            </section>

            <section className="bg-muted/30 p-6 rounded-lg mt-8">
              <h3 className="text-xl font-semibold mb-3">Cookie Consent</h3>
              <p className="text-muted-foreground leading-relaxed">
                By continuing to use UpsurgeIQ, you consent to our use of cookies as described in this Cookie Policy. If you do not agree 
                with our use of cookies, you should adjust your browser settings or discontinue use of the platform.
              </p>
            </section>
          </div>
        </div>
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
