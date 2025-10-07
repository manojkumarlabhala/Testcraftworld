import { Button } from "./ui/button";
import { Facebook, Twitter, Linkedin, Link2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export default function ShareButtons({ title, url = window.location.href }: ShareButtonsProps) {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "The article link has been copied to your clipboard.",
    });
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium mr-2">Share:</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9"
        asChild
        data-testid="button-share-twitter"
      >
        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9"
        asChild
        data-testid="button-share-facebook"
      >
        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9"
        asChild
        data-testid="button-share-linkedin"
      >
        <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-4 w-4" />
        </a>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9"
        asChild
        data-testid="button-share-email"
      >
        <a href={shareLinks.email}>
          <Mail className="h-4 w-4" />
        </a>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9"
        onClick={handleCopyLink}
        data-testid="button-copy-link"
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
