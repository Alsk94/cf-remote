'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ToggleLeft, ToggleRight, Filter } from 'lucide-react';
import PullToRefresh from '@/components/PullToRefresh';
import SearchBar from '@/components/SearchBar';
import StatusCard from '@/components/StatusCard';
import Button from '@/components/Button';
import { getCredentials } from '@/lib/auth';
import { listGatewayPolicies, toggleGatewayPolicy, type GatewayPolicy } from '@/services/cloudflare';

export default function GatewayPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<GatewayPolicy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<GatewayPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError('');
      
      const creds = getCredentials();
      if (!creds) {
        router.push('/login');
        return;
      }

      const data = await listGatewayPolicies();
      setPolicies(data);
      setFilteredPolicies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPolicies(policies);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPolicies(
        policies.filter(
          (policy) =>
            policy.name.toLowerCase().includes(query) ||
            (policy.description && policy.description.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, policies]);

  const handleToggle = async (policyId: string, currentEnabled: boolean) => {
    try {
      setToggling(policyId);
      const creds = getCredentials();
      if (!creds) {
        router.push('/login');
        return;
      }

      await toggleGatewayPolicy(policyId, !currentEnabled);
      
      // Update local state
      setPolicies(pols =>
        pols.map(pol =>
          pol.id === policyId ? { ...pol, enabled: !currentEnabled } : pol
        )
      );
      setFilteredPolicies(pols =>
        pols.map(pol =>
          pol.id === policyId ? { ...pol, enabled: !currentEnabled } : pol
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle policy');
    } finally {
      setToggling(null);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 100) return 'text-red-400';
    if (priority <= 500) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <PullToRefresh onRefresh={loadPolicies}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8" />
              Gateway Policies
            </h1>
            <p className="text-gray-400">Manage security filters and rules</p>
          </div>

          <div className="mb-6">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search policies..."
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {loading && policies.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading policies...</p>
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No policies match your search' : 'No policies found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPolicies.map((policy) => (
                <StatusCard
                  key={policy.id}
                  title={policy.name}
                  subtitle={policy.description || 'No description'}
                  status={policy.enabled ? 'active' : 'inactive'}
                  icon={policy.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                >
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-medium ${policy.enabled ? 'text-green-400' : 'text-yellow-400'}`}>
                        {policy.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Action:</span>
                      <span className="text-gray-300 capitalize">{policy.action}</span>
                    </div>
                    {policy.precedence !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Priority:</span>
                        <span className={`font-medium ${getPriorityColor(policy.precedence)}`}>
                          {policy.precedence}
                        </span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        variant={policy.enabled ? 'secondary' : 'primary'}
                        size="sm"
                        icon={policy.enabled ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        onClick={() => handleToggle(policy.id, policy.enabled)}
                        loading={toggling === policy.id}
                      >
                        {policy.enabled ? 'Disable' : 'Enable'}
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
