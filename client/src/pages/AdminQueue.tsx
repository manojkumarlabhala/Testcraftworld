import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type QueueItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: string;
  createdAt: string;
};

export default function AdminQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<QueueItem | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const getToken = () => localStorage.getItem('admin_token') || localStorage.getItem('token');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch('/api/admin/queue', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items || []);
  setSelected({});
  setSelectAll(false);
    } catch (err) {
      console.error('Failed to fetch queue', err);
    } finally {
      setLoading(false);
    }
  };

  const publish = async (id: string) => {
    setPublishing(id);
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`/api/admin/queue/publish/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        await fetchQueue();
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Publish failed: ' + (err?.error || res.statusText));
      }
    } catch (err) {
      console.error('Publish error', err);
      alert('Publish error');
    } finally {
      setPublishing(null);
    }
  };

  const bulkAction = async (action: 'publish'|'decline') => {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (ids.length === 0) return alert('Select at least one item');
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`/api/admin/queue/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        await fetchQueue();
      } else {
        alert('Bulk action failed');
      }
    } catch (err) {
      console.error('Bulk action error', err);
      alert('Bulk action error');
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Queue</h1>
            <p className="text-sm text-gray-600">Review AI-generated posts and publish when ready</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchQueue}>Refresh</Button>
            <Button onClick={()=>bulkAction('publish')} variant="secondary">Publish Selected</Button>
            <Button onClick={()=>bulkAction('decline')} variant="destructive">Decline Selected</Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.length === 0 && <div className="p-6 bg-white rounded shadow">No queued items</div>}
            <div className="flex items-center gap-4">
              <input type="checkbox" checked={selectAll} onChange={(e)=>{ const next = e.target.checked; setSelectAll(next); const map: Record<string, boolean> = {}; if(next){ items.forEach(i=>map[i.id]=true);} setSelected(map); }} />
              <div className="flex-1">
                {items.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>{item.title}</div>
                    <Badge>{item.status}</Badge>
                  </CardTitle>
                  <CardDescription>{new Date(item.createdAt).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-gray-700 whitespace-pre-wrap">{item.excerpt}</p>
                  <div className="flex gap-2 items-center">
                    <input type="checkbox" checked={!!selected[item.id]} onChange={(e) => setSelected(s => ({ ...s, [item.id]: e.target.checked }))} />
                    <Button onClick={() => { setPreviewItem(item); setPreviewOpen(true); }}>Preview</Button>
                    <Button variant="secondary" onClick={() => publish(item.id)} disabled={publishing === item.id}>
                      {publishing === item.id ? 'Publishing...' : 'Publish'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
  </div>
  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{previewItem?.title}</DialogTitle>
        </DialogHeader>
        <div className="prose max-w-none whitespace-pre-wrap">
          {previewItem?.content}
        </div>
        <div className="mt-4">
          <Button onClick={() => previewItem && publish(previewItem.id)} variant="secondary">Publish</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
