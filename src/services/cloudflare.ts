import { getCredentials } from '@/lib/auth';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

export interface CloudflareTunnel {
  id: string;
  name: string;
  status: 'healthy' | 'down' | 'degraded';
  created_at: string;
  connections?: Array<{
    colo_name: string;
    is_pending_reconnect: boolean;
  }>;
}

export interface AccessApplication {
  id: string;
  name: string;
  domain: string;
  type: string;
  enabled: boolean;
  policies?: Array<{
    id: string;
    name: string;
    decision: string;
  }>;
}

export interface GatewayPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  action: string;
  filters?: string[];
  precedence: number;
}

class CloudflareAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'CloudflareAPIError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const credentials = getCredentials();
  
  if (!credentials) {
    throw new CloudflareAPIError('Not authenticated', 401);
  }

  const url = `${CF_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${credentials.apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new CloudflareAPIError(
      error.errors?.[0]?.message || 'API request failed',
      response.status
    );
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new CloudflareAPIError(
      data.errors?.[0]?.message || 'API request failed'
    );
  }

  return data.result;
}

export async function listTunnels(): Promise<CloudflareTunnel[]> {
  const credentials = getCredentials();
  if (!credentials) throw new CloudflareAPIError('Not authenticated', 401);
  
  return makeRequest<CloudflareTunnel[]>(
    `/accounts/${credentials.accountId}/cfd_tunnel`
  );
}

export async function getTunnelStatus(tunnelId: string): Promise<CloudflareTunnel> {
  const credentials = getCredentials();
  if (!credentials) throw new CloudflareAPIError('Not authenticated', 401);
  
  return makeRequest<CloudflareTunnel>(
    `/accounts/${credentials.accountId}/cfd_tunnel/${tunnelId}`
  );
}

export async function deleteTunnel(tunnelId: string): Promise<void> {
  const credentials = getCredentials();
  if (!credentials) throw new CloudflareAPIError('Not authenticated', 401);
  
  await makeRequest(
    `/accounts/${credentials.accountId}/cfd_tunnel/${tunnelId}`,
    { method: 'DELETE' }
  );
}

export async function listAccessApplications(): Promise<AccessApplication[]> {
  const credentials = getCredentials();
  if (!credentials) throw new CloudflareAPIError('Not authenticated', 401);
  
  return makeRequest<AccessApplication[]>(
    `/accounts/${credentials.accountId}/access/apps`
  );
}

export async function toggleAccessApplication(
  appId: string,
  enabled: boolean
): Promise<AccessApplication> {
  const credentials = getCredentials();
  if (!credentials) throw new CloudflareAPIError('Not authenticated', 401);
  
  const app = await makeRequest<AccessApplication>(
    `/accounts/${credentials.accountId}/access/apps/${appId}`
  );
  
  return makeRequest<AccessApplication>(
    `/accounts/${credentials.accountId}/access/apps/${appId}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        ...app,
        enabled,
      }),
    }
  );
}

export async function listGatewayPolicies(): Promise<GatewayPolicy[]> {
  const credentials = getCredentials();
  if (!credentials) throw new CloudflareAPIError('Not authenticated', 401);
  
  return makeRequest<GatewayPolicy[]>(
    `/accounts/${credentials.accountId}/gateway/rules`
  );
}

export async function toggleGatewayPolicy(
  policyId: string,
  enabled: boolean
): Promise<GatewayPolicy> {
  const credentials = getCredentials();
  if (!credentials) throw new CloudflareAPIError('Not authenticated', 401);
  
  const policy = await makeRequest<GatewayPolicy>(
    `/accounts/${credentials.accountId}/gateway/rules/${policyId}`
  );
  
  return makeRequest<GatewayPolicy>(
    `/accounts/${credentials.accountId}/gateway/rules/${policyId}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        ...policy,
        enabled,
      }),
    }
  );
}

export async function verifyCredentials(
  apiToken: string,
  accountId: string
): Promise<boolean> {
  try {
    const response = await fetch(`${CF_API_BASE}/user/tokens/verify`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return false;
    
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}
