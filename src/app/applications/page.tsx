'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import PullToRefresh from '@/components/PullToRefresh';
import SearchBar from '@/components/SearchBar';
import StatusCard from '@/components/StatusCard';
import Button from '@/components/Button';
import { getCredentials } from '@/lib/auth';
import { listAccessApplications, toggleAccessApplication, type AccessApplication } from '@/services/cloudflare';

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<AccessApplication[]>([]);
  const [filteredApps, setFilteredApps] = useState<AccessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const creds = getCredentials();
      if (!creds) {
        router.push('/login');
        return;
      }

      const data = await listAccessApplications();
      setApplications(data);
      setFilteredApps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredApps(applications);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredApps(
        applications.filter(
          (app) =>
            app.name.toLowerCase().includes(query) ||
            app.domain.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, applications]);

  const handleToggle = async (appId: string, currentEnabled: boolean) => {
    try {
      setToggling(appId);
      const creds = getCredentials();
      if (!creds) {
        router.push('/login');
        return;
      }

      await toggleAccessApplication(appId, !currentEnabled);
      
      // Update local state
      setApplications(apps =>
        apps.map(app =>
          app.id === appId ? { ...app, enabled: !currentEnabled } : app
        )
      );
      setFilteredApps(apps =>
        apps.map(app =>
          app.id === appId ? { ...app, enabled: !currentEnabled } : app
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle application');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <PullToRefresh onRefresh={loadApplications}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Access Applications
            </h1>
            <p className="text-gray-400">Manage Zero Trust application access</p>
          </div>

          <div className="mb-6">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search applications..."
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {loading && applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No applications match your search' : 'No applications found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => (
                <StatusCard
                  key={app.id}
                  title={app.name}
                  subtitle={app.domain}
                  status={app.enabled ? 'active' : 'inactive'}
                  icon={app.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                >
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-medium ${app.enabled ? 'text-green-400' : 'text-yellow-400'}`}>
                        {app.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-gray-300">{app.type || 'self_hosted'}</span>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant={app.enabled ? 'secondary' : 'primary'}
                        size="sm"
                        icon={app.enabled ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        onClick={() => handleToggle(app.id, app.enabled)}
                        loading={toggling === app.id}
                      >
                        {app.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </StatusCard>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
