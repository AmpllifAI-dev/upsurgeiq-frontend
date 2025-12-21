import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using UpsurgeIQ ("the Platform," "we," "our," or "us"), you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or 
                accessing this platform. The materials contained in this platform are protected by applicable copyright and trademark law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access and use the Platform for your internal business purposes</li>
                <li>Create, store, and distribute content generated through the Platform</li>
                <li>Connect your social media accounts and distribute content on your behalf</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4 mb-3">
                This license shall automatically terminate if you violate any of these restrictions. You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Modify, copy, or reverse engineer any part of the Platform</li>
                <li>Remove any copyright or proprietary notations from the Platform</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any portion of the Platform</li>
                <li>Use automated systems (bots, scrapers) to access the Platform without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Account Registration and Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To use certain features of the Platform, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, 
                not current, or incomplete.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Subscription Plans and Payment</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Subscription Tiers</h3>
              <p className="text-muted-foreground leading-relaxed">
                UpsurgeIQ offers multiple subscription tiers (Starter, Pro, Scale) with different features and usage limits. 
                Current pricing and features are available on our pricing page.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Billing and Payment</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Subscriptions are billed monthly in advance</li>
                <li>Payment is processed through Stripe, our secure payment processor</li>
                <li>You authorize us to charge your payment method on a recurring basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change our pricing with 30 days' notice</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Cancellation and Refunds</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end 
                of your current billing period. No refunds will be provided for partial months or unused features, except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Content Ownership and License</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Your Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                You retain all ownership rights to content you create, upload, or generate using the Platform ("Your Content"). 
                By using the Platform, you grant us a worldwide, non-exclusive, royalty-free license to use, store, reproduce, and 
                display Your Content solely for the purpose of providing and improving our services.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 AI-Generated Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                Content generated by our AI tools is provided to you under a license that allows you to use, modify, and distribute 
                it for your business purposes. You are responsible for reviewing and ensuring the accuracy, legality, and appropriateness 
                of all AI-generated content before publication.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Platform Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of the Platform (excluding Your Content) are owned by UpsurgeIQ and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Acceptable Use Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You agree not to use the Platform to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Distribute spam, malware, or viruses</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Platform or servers</li>
                <li>Collect or store personal data about other users without consent</li>
                <li>Generate content that is defamatory, fraudulent, or misleading</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Third-Party Integrations</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Platform integrates with third-party services (social media platforms, payment processors, AI services). Your use 
                of these third-party services is subject to their respective terms of service and privacy policies. We are not responsible 
                for the actions, content, or policies of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. 
                WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED. 
                WE DO NOT WARRANT THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT, INCLUDING AI-GENERATED CONTENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, UPSURGEIQ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, 
                OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR USE OR INABILITY TO USE 
                THE PLATFORM; (B) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS; (C) ANY INTERRUPTION OR CESSATION OF TRANSMISSION 
                TO OR FROM THE PLATFORM; (D) ANY BUGS, VIRUSES, OR THE LIKE THAT MAY BE TRANSMITTED THROUGH THE PLATFORM; OR (E) ANY 
                ERRORS OR OMISSIONS IN ANY CONTENT. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS 
                PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless UpsurgeIQ and its officers, directors, employees, and agents from 
                any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in 
                any way connected with your access to or use of the Platform, your violation of these Terms, or your infringement 
                of any intellectual property or other rights of any third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, 
                for any reason, including breach of these Terms. Upon termination, your right to use the Platform will immediately cease. 
                All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, 
                warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to 
                its conflict of law provisions. Any disputes arising from these Terms or your use of the Platform shall be resolved 
                through binding arbitration in London, United Kingdom, except that either party may seek injunctive relief in court 
                for intellectual property infringement or violation of confidentiality obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, 
                we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will 
                be determined at our sole discretion. By continuing to access or use the Platform after revisions become effective, 
                you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted 
                to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining 
                provisions will continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> info@upsurgeiq.com</p>
                <p><strong>Address:</strong> London, United Kingdom</p>
                <p><strong>Contact Form:</strong> <a href="/contact" className="text-primary hover:underline">https://upsurgeiq.com/contact</a></p>
              </div>
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
