import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';

export default function AdminPostDetail(){
  const [, params] = useRoute('/admin/posts/:id');
  const id = (params as any)?.id as string | undefined;
  const [post, setPost] = useState<any|null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [msg, setMsg] = useState<string|null>(null);

  async function load(){
    if(!id) return;
    const token = localStorage.getItem('admin_token');
    const postRes = await fetch(`/api/posts/${id}`);
    if(postRes.ok) setPost(await postRes.json());
    const logsRes = await fetch(`/api/admin/posts/${id}/validation-logs`, { headers: token?{Authorization:`Bearer ${token}`}:{} });
    if(logsRes.ok) setLogs(await logsRes.json());
  }

  useEffect(()=>{ if(id) load(); },[id]);

  async function revalidate(){
    if(!id) return;
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/posts/${id}/validate-source`, { method: 'POST', headers: token?{Authorization:`Bearer ${token}`}:{} });
    if(res.ok){ const d = await res.json(); setMsg(`Validation: ${d.ok? 'OK':'Failed'}${d.reason? ' - '+d.reason : ''}`); load(); }
    else setMsg('Validation request failed');
  }

  async function forcePublish(){
    if(!id) return;
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/posts/${id}/force-publish`, { method: 'POST', headers: token?{Authorization:`Bearer ${token}`}:{} });
    if(res.ok){ setMsg('Post force-published'); load(); } else setMsg('Publish failed');
  }
  useEffect(()=>{ load() },[]);

  if(!post) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Admin: {post.title}</h1>
      {msg && <p className="mt-2">{msg}</p>}
      <div className="mt-4">
        <div><strong>Slug:</strong> {post.slug}</div>
        {post.sourceLink && (<div className="mt-2">Source: <a href={post.sourceLink} target="_blank" rel="noreferrer" className="text-blue-600">{post.sourceLink}</a></div>)}
        <div className="mt-4 flex gap-2">
          <button onClick={revalidate} className="px-3 py-1 bg-amber-500 text-white rounded">Re-validate</button>
          <button onClick={forcePublish} className="px-3 py-1 bg-green-600 text-white rounded">Force Publish</button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Validation Logs</h2>
          <ul className="mt-3 space-y-2">
            {logs.map(l => (
              <li key={l.id} className="p-3 border rounded">
                <div><strong>{l.ok ? 'OK' : 'Failed'}</strong> — {l.reason || 'No reason'}</div>
                <div className="text-sm text-muted-foreground">Checked at: {new Date(l.checkedAt || l.checked_at).toLocaleString()} by {l.checkedBy || l.checked_by || 'system'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
