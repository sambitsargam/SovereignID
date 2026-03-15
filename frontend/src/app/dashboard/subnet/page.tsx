"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Network,
  Wifi,
  WifiOff,
  Server,
  Box,
  Users,
  RefreshCw,
  Shield,
  Fingerprint,
  CheckCircle2,
  Award,
  Radio,
} from "lucide-react";
import { api, type SubnetStatus } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const synapseTypes = [
  {
    name: "IdentityVerificationSynapse",
    description:
      "Handles identity verification requests. Validators send wallet addresses and verification types to miners, who process the verification and return the result.",
    fields: ["wallet_address", "verification_type", "verified", "identity_hash"],
  },
  {
    name: "OwnershipValidationSynapse",
    description:
      "Validates agent ownership claims. Miners verify that an agent's DID and public key correspond to the claimed owner identity.",
    fields: ["agent_did", "public_key", "owner_identity_hash", "is_valid"],
  },
  {
    name: "ReputationUpdateSynapse",
    description:
      "Propagates reputation score updates across the network. Validators distribute updated scores based on agent behavior and action verification results.",
    fields: ["agent_id", "new_score", "event_type", "reason"],
  },
];

const subnetFeatures = [
  {
    icon: Fingerprint,
    title: "Identity Verification",
    description:
      "Decentralized verification of human identities using government IDs, phone numbers, and biometric data.",
  },
  {
    icon: CheckCircle2,
    title: "Ownership Validation",
    description:
      "Cryptographic proof that agents are owned and controlled by verified human identities.",
  },
  {
    icon: Award,
    title: "Reputation Updates",
    description:
      "Distributed reputation scoring based on agent behavior, action verification, and network consensus.",
  },
];

export default function SubnetPage() {
  const [status, setStatus] = useState<SubnetStatus | null>(null);
  const [registeredAgents, setRegisteredAgents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [subnetData, stats] = await Promise.all([
        api.getSubnetStatus(),
        api.getStats(),
      ]);
      setStatus(subnetData);
      setRegisteredAgents(stats.registered_agents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subnet status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function handleRefresh() {
    setRefreshing(true);
    fetchAll();
  }

  const isLive = status?.connected ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Subnet Status</h1>
          <p className="mt-1 text-muted-foreground">
            Bittensor subnet connectivity and network information
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <WifiOff className="h-6 w-6 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Connection Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : status ? (
        <>
          {/* Connection banner */}
          <Card className={isLive ? "border-green-500/30 glow" : "border-border"}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${isLive ? "bg-green-500/10" : "bg-muted"}`}>
                  {isLive
                    ? <Wifi className="h-7 w-7 text-green-400" />
                    : <Radio className="h-7 w-7 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">
                      {isLive ? "Connected" : "Not Connected"}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
                      <span className="text-xs text-muted-foreground">
                        {isLive ? "Live" : "Offline"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isLive
                      ? `Connected to Bittensor ${status.network} network`
                      : "No subtensor node reachable — start a local or remote Bittensor node to connect"}
                  </p>
                </div>
                {!isLive && (
                  <Badge variant="secondary" className="shrink-0">Offline</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Network",
                value: <span className="capitalize">{status.network}</span>,
                icon: Network,
                color: "text-primary",
                delay: 0.1,
              },
              {
                label: "Net UID",
                value: status.netuid,
                icon: Server,
                color: "text-blue-400",
                delay: 0.2,
              },
              {
                label: "Block Height",
                value: isLive ? status.block_height?.toLocaleString() : "N/A",
                icon: Box,
                color: isLive ? "text-amber-400" : "text-muted-foreground",
                delay: 0.3,
              },
              {
                label: "Bittensor Neurons",
                value: isLive ? status.num_neurons : "N/A",
                icon: Users,
                color: isLive ? "text-green-400" : "text-muted-foreground",
                delay: 0.4,
              },
            ].map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: card.delay }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <card.icon className={`h-5 w-5 shrink-0 ${card.color}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">{card.label}</p>
                        <p className={`text-lg font-semibold ${card.value === "N/A" ? "text-muted-foreground" : ""}`}>
                          {card.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Local registrations — always real DB data */}
          {registeredAgents !== null && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Locally Registered Agents</p>
                    <p className="text-lg font-semibold">{registeredAgents}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Agents with a confirmed identity hash in the local registry
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      <Separator />

      {/* Subnet capabilities */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Subnet Capabilities</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {subnetFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-3 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Protocol synapses */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Protocol Synapses</h2>
        <div className="space-y-4">
          {synapseTypes.map((synapse, i) => (
            <motion.div
              key={synapse.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-mono text-sm font-semibold">{synapse.name}</h3>
                      <p className="text-sm text-muted-foreground">{synapse.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {synapse.fields.map((field) => (
                          <Badge key={field} variant="secondary">{field}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
