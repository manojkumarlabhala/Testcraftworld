import Hero from "@/components/Hero";
import BlogCard from "@/components/BlogCard";
import Newsletter from "@/components/Newsletter";
import AdSlot from "@/components/AdSlot";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
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

export default function Home() {
  const [location] = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/categories')
        ]);
        const postsData = await postsRes.json();
        const categoriesData = await categoriesRes.json();
        setPosts(postsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [featuredPost, ...otherPosts] = posts;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div>
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <AdSlot position="header" className="mb-12" />

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Latest Articles</h2>
        </div>

        {featuredPost && (
          <div className="mb-12">
            <BlogCard 
              id={featuredPost.id}
              title={featuredPost.title}
              excerpt={featuredPost.excerpt}
              category={categories.find(c => c.id === featuredPost.categoryId)?.name || 'Uncategorized'}
              author={{ name: featuredPost.authorName }}
              publishedAt={new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString()}
              readTime="5 min read"
              image={featuredPost.featuredImage || '/placeholder.jpg'}
              featured={true}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {otherPosts.map((post) => (
            <BlogCard 
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              category={categories.find(c => c.id === post.categoryId)?.name || 'Uncategorized'}
              author={{ name: post.authorName }}
              publishedAt={new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
              readTime="5 min read"
              image={post.featuredImage || '/placeholder.jpg'}
            />
          ))}
        </div>

        <div className="mb-12">
          <Newsletter />
        </div>

        <AdSlot position="footer" />
      </div>
    </div>
  );
}
