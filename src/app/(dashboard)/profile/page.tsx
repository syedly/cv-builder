import { ProfileForm } from '@/components/profile/ProfileForm';
import { User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
          <p className="text-slate-500 text-sm">Fill in your details once — AI uses them for every CV you generate</p>
        </div>
      </div>
      <ProfileForm />
    </div>
  );
}
