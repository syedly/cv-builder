import { Metadata } from 'next';
import { FileText, Sparkles } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Create Account — AI CV Builder' };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-1">Get 3 free ATS-optimized CVs</p>
        </div>

        {/* Features */}
        <div className="flex justify-center gap-4 mb-6">
          {['3 Free CVs', 'ATS-Optimized', 'PDF & DOCX'].map((f) => (
            <div key={f} className="flex items-center gap-1 text-xs text-slate-600">
              <Sparkles className="w-3 h-3 text-blue-500" />
              {f}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
