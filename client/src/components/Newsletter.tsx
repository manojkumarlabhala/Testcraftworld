import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    toast({
      title: "Subscribed!",
      description: "You've successfully subscribed to our newsletter.",
    });
    setEmail("");
  };

  return (
    <Card className="p-8 md:p-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Get the latest articles, insights, and exclusive content delivered directly to your inbox every week.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
            data-testid="input-newsletter-email"
          />
          <Button type="submit" size="default" data-testid="button-subscribe">
            Subscribe
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4">
          Join 10,000+ readers. Unsubscribe anytime.
        </p>
      </div>
    </Card>
  );
}
