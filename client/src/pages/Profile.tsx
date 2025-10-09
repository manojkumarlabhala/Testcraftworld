import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setDisplayName(parsed.displayName || parsed.username || '');
      setEmail(parsed.email || '');
    }
  }, []);

  async function refreshUserFromServer() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setDisplayName(data.user.displayName || data.user.username || '');
      setEmail(data.user.email || '');
    } catch (err: any) {
      setMessage(err.message || 'Error fetching user');
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName, email }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setMessage('Profile updated');
      await refreshUserFromServer();
    } catch (err: any) {
      setMessage(err.message || 'Failed to update');
    }
  }

  async function becomeAuthor() {
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/request-author', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessage(data.message || 'Role updated');
      await refreshUserFromServer();
    } catch (err: any) {
      setMessage(err.message || 'Failed');
    }
  }

  async function startReading() {
    // Toggles a 'reader' role (no-op if already reader)
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/start-reading', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessage(data.message || 'You are now a reader');
      await refreshUserFromServer();
    } catch (err: any) {
      setMessage(err.message || 'Failed');
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view your profile. <a href="/login" className="text-blue-600">Sign in</a></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your profile and role</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">Save</Button>
              <Button type="button" onClick={() => setLocation('/')}>Back</Button>
            </div>
          </form>

          <div className="mt-6">
            <p className="mb-2">Role: <strong>{user.role}</strong></p>
            {user.role !== 'author' && <Button onClick={becomeAuthor} className="mr-2">Become author</Button>}
            {user.role !== 'reader' && <Button onClick={startReading}>Start reading</Button>}
          </div>

          {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
