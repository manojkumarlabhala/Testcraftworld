import { useRoute } from "wouter";
import { ChevronRight, Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import CategoryBadge from "@/components/CategoryBadge";
import AuthorCard from "@/components/AuthorCard";
import ShareButtons from "@/components/ShareButtons";
import Comment from "@/components/Comment";
import TableOfContents from "@/components/TableOfContents";
import AdSlot from "@/components/AdSlot";
import BlogCard from "@/components/BlogCard";
import { lazy, Suspense } from "react";
const MarkdownRenderer = lazy(() => import("@/components/MarkdownRenderer"));
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  sourceLink?: string | null;
  authorName: string;
  categoryId: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BlogPost() {
  const [, params] = useRoute<{ id: string }>("/post/:id");
  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params || !params.id) return;
      try {
        const postRes = await fetch(`/api/posts/${params.id}`);
        const postData = await postRes.json();
        setPost(postData);

        if (postData.categoryId) {
          const catRes = await fetch('/api/categories');
          const categories = await catRes.json();
          const cat = categories.find((c: Category) => c.id === postData.categoryId);
          setCategory(cat || null);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params?.id]);

  if (loading || !post) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const comments = [];

  const tableOfContents = [
    { id: "intro", text: "Introduction", level: 2 },
    { id: "what-is-ai", text: "What is AI in Development?", level: 2 },
    { id: "machine-learning", text: "Machine Learning", level: 3 },
    { id: "deep-learning", text: "Deep Learning", level: 3 },
    { id: "applications", text: "Applications in Development", level: 2 },
    { id: "code-generation", text: "Code Generation", level: 3 },
    { id: "testing", text: "Automated Testing", level: 3 },
    { id: "conclusion", text: "Conclusion", level: 2 },
  ];

  const relatedPosts = [
    {
      id: "2",
      title: "Building Scalable Startups in 2024",
      excerpt: "Key strategies and insights for entrepreneurs.",
      category: "Business",
      author: { name: "Michael Chen" },
      publishedAt: "Mar 12, 2024",
      readTime: "6 min read",
      image: "/placeholder.jpg",
    },
    {
      id: "3",
      title: "Cloud Computing Essentials",
      excerpt: "Everything you need to know about cloud infrastructure.",
      category: "Technology",
      author: { name: "David Kumar" },
      publishedAt: "Mar 10, 2024",
      readTime: "7 min read",
      image: "/placeholder.jpg",
    },
    {
      id: "4",
      title: "DevOps Best Practices 2024",
      excerpt: "Modern approaches to continuous delivery and deployment.",
      category: "Technology",
      author: { name: "Emma Watson" },
      publishedAt: "Mar 8, 2024",
      readTime: "9 min read",
      image: "/placeholder.jpg",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="relative h-96 overflow-hidden">
        <img
          src={post.featuredImage || "/placeholder.jpg"}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10">
        <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
          <a href="/" className="hover:text-white">Home</a>
          <ChevronRight className="h-4 w-4" />
          <a href={`/category/${category?.slug || 'uncategorized'}`} className="hover:text-white">{category?.name || 'Uncategorized'}</a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Article</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="p-8 md:p-12 mb-8">
              <CategoryBadge category={category?.name || 'Uncategorized'} />
              <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">{post.title}</h1>
              
              <div className="flex items-center gap-6 text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  5 min read
                </span>
                {post.sourceLink && (
                  <span className="flex items-center gap-2">
                    <a className="text-sm text-blue-400 hover:underline" href={post.sourceLink} target="_blank" rel="noopener noreferrer">Source</a>
                  </span>
                )}
              </div>

              <ShareButtons title={post.title} />
              
              <Separator className="my-8" />

              <Suspense fallback={<div className="prose max-w-none">Loading content...</div>}>
                <MarkdownRenderer content={post.content} />
              </Suspense>

              <Separator className="my-8" />

              <ShareButtons title={post.title} />
            </Card>

            <div className="mb-8">
              <AuthorCard
                name={post.authorName}
                bio={`Blog writer at Testcraft World. Passionate about sharing knowledge and insights.`}
                articleCount={1}
              />
            </div>

            <AdSlot position="in-content" className="mb-8" />

            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
              
              <div className="mb-6">
                <textarea
                  className="w-full p-4 border rounded-md resize-none"
                  rows={4}
                  placeholder="Join the discussion..."
                  data-testid="textarea-new-comment"
                />
                <div className="flex justify-end mt-2">
                  <Button data-testid="button-post-comment">Post Comment</Button>
                </div>
              </div>

              <div className="space-y-6">
                {comments.map((comment) => (
                  <Comment key={comment.id} {...comment} />
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-6">
              <div className="hidden lg:block">
                <TableOfContents headings={tableOfContents} />
              </div>
              <AdSlot position="sidebar" />
            </div>
          </div>
        </div>

        <div className="mt-12 mb-12">
          <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <BlogCard key={relatedPost.id} {...relatedPost} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
