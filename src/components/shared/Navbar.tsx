'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { FileText, LayoutDashboard, Clock, LogOut, Menu, X, Key, Sparkles, User } from 'lucide-react';
import { BYOKModal } from './BYOKModal';
import { clsx } from 'clsx';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [byokOpen, setByokOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/builder', label: 'New CV', icon: Sparkles },
    { href: '/history', label: 'History', icon: Clock },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block">AI CV Builder</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setByokOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Manage API Key"
              >
                <Key className="w-4 h-4" />
                <span className="hidden lg:block">API Key</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-100">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-900">{session?.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[120px]">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <button
                onClick={() => { setByokOpen(true); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 w-full"
              >
                <Key className="w-4 h-4" />
                Manage API Key
              </button>
              <div className="pt-2 border-t border-slate-100">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-slate-900">{session?.user?.name}</p>
                  <p className="text-xs text-slate-500">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <BYOKModal open={byokOpen} onClose={() => setByokOpen(false)} />
    </>
  );
}
