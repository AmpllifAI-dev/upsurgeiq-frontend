import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

interface DashboardHeaderProps {
  currentPage?: string;
}

export function DashboardHeader({ currentPage }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Press Releases", href: "/press-releases" },
    { name: "Social Media", href: "/social-media" },
    { name: "Campaigns", href: "/campaigns" },
    { name: "Analytics", href: "/analytics" },
    { name: "Media Lists", href: "/media-lists" },
  ];

  const publicPages = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ];

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">UpsurgeIQ</span>
          </div>
          
          {/* Horizontal navigation menu - key dashboard pages */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={
                  currentPage === item.name
                    ? "text-sm font-medium text-foreground"
                    : "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                }
                aria-current={currentPage === item.name ? "page" : undefined}
              >
                {item.name}
              </a>
            ))}
          </div>
          
          {/* Hamburger menu button - visible on all screens */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white shadow-lg">
            <div className="py-4 px-4 space-y-1">
              {/* Dashboard section */}
              <div className="pb-2 mb-2 border-b">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Dashboard
                </p>
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block py-2 px-3 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Public pages section */}
              <div className="pb-2 mb-2 border-b">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Public Pages
                </p>
                {publicPages.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Settings */}
              <a
                href="/profile"
                className="block py-2 px-3 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
              >
                Settings
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
