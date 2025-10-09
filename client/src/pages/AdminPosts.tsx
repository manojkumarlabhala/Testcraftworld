import { useEffect, useState } from "react";

export default function AdminPosts(){
  const [posts,setPosts]=useState<any[]>([]);
  const [msg,setMsg]=useState<string|null>(null);

  async function load(){
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/posts',{headers: token?{Authorization:`Bearer ${token}`}:{}});
    if(res.ok) setPosts(await res.json()); else setMsg('Failed to load');
  }

  useEffect(()=>{load()},[]);

  async function remove(id:string){
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/posts/${id}`,{method:'DELETE', headers: token?{Authorization:`Bearer ${token}`}:{}});
    if(res.ok) { setMsg('Deleted'); load(); } else setMsg('Delete failed');
  }

  async function revalidate(id:string){
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/posts/${id}/validate-source`,{method:'POST', headers: token?{Authorization:`Bearer ${token}`}:{} });
    if(res.ok){
      const data = await res.json();
      setMsg(`Validation result: ${data.ok ? 'OK' : 'Failed'}${data.reason ? ' - '+data.reason : ''}`);
      load();
    } else {
      setMsg('Validation request failed');
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Admin Posts</h1>
      {msg && <p>{msg}</p>}
      <div className="mt-4">
        <ul className="space-y-3">
          {posts.map(p=> (
            <li key={p.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-muted-foreground">{p.slug}</div>
                {p.sourceLink && (
                  <div className="text-sm mt-1">
                    Source: <a className="text-blue-500 hover:underline" href={p.sourceLink} target="_blank" rel="noopener noreferrer">{p.sourceLink}</a>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <a className="px-3 py-1 bg-primary text-white rounded" href={`/post/${p.id}`}>View</a>
                <a className="px-3 py-1 bg-sky-600 text-white rounded" href={`/admin/posts/${p.id}`}>Admin</a>
                <button onClick={()=>revalidate(p.id)} className="px-3 py-1 bg-amber-500 text-white rounded">Re-validate Source</button>
                <button onClick={()=>remove(p.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
