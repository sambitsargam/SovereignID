"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Plus,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Network,
  Loader2,
  Search,
  Zap,
} from "lucide-react";
import {
  api,
  type Agent,
  type AgentCreated,
} from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AgentsPage() {
  const [name, setName] = useState("");
  const [ownerWallet, setOwnerWallet] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<AgentCreated | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [lookupWallet, setLookupWallet] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [registerResult, setRegisterResult] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);

  async function handleCreateAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !ownerWallet.trim()) {
      setCreateError("Name and owner wallet address are required");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreatedAgent(null);

    try {
      const caps = capabilities
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const data = await api.createAgent(
        name.trim(),
        ownerWallet.trim(),
        caps.length > 0 ? caps : undefined
      );
      setCreatedAgent(data);
      if (lookupWallet.trim() === ownerWallet.trim()) {
        fetchAgents(lookupWallet.trim());
      }
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create agent"
      );
    } finally {
      setCreating(false);
    }
  }

  const fetchAgents = useCallback(async (wallet: string) => {
    if (!wallet.trim()) return;
    setLoadingAgents(true);
    setAgentsError(null);
    try {
      const data = await api.getAgentsByOwner(wallet.trim());
      setAgents(data);
    } catch (err) {
      setAgentsError(
        err instanceof Error ? err.message : "Failed to load agents"
      );
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    fetchAgents(lookupWallet);
  }

  async function handleRegister(agentId: string) {
    setRegisteringId(agentId);
    setRegisterResult(null);
    try {
      const reg = await api.registerOnSubnet(agentId);
      setRegisterResult(
        `Agent registered on subnet (netuid: ${reg.netuid}, status: ${reg.status})`
      );
      if (lookupWallet.trim()) {
        fetchAgents(lookupWallet.trim());
      }
    } catch (err) {
      setRegisterResult(
        err instanceof Error ? err.message : "Registration failed"
      );
    } finally {
      setRegisteringId(null);
    }
  }

  async function handleCopyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      setCopiedKey(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text">My Agents</h1>
        <p className="mt-1 text-muted-foreground">
          Create and manage autonomous agents with verifiable identities
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Agent
            </CardTitle>
            <CardDescription>
              Register a new agent that can perform verified actions on the
              network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent Name</label>
                <Input
                  placeholder="My Agent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Owner Wallet Address
                </label>
                <Input
                  placeholder="0x... or ss58 address"
                  value={ownerWallet}
                  onChange={(e) => setOwnerWallet(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Capabilities{" "}
                  <span className="text-muted-foreground">(comma-separated)</span>
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background resize-none"
                  placeholder="web_search, data_retrieve, form_submit"
                  value={capabilities}
                  onChange={(e) => setCapabilities(e.target.value)}
                  disabled={creating}
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Agent
              </Button>
            </form>

            {createError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
              >
                <p className="text-sm text-destructive">{createError}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Find Agents
            </CardTitle>
            <CardDescription>
              Look up agents by owner wallet address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="flex gap-2">
              <Input
                placeholder="Owner wallet address"
                value={lookupWallet}
                onChange={(e) => setLookupWallet(e.target.value)}
                disabled={loadingAgents}
                className="flex-1"
              />
              <Button type="submit" disabled={loadingAgents}>
                {loadingAgents ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </form>
            {agentsError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3"
              >
                <p className="text-sm text-destructive">{agentsError}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {createdAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                Agent Created Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{createdAgent.agent.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Agent ID</p>
                  <p className="font-mono text-sm">{createdAgent.agent.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">DID</p>
                  <p className="font-mono text-sm break-all">
                    {createdAgent.agent.did || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Public Key</p>
                  <p className="font-mono text-sm break-all">
                    {createdAgent.agent.public_key}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-amber-500">
                      Save Your Private Key
                    </p>
                    <p className="text-xs text-amber-500/80">
                      This private key will not be shown again. Store it securely
                      -- you need it to sign agent actions.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-black/40 px-3 py-2 font-mono text-xs text-amber-300 break-all">
                        {createdAgent.private_key}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyKey(createdAgent.private_key)}
                      >
                        {copiedKey ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {registerResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{registerResult}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {agents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Agents ({agents.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Bot className="h-4 w-4 text-primary" />
                        {agent.name}
                      </CardTitle>
                      <div className="flex gap-1.5">
                        {agent.registered_on_subnet ? (
                          <Badge variant="success">Subnet</Badge>
                        ) : (
                          <Badge variant="secondary">Unregistered</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">DID</span>
                        <span className="font-mono text-xs max-w-[200px] truncate">
                          {agent.did || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Public Key</span>
                        <span className="font-mono text-xs max-w-[200px] truncate">
                          {agent.public_key}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reputation</span>
                        <span className="font-semibold text-primary">
                          {agent.reputation_score.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Actions</span>
                        <span>{agent.total_actions}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    {!agent.registered_on_subnet && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegister(agent.id)}
                        disabled={registeringId === agent.id}
                      >
                        {registeringId === agent.id ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Network className="mr-1 h-3 w-3" />
                        )}
                        Register on Subnet
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/dashboard/actions?agent_id=${agent.id}`}>
                        <Zap className="mr-1 h-3 w-3" />
                        Execute Action
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loadingAgents && lookupWallet.trim() && agents.length === 0 && !agentsError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No agents found for this wallet address
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
