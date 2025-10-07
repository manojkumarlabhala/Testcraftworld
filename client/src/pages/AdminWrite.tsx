import { useState, useEffect } from "react";

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
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Write Post</h1>
      <form className="mt-4 space-y-4" onSubmit={submit}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug" className="w-full p-2 border rounded" />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2 border rounded">
          <option value="">-- Select Category --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="Featured Image URL" className="w-full p-2 border rounded" />
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Excerpt (SEO)" className="w-full p-2 border rounded" />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content (HTML or markdown)" className="w-full p-2 border rounded h-48" />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-white rounded">Publish</button>
        </div>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
