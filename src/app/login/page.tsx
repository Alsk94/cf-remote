'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, User } from 'lucide-react';
import Button from '@/components/Button';
import { saveCredentials } from '@/lib/auth';
import { verifyCredentials } from '@/services/cloudflare';

export default function LoginPage() {
  const router = useRouter();
  const [apiToken, setApiToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isValid = await verifyCredentials(apiToken, accountId);
      
      if (!isValid) {
        setError('Invalid credentials. Please check your API token and Account ID.');
        setLoading(false);
        return;
      }

      saveCredentials({ apiToken, accountId });
      router.push('/');
    } catch (err) {
      setError('Failed to verify credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-background to-purple-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">CF Remote Control</h1>
          <p className="text-muted-foreground">
            Manage your Cloudflare Zero Trust environment
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4" />
                  API Token
                </div>
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Cloudflare API token"
                className="w-full h-12 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Account ID
                </div>
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter your Cloudflare Account ID"
                className="w-full h-12 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Your credentials are encrypted and stored locally on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
