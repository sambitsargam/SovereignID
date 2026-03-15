"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Bot,
  Zap,
  Trophy,
  ArrowLeft,
  Shield,
  Fingerprint,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Activity,
  Star,
  Globe,
  KeyRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  api,
  type HumanIdentity,
  type Agent,
  type AgentCreated,
  type AgentAction,
  type ReputationSummary,
  type DashboardStats,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncate(str: string, len = 16): string {
  if (!str) return "";
  if (str.length <= len) return str;
  return `${str.slice(0, len / 2)}...${str.slice(-len / 2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

function trustLabel(score: number): string {
  if (score >= 0.8) return "Trusted";
  if (score >= 0.5) return "Moderate";
  return "Low";
}

function trustVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 0.8) return "success";
  if (score >= 0.5) return "warning";
  return "destructive";
}

// ---------------------------------------------------------------------------
// Shared animation variants
// ---------------------------------------------------------------------------

const tabContentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { duration: 0.2 } },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 backdrop-blur-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-lg font-semibold text-zinc-100">{value}</p>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7">
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-zinc-400" />
      )}
    </Button>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-600/10 p-4"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <div className="flex-1">
        <p className="text-sm text-red-300">{message}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onDismiss} className="text-red-400 hover:text-red-300">
        Dismiss
      </Button>
    </motion.div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className ?? "h-4 w-4"}`} />;
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  // ---- Global state ---------------------------------------------------------
  const [walletAddress, setWalletAddress] = useState("");
  const [identity, setIdentity] = useState<HumanIdentity | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [privateKey, setPrivateKey] = useState("");
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState("identity");

  // ---- Identity state -------------------------------------------------------
  const [verificationType, setVerificationType] = useState("gov-id");
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // ---- Agent state ----------------------------------------------------------
  const [agentName, setAgentName] = useState("");
  const [agentCapabilities, setAgentCapabilities] = useState("");
  const [createdAgent, setCreatedAgent] = useState<AgentCreated | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentListLoading, setAgentListLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [registeringAgentId, setRegisteringAgentId] = useState<string | null>(null);

  // ---- Action state ---------------------------------------------------------
  const [actionAgentId, setActionAgentId] = useState("");
  const [actionType, setActionType] = useState("web_search");
  const [actionIntent, setActionIntent] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [actionResult, setActionResult] = useState<AgentAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionHistoryLoading, setActionHistoryLoading] = useState(false);

  // ---- Reputation state -----------------------------------------------------
  const [reputationAgentId, setReputationAgentId] = useState("");
  const [reputation, setReputation] = useState<ReputationSummary | null>(null);
  const [reputationLoading, setReputationLoading] = useState(false);
  const [reputationError, setReputationError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<Agent[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // ---- Fetch global stats on mount ------------------------------------------
  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  // ---- Fetch leaderboard when reputation tab is active ----------------------
  useEffect(() => {
    if (activeTab === "reputation") {
      setLeaderboardLoading(true);
      api
        .getLeaderboard()
        .then(setLeaderboard)
        .catch(() => {})
        .finally(() => setLeaderboardLoading(false));
    }
  }, [activeTab]);

  // ---- Fetch agents when wallet is verified and agents tab opened -----------
  const fetchAgents = useCallback(
    async (wallet: string) => {
      if (!wallet) return;
      setAgentListLoading(true);
      try {
        const list = await api.getAgentsByOwner(wallet);
        setAgents(list);
      } catch {
        // Silently handle - agents list may be empty
        setAgents([]);
      } finally {
        setAgentListLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activeTab === "agents" && walletAddress) {
      fetchAgents(walletAddress);
    }
  }, [activeTab, walletAddress, fetchAgents]);

  // ---- Fetch action history when an agent is selected in actions tab --------
  useEffect(() => {
    if (activeTab === "actions" && actionAgentId) {
      setActionHistoryLoading(true);
      api
        .getActions(actionAgentId)
        .then(setActions)
        .catch(() => setActions([]))
        .finally(() => setActionHistoryLoading(false));
    }
  }, [activeTab, actionAgentId]);

  // ---- Fetch reputation when agent selected in reputation tab ---------------
  useEffect(() => {
    if (activeTab === "reputation" && reputationAgentId) {
      setReputationLoading(true);
      setReputationError(null);
      api
        .getReputation(reputationAgentId)
        .then(setReputation)
        .catch((err) => {
          setReputation(null);
          setReputationError(err instanceof Error ? err.message : "Failed to fetch reputation");
        })
        .finally(() => setReputationLoading(false));
    }
  }, [activeTab, reputationAgentId]);

  // ---- Handlers -------------------------------------------------------------

  async function handleVerify(demo: boolean) {
    if (!walletAddress.trim()) {
      setIdentityError("Please enter a wallet address");
      return;
    }
    setIdentityLoading(true);
    setIdentityError(null);
    try {
      const fn = demo ? api.verifyIdentityDemo : api.verifyIdentity;
      const result = await fn(walletAddress.trim(), verificationType);
      setIdentity(result);
      // Refresh stats after verification
      api.getStats().then(setStats).catch(() => {});
    } catch (err) {
      setIdentityError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIdentityLoading(false);
    }
  }

  async function handleCreateAgent() {
    if (!agentName.trim()) {
      setAgentError("Please enter an agent name");
      return;
    }
    if (!walletAddress.trim()) {
      setAgentError("Please verify your identity first (set wallet address in Identity tab)");
      return;
    }
    setAgentLoading(true);
    setAgentError(null);
    setCreatedAgent(null);
    try {
      const capabilities = agentCapabilities
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const result = await api.createAgent(
        agentName.trim(),
        walletAddress.trim(),
        capabilities.length > 0 ? capabilities : undefined
      );
      setCreatedAgent(result);
      setAgentName("");
      setAgentCapabilities("");
      // Refresh agents list
      fetchAgents(walletAddress);
      // Refresh stats
      api.getStats().then(setStats).catch(() => {});
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Failed to create agent");
    } finally {
      setAgentLoading(false);
    }
  }

  async function handleRegisterOnSubnet(agentId: string) {
    setRegisteringAgentId(agentId);
    setAgentError(null);
    try {
      await api.registerOnSubnet(agentId);
      // Refresh agents list to show updated status
      if (walletAddress) {
        await fetchAgents(walletAddress);
      }
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : "Subnet registration failed");
    } finally {
      setRegisteringAgentId(null);
    }
  }

  async function handleExecuteAction() {
    if (!actionAgentId) {
      setActionError("Please select an agent");
      return;
    }
    if (!privateKey.trim()) {
      setActionError("Please enter the agent's private key");
      return;
    }
    if (!actionIntent.trim()) {
      setActionError("Please enter an intent");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    setActionResult(null);
    try {
      const result = await api.executeAction({
        agent_id: actionAgentId,
        private_key: privateKey.trim(),
        action_type: actionType,
        intent: actionIntent.trim(),
        url: actionUrl.trim() || undefined,
      });
      setActionResult(result);
      // Refresh action history
      const history = await api.getActions(actionAgentId);
      setActions(history);
      // Refresh stats
      api.getStats().then(setStats).catch(() => {});
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action execution failed");
    } finally {
      setActionLoading(false);
    }
  }

  // ---- Render ---------------------------------------------------------------

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ------------------------------------------------------------------ */}
      {/* Top Bar                                                            */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-bold text-zinc-100">
              Sovereign<span className="text-emerald-400">ID</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Stats bar */}
        <div className="border-t border-zinc-800/50 bg-zinc-900/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-3 sm:px-6 md:grid-cols-4 lg:px-8">
            <StatCard
              label="Total Identities"
              value={stats?.total_identities ?? "--"}
              icon={<Fingerprint className="h-4 w-4" />}
            />
            <StatCard
              label="Total Agents"
              value={stats?.total_agents ?? "--"}
              icon={<Bot className="h-4 w-4" />}
            />
            <StatCard
              label="Total Actions"
              value={stats?.total_actions ?? "--"}
              icon={<Activity className="h-4 w-4" />}
            />
            <StatCard
              label="Avg Reputation"
              value={
                stats?.avg_reputation != null
                  ? stats.avg_reputation.toFixed(1)
                  : "--"
              }
              icon={<Star className="h-4 w-4" />}
            />
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                       */}
      {/* ------------------------------------------------------------------ */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 flex w-full flex-wrap gap-1 border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm sm:inline-flex sm:w-auto">
            <TabsTrigger value="identity" className="gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Identity</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Agents</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
            <TabsTrigger value="reputation" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Reputation</span>
            </TabsTrigger>
          </TabsList>

          {/* ============================================================== */}
          {/* Tab 1: Identity                                                */}
          {/* ============================================================== */}
          <TabsContent value="identity">
            <AnimatePresence mode="wait">
              <motion.div
                key="identity"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <Card className="glass border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-zinc-100">
                      <Fingerprint className="h-5 w-5 text-emerald-400" />
                      Identity Verification
                    </CardTitle>
                    <CardDescription>
                      Verify your human identity by connecting your wallet
                      address. This creates a verifiable credential on the
                      SovereignID network.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {identityError && (
                        <ErrorBanner
                          message={identityError}
                          onDismiss={() => setIdentityError(null)}
                        />
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <Label htmlFor="wallet-address">Wallet Address</Label>
                      <Input
                        id="wallet-address"
                        placeholder="0x..."
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verification-type">Verification Type</Label>
                      <Select
                        value={verificationType}
                        onValueChange={setVerificationType}
                      >
                        <SelectTrigger id="verification-type">
                          <SelectValue placeholder="Select verification type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gov-id">Government ID</SelectItem>
                          <SelectItem value="phone">Phone Verification</SelectItem>
                          <SelectItem value="biometrics">Biometrics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                      <Button
                        onClick={() => handleVerify(false)}
                        disabled={identityLoading}
                        className="flex-1"
                      >
                        {identityLoading ? (
                          <LoadingSpinner />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        Verify (Live)
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleVerify(true)}
                        disabled={identityLoading}
                        className="flex-1"
                      >
                        {identityLoading ? (
                          <LoadingSpinner />
                        ) : (
                          <Fingerprint className="h-4 w-4" />
                        )}
                        Verify (Demo)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Verification result */}
                <AnimatePresence>
                  {identity && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="border-emerald-500/30 bg-emerald-600/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg text-emerald-400">
                            <Check className="h-5 w-5" />
                            Identity Verified
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-zinc-500">Identity ID</p>
                              <div className="flex items-center gap-1">
                                <p className="font-mono text-sm text-zinc-200">
                                  {truncate(identity.id, 24)}
                                </p>
                                <CopyButton text={identity.id} />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Wallet</p>
                              <div className="flex items-center gap-1">
                                <p className="font-mono text-sm text-zinc-200">
                                  {truncate(identity.wallet_address, 20)}
                                </p>
                                <CopyButton text={identity.wallet_address} />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Type</p>
                              <Badge variant="success">
                                {identity.verification_type}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Status</p>
                              <Badge
                                variant={identity.verified ? "success" : "warning"}
                              >
                                {identity.verified ? "Verified" : "Pending"}
                              </Badge>
                            </div>
                            {identity.verification_expiry && (
                              <div>
                                <p className="text-xs text-zinc-500">Expires</p>
                                <p className="text-sm text-zinc-300">
                                  {formatDate(identity.verification_expiry)}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-zinc-500">Created</p>
                              <p className="text-sm text-zinc-300">
                                {formatDate(identity.created_at)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ============================================================== */}
          {/* Tab 2: Agents                                                  */}
          {/* ============================================================== */}
          <TabsContent value="agents">
            <AnimatePresence mode="wait">
              <motion.div
                key="agents"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Create agent form */}
                <Card className="glass border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-zinc-100">
                      <Bot className="h-5 w-5 text-emerald-400" />
                      Create AI Agent
                    </CardTitle>
                    <CardDescription>
                      Deploy a new AI agent linked to your verified identity.
                      Each agent receives a unique DID and cryptographic
                      keypair.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {agentError && (
                        <ErrorBanner
                          message={agentError}
                          onDismiss={() => setAgentError(null)}
                        />
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <Label htmlFor="agent-name">Agent Name</Label>
                      <Input
                        id="agent-name"
                        placeholder="my-research-agent"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agent-capabilities">
                        Capabilities{" "}
                        <span className="text-zinc-500">(comma-separated)</span>
                      </Label>
                      <Input
                        id="agent-capabilities"
                        placeholder="web_search, data_retrieve, form_submit"
                        value={agentCapabilities}
                        onChange={(e) => setAgentCapabilities(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handleCreateAgent}
                      disabled={agentLoading}
                      className="w-full sm:w-auto"
                    >
                      {agentLoading ? <LoadingSpinner /> : <Bot className="h-4 w-4" />}
                      Create Agent
                    </Button>
                  </CardContent>
                </Card>

                {/* Newly created agent with private key */}
                <AnimatePresence>
                  {createdAgent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="border-emerald-500/30 bg-emerald-600/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg text-emerald-400">
                            <Check className="h-5 w-5" />
                            Agent Created Successfully
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-zinc-500">Agent ID</p>
                              <div className="flex items-center gap-1">
                                <p className="font-mono text-sm text-zinc-200">
                                  {truncate(createdAgent.agent.id, 24)}
                                </p>
                                <CopyButton text={createdAgent.agent.id} />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Name</p>
                              <p className="text-sm text-zinc-200">
                                {createdAgent.agent.name}
                              </p>
                            </div>
                            {createdAgent.agent.did && (
                              <div className="sm:col-span-2">
                                <p className="text-xs text-zinc-500">DID</p>
                                <div className="flex items-center gap-1">
                                  <p className="font-mono text-sm text-zinc-200">
                                    {truncate(createdAgent.agent.did, 40)}
                                  </p>
                                  <CopyButton text={createdAgent.agent.did} />
                                </div>
                              </div>
                            )}
                          </div>

                          <Separator className="bg-amber-500/20" />

                          {/* Private key warning */}
                          <div className="rounded-lg border border-amber-500/40 bg-amber-600/10 p-4">
                            <div className="mb-2 flex items-center gap-2 text-amber-400">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-semibold">
                                Private Key - Store this securely
                              </span>
                            </div>
                            <p className="mb-3 text-xs text-amber-300/70">
                              This key cannot be retrieved later. Save it in a
                              secure location. You will need it to sign agent
                              actions.
                            </p>
                            <div className="flex items-center gap-2 rounded-md bg-zinc-950/60 p-3">
                              <KeyRound className="h-4 w-4 shrink-0 text-amber-400" />
                              <code className="flex-1 break-all text-xs text-amber-200">
                                {createdAgent.private_key}
                              </code>
                              <CopyButton text={createdAgent.private_key} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Existing agents list */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100">
                      Your Agents
                    </h3>
                    {walletAddress && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchAgents(walletAddress)}
                        disabled={agentListLoading}
                      >
                        {agentListLoading ? (
                          <LoadingSpinner />
                        ) : (
                          "Refresh"
                        )}
                      </Button>
                    )}
                  </div>

                  {!walletAddress && (
                    <Card className="glass border-zinc-800">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <UserCheck className="mb-3 h-8 w-8 text-zinc-600" />
                        <p className="text-sm text-zinc-400">
                          Enter your wallet address in the Identity tab to view
                          your agents.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {walletAddress && agentListLoading && (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner className="h-6 w-6 text-emerald-400" />
                    </div>
                  )}

                  {walletAddress && !agentListLoading && agents.length === 0 && (
                    <Card className="glass border-zinc-800">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Bot className="mb-3 h-8 w-8 text-zinc-600" />
                        <p className="text-sm text-zinc-400">
                          No agents found. Create your first agent above.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <motion.div
                        key={agent.id}
                        variants={cardHover}
                        initial="rest"
                        whileHover="hover"
                      >
                        <Card className="glass border-zinc-800 transition-colors hover:border-zinc-700">
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10">
                                  <Bot className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-zinc-100">
                                    {agent.name}
                                  </p>
                                  {agent.did && (
                                    <p className="font-mono text-xs text-zinc-500">
                                      {truncate(agent.did, 32)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant={
                                    agent.registered_on_subnet
                                      ? "success"
                                      : "outline"
                                  }
                                >
                                  {agent.registered_on_subnet
                                    ? "Registered"
                                    : "Unregistered"}
                                </Badge>
                                <Badge variant="secondary">
                                  Score: {agent.reputation_score.toFixed(1)}
                                </Badge>
                                <Badge variant={trustVariant(agent.trust_score)}>
                                  {trustLabel(agent.trust_score)}
                                </Badge>

                                {!agent.registered_on_subnet && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRegisterOnSubnet(agent.id)
                                    }
                                    disabled={
                                      registeringAgentId === agent.id
                                    }
                                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/10"
                                  >
                                    {registeringAgentId === agent.id ? (
                                      <LoadingSpinner />
                                    ) : (
                                      <Globe className="h-3.5 w-3.5" />
                                    )}
                                    Register on Subnet
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    setExpandedAgentId(
                                      expandedAgentId === agent.id
                                        ? null
                                        : agent.id
                                    )
                                  }
                                >
                                  {expandedAgentId === agent.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                  View Details
                                </Button>
                              </div>
                            </div>

                            {/* Expanded details */}
                            <AnimatePresence>
                              {expandedAgentId === agent.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <Separator className="my-4" />
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                      <p className="text-xs text-zinc-500">
                                        Agent ID
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <p className="font-mono text-xs text-zinc-300">
                                          {truncate(agent.id, 20)}
                                        </p>
                                        <CopyButton text={agent.id} />
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-zinc-500">
                                        Public Key
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <p className="font-mono text-xs text-zinc-300">
                                          {truncate(agent.public_key, 20)}
                                        </p>
                                        <CopyButton text={agent.public_key} />
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-zinc-500">
                                        Reputation
                                      </p>
                                      <p
                                        className={`text-sm font-semibold ${scoreColor(
                                          agent.reputation_score
                                        )}`}
                                      >
                                        {agent.reputation_score.toFixed(2)} / 10
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-zinc-500">
                                        Trust Score
                                      </p>
                                      <p className="text-sm text-zinc-300">
                                        {(agent.trust_score * 100).toFixed(0)}%
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-zinc-500">
                                        Total Actions
                                      </p>
                                      <p className="text-sm text-zinc-300">
                                        {agent.total_actions}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-zinc-500">
                                        Capabilities
                                      </p>
                                      <p className="text-sm text-zinc-300">
                                        {agent.capabilities || "None specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-zinc-500">
                                        Created
                                      </p>
                                      <p className="text-sm text-zinc-300">
                                        {formatDate(agent.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ============================================================== */}
          {/* Tab 3: Actions                                                 */}
          {/* ============================================================== */}
          <TabsContent value="actions">
            <AnimatePresence mode="wait">
              <motion.div
                key="actions"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <Card className="glass border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-zinc-100">
                      <Zap className="h-5 w-5 text-emerald-400" />
                      Execute Web Action
                    </CardTitle>
                    <CardDescription>
                      Execute authenticated actions via Unbrowse. Each action is
                      cryptographically signed and logged on-chain for
                      auditability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {actionError && (
                        <ErrorBanner
                          message={actionError}
                          onDismiss={() => setActionError(null)}
                        />
                      )}
                    </AnimatePresence>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="action-agent">Agent</Label>
                        <Select
                          value={actionAgentId}
                          onValueChange={setActionAgentId}
                        >
                          <SelectTrigger id="action-agent">
                            <SelectValue placeholder="Select an agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.length === 0 && (
                              <SelectItem value="_none" disabled>
                                No agents available
                              </SelectItem>
                            )}
                            {agents.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="action-type">Action Type</Label>
                        <Select
                          value={actionType}
                          onValueChange={setActionType}
                        >
                          <SelectTrigger id="action-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web_search">
                              Web Search
                            </SelectItem>
                            <SelectItem value="data_retrieve">
                              Data Retrieve
                            </SelectItem>
                            <SelectItem value="form_submit">
                              Form Submit
                            </SelectItem>
                            <SelectItem value="intent_resolve">
                              Intent Resolve
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="action-private-key">
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
                          Private Key
                        </span>
                      </Label>
                      <Input
                        id="action-private-key"
                        type="password"
                        placeholder="Agent private key for signing"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="action-intent">Intent</Label>
                      <textarea
                        id="action-intent"
                        placeholder='e.g., "find AI startups founded in 2024"'
                        value={actionIntent}
                        onChange={(e) => setActionIntent(e.target.value)}
                        rows={3}
                        className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="action-url">
                        URL{" "}
                        <span className="text-zinc-500">(optional)</span>
                      </Label>
                      <Input
                        id="action-url"
                        placeholder="https://..."
                        value={actionUrl}
                        onChange={(e) => setActionUrl(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <Button
                      onClick={handleExecuteAction}
                      disabled={actionLoading}
                      className="w-full sm:w-auto"
                    >
                      {actionLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      Execute Action
                    </Button>
                  </CardContent>
                </Card>

                {/* Action result */}
                <AnimatePresence>
                  {actionResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="border-emerald-500/30 bg-emerald-600/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg text-emerald-400">
                            <Check className="h-5 w-5" />
                            Action Result
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-zinc-500">Action ID</p>
                              <div className="flex items-center gap-1">
                                <p className="font-mono text-xs text-zinc-200">
                                  {truncate(actionResult.id, 24)}
                                </p>
                                <CopyButton text={actionResult.id} />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Status</p>
                              <Badge
                                variant={
                                  actionResult.verified ? "success" : "warning"
                                }
                              >
                                {actionResult.verified
                                  ? "Verified"
                                  : "Unverified"}
                              </Badge>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-xs text-zinc-500">Signature</p>
                              <div className="flex items-center gap-1">
                                <p className="break-all font-mono text-xs text-zinc-300">
                                  {truncate(actionResult.signature, 48)}
                                </p>
                                <CopyButton text={actionResult.signature} />
                              </div>
                            </div>
                          </div>

                          {actionResult.result && (
                            <>
                              <Separator />
                              <div>
                                <p className="mb-2 text-xs text-zinc-500">
                                  Result
                                </p>
                                <pre className="max-h-64 overflow-auto rounded-lg bg-zinc-950/60 p-4 font-mono text-xs text-zinc-300">
                                  {(() => {
                                    try {
                                      return JSON.stringify(
                                        JSON.parse(actionResult.result),
                                        null,
                                        2
                                      );
                                    } catch {
                                      return actionResult.result;
                                    }
                                  })()}
                                </pre>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action history */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                    Action History
                  </h3>

                  {!actionAgentId && (
                    <Card className="glass border-zinc-800">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Zap className="mb-3 h-8 w-8 text-zinc-600" />
                        <p className="text-sm text-zinc-400">
                          Select an agent above to view action history.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {actionAgentId && actionHistoryLoading && (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner className="h-6 w-6 text-emerald-400" />
                    </div>
                  )}

                  {actionAgentId &&
                    !actionHistoryLoading &&
                    actions.length === 0 && (
                      <Card className="glass border-zinc-800">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                          <Activity className="mb-3 h-8 w-8 text-zinc-600" />
                          <p className="text-sm text-zinc-400">
                            No actions recorded for this agent yet.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                  {actions.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-zinc-800">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b border-zinc-800 bg-zinc-900/60">
                            <tr>
                              <th className="px-4 py-3 font-medium text-zinc-400">
                                Type
                              </th>
                              <th className="px-4 py-3 font-medium text-zinc-400">
                                Intent
                              </th>
                              <th className="px-4 py-3 font-medium text-zinc-400">
                                Signature
                              </th>
                              <th className="px-4 py-3 font-medium text-zinc-400">
                                Verified
                              </th>
                              <th className="px-4 py-3 font-medium text-zinc-400">
                                Time
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                            {actions.map((action) => (
                              <tr
                                key={action.id}
                                className="bg-zinc-950/40 transition-colors hover:bg-zinc-900/40"
                              >
                                <td className="whitespace-nowrap px-4 py-3">
                                  <Badge variant="secondary">
                                    {action.action_type}
                                  </Badge>
                                </td>
                                <td className="max-w-xs truncate px-4 py-3 text-zinc-300">
                                  {action.intent}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-mono text-xs text-zinc-500">
                                    {truncate(action.signature, 16)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge
                                    variant={
                                      action.verified ? "success" : "outline"
                                    }
                                  >
                                    {action.verified ? "Yes" : "No"}
                                  </Badge>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                                  {formatDate(action.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ============================================================== */}
          {/* Tab 4: Reputation                                              */}
          {/* ============================================================== */}
          <TabsContent value="reputation">
            <AnimatePresence mode="wait">
              <motion.div
                key="reputation"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Reputation lookup */}
                <Card className="glass border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-zinc-100">
                      <Trophy className="h-5 w-5 text-emerald-400" />
                      Agent Reputation
                    </CardTitle>
                    <CardDescription>
                      View reputation scores, trust levels, and event history
                      for any agent on the network.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {reputationError && (
                        <ErrorBanner
                          message={reputationError}
                          onDismiss={() => setReputationError(null)}
                        />
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <Label htmlFor="reputation-agent">Select Agent</Label>
                      <Select
                        value={reputationAgentId}
                        onValueChange={setReputationAgentId}
                      >
                        <SelectTrigger id="reputation-agent">
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.length === 0 && (
                            <SelectItem value="_none" disabled>
                              No agents available
                            </SelectItem>
                          )}
                          {agents.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {reputationLoading && (
                      <div className="flex items-center justify-center py-8">
                        <LoadingSpinner className="h-6 w-6 text-emerald-400" />
                      </div>
                    )}

                    {/* Reputation details */}
                    <AnimatePresence>
                      {reputation && !reputationLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4 pt-2"
                        >
                          <div className="grid gap-4 sm:grid-cols-3">
                            {/* Score */}
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                              <p className="mb-1 text-xs text-zinc-500">
                                Reputation Score
                              </p>
                              <p
                                className={`text-3xl font-bold ${scoreColor(
                                  reputation.reputation_score
                                )}`}
                              >
                                {reputation.reputation_score.toFixed(1)}
                              </p>
                              <Progress
                                value={
                                  (reputation.reputation_score / 10) * 100
                                }
                                className="mt-2"
                              />
                              <p className="mt-1 text-right text-xs text-zinc-600">
                                out of 10
                              </p>
                            </div>

                            {/* Trust */}
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                              <p className="mb-1 text-xs text-zinc-500">
                                Trust Level
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-zinc-100">
                                  {(reputation.trust_score * 100).toFixed(0)}%
                                </p>
                                <Badge
                                  variant={trustVariant(
                                    reputation.trust_score
                                  )}
                                >
                                  {trustLabel(reputation.trust_score)}
                                </Badge>
                              </div>
                              <Progress
                                value={reputation.trust_score * 100}
                                className="mt-2"
                              />
                            </div>

                            {/* Actions */}
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                              <p className="mb-1 text-xs text-zinc-500">
                                Total Actions
                              </p>
                              <p className="text-3xl font-bold text-zinc-100">
                                {reputation.total_actions}
                              </p>
                              <p className="mt-2 text-xs text-zinc-500">
                                Across all action types
                              </p>
                            </div>
                          </div>

                          {/* Recent events */}
                          {reputation.recent_events.length > 0 && (
                            <div>
                              <h4 className="mb-3 text-sm font-medium text-zinc-300">
                                Recent Events
                              </h4>
                              <div className="space-y-2">
                                {reputation.recent_events.map((event) => (
                                  <div
                                    key={event.id}
                                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-md ${
                                          event.score_delta >= 0
                                            ? "bg-emerald-600/10 text-emerald-400"
                                            : "bg-red-600/10 text-red-400"
                                        }`}
                                      >
                                        {event.score_delta >= 0 ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm text-zinc-200">
                                          {event.event_type}
                                        </p>
                                        {event.reason && (
                                          <p className="text-xs text-zinc-500">
                                            {event.reason}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span
                                        className={`text-sm font-semibold ${
                                          event.score_delta >= 0
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                        }`}
                                      >
                                        {event.score_delta >= 0 ? "+" : ""}
                                        {event.score_delta.toFixed(2)}
                                      </span>
                                      <span className="text-xs text-zinc-600">
                                        {formatDate(event.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card className="glass border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-zinc-100">
                      <Star className="h-5 w-5 text-amber-400" />
                      Leaderboard
                    </CardTitle>
                    <CardDescription>
                      Top agents ranked by reputation score across the entire
                      network.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {leaderboardLoading && (
                      <div className="flex items-center justify-center py-8">
                        <LoadingSpinner className="h-6 w-6 text-emerald-400" />
                      </div>
                    )}

                    {!leaderboardLoading && leaderboard.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Trophy className="mb-3 h-8 w-8 text-zinc-600" />
                        <p className="text-sm text-zinc-400">
                          No agents on the leaderboard yet.
                        </p>
                      </div>
                    )}

                    {!leaderboardLoading && leaderboard.length > 0 && (
                      <div className="space-y-2">
                        {leaderboard.map((agent, index) => (
                          <div
                            key={agent.id}
                            className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 transition-colors hover:border-zinc-700"
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                index === 0
                                  ? "bg-amber-500/20 text-amber-400"
                                  : index === 1
                                    ? "bg-zinc-400/20 text-zinc-300"
                                    : index === 2
                                      ? "bg-orange-500/20 text-orange-400"
                                      : "bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-zinc-100">
                                {agent.name}
                              </p>
                              {agent.did && (
                                <p className="font-mono text-xs text-zinc-600">
                                  {truncate(agent.did, 28)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={trustVariant(agent.trust_score)}
                              >
                                {trustLabel(agent.trust_score)}
                              </Badge>
                              <div className="text-right">
                                <p
                                  className={`text-lg font-bold ${scoreColor(
                                    agent.reputation_score
                                  )}`}
                                >
                                  {agent.reputation_score.toFixed(1)}
                                </p>
                                <p className="text-xs text-zinc-600">
                                  {agent.total_actions} actions
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        <p>
          SovereignID &mdash; Decentralized AI Agent Identity on Bittensor
        </p>
      </footer>
    </div>
  );
}
