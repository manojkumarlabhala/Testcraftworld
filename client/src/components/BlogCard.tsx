import { Link } from "wouter";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import CategoryBadge from "./CategoryBadge";
import { Clock, Heart, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export default function BlogCard({
  id,
  title,
  excerpt,
  category,
  author,
  publishedAt,
  readTime,
  image,
  featured = false,
}: BlogCardProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  if (featured) {
    return (
      <Card className="overflow-hidden hover-elevate group" data-testid={`card-blog-${id}`}>
        <Link href={`/post/${id}`}>
          <a>
            <div className="relative h-96 overflow-hidden">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <CategoryBadge category={category} />
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                  {title}
                </h2>
                <p className="text-gray-200 text-lg mb-4 line-clamp-2">{excerpt}</p>
                <div className="flex items-center gap-3 text-gray-300">
                  <Avatar className="h-8 w-8 ring-2 ring-white/20">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{author.name}</span>
                  <span className="text-sm">•</span>
                  <span className="text-sm">{publishedAt}</span>
                  <span className="text-sm">•</span>
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {readTime}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover-elevate group flex flex-col" data-testid={`card-blog-${id}`}>
      <Link href={`/post/${id}`}>
        <a>
          <div className="relative h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </a>
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={category} />
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setLiked(!liked)}
              data-testid={`button-like-${id}`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setBookmarked(!bookmarked)}
              data-testid={`button-bookmark-${id}`}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        <Link href={`/post/${id}`}>
          <a>
            <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
              {title}
            </h3>
          </a>
        </Link>
        <p className="text-muted-foreground mb-4 line-clamp-2 flex-1">{excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{author.name}</span>
              <span className="text-xs text-muted-foreground">{publishedAt}</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readTime}
          </span>
        </div>
      </div>
    </Card>
  );
}
