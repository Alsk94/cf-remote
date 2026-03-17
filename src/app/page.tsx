'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Network, Shield, Settings, Zap, TrendingUp, Activity } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import StatusCard from '@/components/StatusCard';
import Button from '@/components/Button';
import PullToRefresh from '@/components/PullToRefresh';
import { listTunnels, listAccessApplications, listGatewayPolicies } from '@/services/cloudflare';

interface QuickStats {
  tunnels: { total: number; healthy: number };
  applications: { total: number; enabled: number };
  policies: { total: number; enabled: number };
}

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const [tunnels, apps, policies] = await Promise.all([
        listTunnels().catch(() => []),
        listAccessApplications().catch(() => []),
        listGatewayPolicies().catch(() => []),
      ]);

      setStats({
        tunnels: {
          total: tunnels.length,
          healthy: tunnels.filter(t => t.status === 'healthy').length,
        },
        applications: {
          total: apps.length,
          enabled: apps.filter(a => a.enabled).length,
        },
        policies: {
          total: policies.length,
          enabled: policies.filter(p => p.enabled).length,
        },
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen p-4 space-y-6">
        <div className="pt-2">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Cloudflare Zero Trust Control</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Network className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.tunnels.healthy || 0}</div>
            <div className="text-xs text-muted-foreground">Healthy Tunnels</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Shield className="w-6 h-6 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.applications.enabled || 0}</div>
            <div className="text-xs text-muted-foreground">Active Apps</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Settings className="w-6 h-6 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.policies.enabled || 0}</div>
            <div className="text-xs text-muted-foreground">Active Policies</div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-3">
            <StatusCard
              title="Manage Tunnels"
              subtitle={`${stats?.tunnels.total || 0} total tunnels`}
              icon={Network}
              onClick={() => router.push('/tunnels')}
            >
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1">
                  View All
                </Button>
                <Button size="sm" variant="ghost" className="flex-1" icon={Activity}>
                  Status
                </Button>
              </div>
            </StatusCard>

            <StatusCard
              title="Access Applications"
              subtitle={`${stats?.applications.total || 0} applications configured`}
              icon={Shield}
              onClick={() => router.push('/applications')}
            >
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1">
                  Manage
                </Button>
                <Button size="sm" variant="ghost" className="flex-1" icon={TrendingUp}>
                  Analytics
                </Button>
              </div>
            </StatusCard>

            <StatusCard
              title="Gateway Policies"
              subtitle={`${stats?.policies.total || 0} security rules active`}
              icon={Settings}
              onClick={() => router.push('/gateway')}
            >
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1">
                  Configure
                </Button>
                <Button size="sm" variant="ghost" className="flex-1" icon={Zap}>
                  Quick Toggle
                </Button>
              </div>
            </StatusCard>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Pro Tip</h3>
              <p className="text-sm text-muted-foreground">
                Pull down on any page to refresh data. All touch targets are optimized for mobile use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}
