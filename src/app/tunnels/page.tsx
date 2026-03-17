'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import PullToRefresh from '@/components/PullToRefresh';
import SearchBar from '@/components/SearchBar';
import StatusCard from '@/components/StatusCard';
import Button from '@/components/Button';
import { getCredentials } from '@/lib/auth';
import { listTunnels, deleteTunnel, type CloudflareTunnel } from '@/services/cloudflare';

export default function TunnelsPage() {
  const router = useRouter();
  const [tunnels, setTunnels] = useState<CloudflareTunnel[]>([]);
  const [filteredTunnels, setFilteredTunnels] = useState<CloudflareTunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const loadTunnels = async () => {
    try {
      setLoading(true);
      setError('');
      
      const creds = getCredentials();
      if (!creds) {
        router.push('/login');
        return;
      }

      const data = await listTunnels();
      setTunnels(data);
      setFilteredTunnels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tunnels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTunnels();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTunnels(tunnels);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTunnels(
        tunnels.filter(
          (tunnel) =>
            tunnel.name.toLowerCase().includes(query) ||
            tunnel.id.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, tunnels]);

  const handleDelete = async (tunnelId: string, tunnelName: string) => {
    if (!confirm(`Are you sure you want to delete tunnel "${tunnelName}"?`)) {
      return;
    }

    try {
      const creds = getCredentials();
      if (!creds) {
        router.push('/login');
        return;
      }

      await deleteTunnel(tunnelId);
      await loadTunnels();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete tunnel');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return CheckCircle;
      case 'down':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'healthy';
      case 'down':
        return 'down';
      default:
        return 'degraded';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <PullToRefresh onRefresh={loadTunnels}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-8 h-8" />
              Cloudflare Tunnels
            </h1>
            <p className="text-gray-400">Manage your Cloudflare Tunnel connections</p>
          </div>

          <div className="mb-6">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search tunnels..."
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {loading && tunnels.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading tunnels...</p>
            </div>
          ) : filteredTunnels.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No tunnels match your search' : 'No tunnels found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTunnels.map((tunnel) => (
                <StatusCard
                  key={tunnel.id}
                  title={tunnel.name}
                  subtitle={`ID: ${tunnel.id.substring(0, 8)}...`}
                  status={getStatusColor(tunnel.status)}
                  icon={getStatusIcon(tunnel.status)}
                >
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-gray-300">
                        {new Date(tunnel.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {tunnel.connections && tunnel.connections.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Connections:</span>
                        <span className="text-gray-300">{tunnel.connections.length}</span>
                      </div>
                    )}
                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(tunnel.id, tunnel.name)}
                      >
                        Delete
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
