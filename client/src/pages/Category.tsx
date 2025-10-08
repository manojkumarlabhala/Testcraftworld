import Hero from "@/components/Hero";
import BlogCard from "@/components/BlogCard";
import Newsletter from "@/components/Newsletter";
import AdSlot from "@/components/AdSlot";
import { useState, useEffect } from "react";
import { useRoute } from "wouter";

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
  description: string;
}

export default function CategoryPage() {
  const [match, params] = useRoute<{ category: string }>("/category/:category");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const categorySlug = params?.category;

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

        // Find the current category
        const category = categoriesData.find((c: Category) => c.slug === categorySlug);
        setCurrentCategory(category || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categorySlug]);

  const filteredPosts = posts.filter(post => {
    const category = categories.find(c => c.id === post.categoryId);
    return category?.slug === categorySlug;
  });

  const [featuredPost, ...otherPosts] = filteredPosts;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Hero />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <AdSlot position="header" className="mb-12" />

        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentCategory.name}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{currentCategory.description}</p>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No articles found</h2>
            <p className="text-gray-600">There are no published articles in this category yet.</p>
          </div>
        ) : (
          <>
            {featuredPost && (
              <div className="mb-12">
                <BlogCard
                  id={featuredPost.id}
                  title={featuredPost.title}
                  excerpt={featuredPost.excerpt}
                  category={currentCategory.name}
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
                  category={currentCategory.name}
                  author={{ name: post.authorName }}
                  publishedAt={new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                  readTime="5 min read"
                  image={post.featuredImage || '/placeholder.jpg'}
                />
              ))}
            </div>
          </>
        )}

        <div className="mb-12">
          <Newsletter />
        </div>

        <AdSlot position="footer" />
      </div>
    </div>
  );
}