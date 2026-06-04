'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after registration
      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={form.name}
        onChange={set('name')}
        icon={<User className="w-4 h-4" />}
        required
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={set('email')}
        icon={<Mail className="w-4 h-4" />}
        required
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 8 characters"
          value={form.password}
          onChange={set('password')}
          icon={<Lock className="w-4 h-4" />}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Repeat password"
        value={form.confirm}
        onChange={set('confirm')}
        icon={<Lock className="w-4 h-4" />}
        required
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Create Account — 3 Free CVs
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
