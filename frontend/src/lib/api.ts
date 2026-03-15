const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export interface HumanIdentity {
  id: string;
  wallet_address: string;
  verification_type: string;
  verified: boolean;
  verification_expiry: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  name: string;
  owner_id: string;
  public_key: string;
  did: string | null;
  capabilities: string | null;
  registered_on_subnet: boolean;
  reputation_score: number;
  trust_score: number;
  total_actions: number;
  created_at: string;
}

export interface AgentCreated {
  agent: Agent;
  private_key: string;
}

export interface AgentAction {
  id: string;
  agent_id: string;
  action_type: string;
  intent: string;
  result: string | null;
  signature: string;
  verified: boolean;
  created_at: string;
}

export interface ReputationEvent {
  id: string;
  agent_id: string;
  event_type: string;
  score_delta: number;
  reason: string | null;
  miner_uid: number | null;
  created_at: string;
}

export interface ReputationSummary {
  agent_id: string;
  reputation_score: number;
  trust_score: number;
  total_actions: number;
  recent_events: ReputationEvent[];
}

export interface SubnetRegistration {
  id: string;
  agent_id: string;
  netuid: number;
  identity_hash: string;
  status: string;
  verification_count: number;
  created_at: string;
}

export interface SubnetStatus {
  connected: boolean;
  network: string;
  netuid: number;
  block_height: number | null;
  num_neurons: number | null;
}

export interface DashboardStats {
  total_identities: number;
  total_agents: number;
  total_actions: number;
  verified_identities: number;
  registered_agents: number;
  avg_reputation: number;
}

export const api = {
  verifyIdentity: (wallet_address: string, verification_type: string = "gov-id") =>
    request<HumanIdentity>("/verification/verify", {
      method: "POST",
      body: JSON.stringify({ wallet_address, verification_type }),
    }),

  verifyIdentityDemo: (wallet_address: string, verification_type: string = "gov-id") =>
    request<HumanIdentity>("/verification/verify-demo", {
      method: "POST",
      body: JSON.stringify({ wallet_address, verification_type }),
    }),

  getVerificationStatus: (wallet_address: string) =>
    request<HumanIdentity>(`/verification/status/${wallet_address}`),

  createAgent: (name: string, owner_wallet_address: string, capabilities?: string[]) =>
    request<AgentCreated>("/agents/", {
      method: "POST",
      body: JSON.stringify({ name, owner_wallet_address, capabilities }),
    }),

  getAgent: (agent_id: string) =>
    request<Agent>(`/agents/${agent_id}`),

  getAgentsByOwner: (wallet_address: string) =>
    request<Agent[]>(`/agents/by-owner/${wallet_address}`),

  executeAction: (data: {
    agent_id: string;
    private_key: string;
    action_type: string;
    intent: string;
    url?: string;
  }) =>
    request<AgentAction>("/actions/execute", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getActions: (agent_id: string) =>
    request<AgentAction[]>(`/actions/${agent_id}`),

  getActionDetail: (action_id: string) =>
    request<AgentAction>(`/actions/detail/${action_id}`),

  registerOnSubnet: (agent_id: string) =>
    request<SubnetRegistration>("/subnet/register", {
      method: "POST",
      body: JSON.stringify({ agent_id }),
    }),

  getSubnetRegistration: (agent_id: string) =>
    request<SubnetRegistration>(`/subnet/registration/${agent_id}`),

  getSubnetStatus: () =>
    request<SubnetStatus>("/subnet/status"),

  getReputation: (agent_id: string) =>
    request<ReputationSummary>(`/reputation/${agent_id}`),

  getLeaderboard: () =>
    request<Agent[]>("/reputation/leaderboard"),

  getStats: () =>
    request<DashboardStats>("/stats/"),
};
