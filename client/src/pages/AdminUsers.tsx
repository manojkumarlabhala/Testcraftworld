import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/users', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (res.ok) {
      setUsers(await res.json());
    } else {
      setMessage('Failed to load users');
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (res.ok) {
      setMessage('Deleted');
      load();
    } else {
      setMessage('Delete failed');
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Admin Users</h1>
      {message && <p className="mt-2">{message}</p>}
      <div className="mt-4">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left border-b"><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="py-2">{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><button onClick={() => remove(u.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
