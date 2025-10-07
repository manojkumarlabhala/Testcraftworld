import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from '@assets/generated_images/Blog_hero_workspace_scene_3a70b45d.png';

export default function Hero() {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Discover Stories That Matter
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Expert insights on technology, business, design, and lifestyle from industry leaders and passionate writers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-white/95 backdrop-blur-sm text-foreground border border-white/20 hover:bg-white"
            data-testid="button-start-reading"
          >
            Start Reading
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
            data-testid="button-become-author"
          >
            Become an Author
          </Button>
        </div>
      </div>
    </section>
  );
}
