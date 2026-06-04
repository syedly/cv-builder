'use client';

import { useState, useEffect } from 'react';
import { Key, Shield, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface BYOKModalProps {
  open: boolean;
  onClose: () => void;
}

export function BYOKModal({ open, onClose }: BYOKModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [hasByok, setHasByok] = useState(false);
  const [freeTries, setFreeTries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      fetch('/api/byok/status')
        .then((r) => r.json())
        .then((d) => { setHasByok(d.hasByok); setFreeTries(d.freeTries); })
        .catch(() => {});
    }
  }, [open]);

  const handleSave = async () => {
    if (!apiKey.startsWith('sk-')) {
      setError('API key must start with sk-');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/byok/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save API key');
      } else {
        setHasByok(true);
        setApiKey('');
        setSuccess('API key saved successfully! You now have unlimited access.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await fetch('/api/byok/remove', { method: 'DELETE' });
      setHasByok(false);
      setSuccess('API key removed.');
    } catch {
      setError('Failed to remove key');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="OpenAI API Key">
      <div className="space-y-4">
        {/* Status */}
        <div className={`flex items-center gap-3 p-4 rounded-xl ${hasByok ? 'bg-emerald-50 border border-emerald-200' : freeTries > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
          {hasByok ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Your API key is active</p>
                <p className="text-xs text-emerald-600">Unlimited CV generations</p>
              </div>
            </>
          ) : freeTries > 0 ? (
            <>
              <Key className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">{freeTries} free generation{freeTries !== 1 ? 's' : ''} remaining</p>
                <p className="text-xs text-blue-600">Add your key for unlimited access</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Free generations used up</p>
                <p className="text-xs text-amber-600">Add your OpenAI API key to continue</p>
              </div>
            </>
          )}
        </div>

        {!hasByok ? (
          <div className="space-y-3">
            <Input
              label="OpenAI API Key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              error={error}
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5" />
              <span>Your key is encrypted with AES-256 and never shared</span>
            </div>
            {success && (
              <p className="text-sm text-emerald-600 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {success}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} loading={loading} className="flex-1">
                Save & Activate
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {success && (
              <p className="text-sm text-slate-600">{success}</p>
            )}
            <p className="text-sm text-slate-600">
              Your API key is securely stored and encrypted. Remove it to go back to the free tier.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} className="flex-1">Close</Button>
              <Button variant="danger" onClick={handleRemove} loading={removing} className="flex-1">
                <Trash2 className="w-4 h-4" />
                Remove Key
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
