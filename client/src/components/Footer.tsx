import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { Button } from "./ui/button";

export default function Footer() {
  const footerLinks = {
    platform: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Advertise", href: "/advertise" },
    ],
    categories: [
      { name: "Technology", href: "/category/technology" },
      { name: "Business", href: "/category/business" },
      { name: "Design", href: "/category/design" },
      { name: "Lifestyle", href: "/category/lifestyle" },
      { name: "Marketing", href: "/category/marketing" },
    ],
    resources: [
      { name: "Blog Guidelines", href: "/guidelines" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
  ];

  return (
    <footer className="border-t bg-card mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">
              Testcraft <span className="text-primary">Blogs</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your source for professional insights on technology, business, design, and lifestyle.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  asChild
                  data-testid={`button-social-${social.label.toLowerCase()}`}
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-${link.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-cat-${link.name.toLowerCase()}`}>
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-res-${link.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Testcraft Blogs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
