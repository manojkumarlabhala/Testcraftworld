import { useState, useEffect, lazy, Suspense } from "react";
const RichTextEditor = lazy(() => import("@/components/RichTextEditor"));
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AdminWrite() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => setCategories([]));
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    const body = { title, slug, content, excerpt, featuredImage, categoryId, published: true };
    const token = localStorage.getItem('admin_token');
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch("/api/admin/create-post", { method: "POST", headers, body: JSON.stringify(body) });
    if (res.ok) {
      setMessage("Post created");
    } else {
      const err = await res.json();
      setMessage("Error: " + JSON.stringify(err));
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Write New Post</h1>
        <p className="text-gray-600 mb-8">Create engaging content with our rich text editor featuring markdown support, formatting tools, and live preview.</p>
        
        <form className="space-y-6" onSubmit={submit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Post Title</label>
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Enter an engaging title..." 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL Slug</label>
              <input 
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
                placeholder="url-friendly-slug" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Featured Image URL</label>
              <input 
                value={featuredImage} 
                onChange={e => setFeaturedImage(e.target.value)} 
                placeholder="https://example.com/image.jpg" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SEO Excerpt</label>
            <textarea 
              value={excerpt} 
              onChange={e => setExcerpt(e.target.value)} 
              placeholder="Write a compelling excerpt for SEO and social media sharing..." 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none" 
              maxLength={160}
            />
            <p className="text-sm text-gray-500 mt-1">{excerpt.length}/160 characters</p>
          </div>

          <Separator />

          <div>
            <label className="block text-sm font-medium mb-4">Post Content</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <Suspense fallback={<div className="p-6">Loading editor...</div>}>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder={`Start writing your amazing content here...\n\nYou can use:\n- **Bold text** and *italic text*\n- # Headings and ## Subheadings\n- [Links](https://example.com)\n- Bullet points and numbered lists\n- > Blockquotes for emphasis\n- \`Code snippets\` and code blocks\n- And much more!`}
                  height={500}
                />
              </Suspense>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>💡 <strong>Pro Tips:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Use ## for main headings and ### for subheadings to improve SEO</li>
                <li>Include **bold text** for important keywords and phrases</li>
                <li>Add bullet points and numbered lists for better readability</li>
                <li>Include relevant links to authoritative sources</li>
                <li>Aim for 800+ words for better search engine ranking</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>💡 Your content will be automatically formatted with proper headings, bold text, and bullet points when published.</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline">Save Draft</Button>
              <Button type="submit" className="px-8">
                🚀 Publish Post
              </Button>
            </div>
          </div>
        </form>
        
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message}
          </div>
        )}
      </Card>
    </div>
  );
}
