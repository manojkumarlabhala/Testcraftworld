import { useState } from 'react';
import { useLocation } from 'wouter';

export default function AdminLogin(){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState<string|null>(null);
  const [, setLocation] = useLocation();

  async function submit(e:any){
    e.preventDefault();
    const res = await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
    if(res.ok){
      const j = await res.json();
  localStorage.setItem('admin_token', j.token);
  setLocation('/admin');
    } else {
      const err = await res.json(); setMsg(err.error||'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-xl font-bold">Admin Login</h1>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" className="w-full p-2 border rounded" />
        <div className="flex gap-2"><button className="px-4 py-2 bg-primary text-white rounded">Login</button></div>
      </form>
      {msg && <p className="mt-2 text-red-600">{msg}</p>}
    </div>
  )
}
