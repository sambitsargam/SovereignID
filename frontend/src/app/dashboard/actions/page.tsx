"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Key,
  Clock,
} from "lucide-react";
import { api, type AgentAction } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const actionTypes = [
  { value: "web_search", label: "Web Search" },
  { value: "data_retrieve", label: "Data Retrieve" },
  { value: "form_submit", label: "Form Submit" },
  { value: "intent_resolve", label: "Intent Resolve" },
];

export default function ActionsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-muted" /><div className="h-64 rounded bg-muted" /></div>}>
      <ActionsPageInner />
    </Suspense>
  );
}

function ActionsPageInner() {
  const searchParams = useSearchParams();
  const [agentId, setAgentId] = useState(searchParams.get("agent_id") || "");
  const [privateKey, setPrivateKey] = useState("");
  const [actionType, setActionType] = useState("web_search");
  const [intent, setIntent] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentAction | null>(null);

  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [actionsError, setActionsError] = useState<string | null>(null);

  useEffect(() => {
    if (agentId.trim()) {
      fetchActions(agentId.trim());
    }
  }, [agentId]);

  async function fetchActions(id: string) {
    setLoadingActions(true);
    setActionsError(null);
    try {
      const data = await api.getActions(id);
      setActions(data);
    } catch (err) {
      setActionsError(
        err instanceof Error ? err.message : "Failed to load actions"
      );
      setActions([]);
    } finally {
      setLoadingActions(false);
    }
  }

  async function handleExecute(e: React.FormEvent) {
    e.preventDefault();
    if (!agentId.trim() || !privateKey.trim() || !intent.trim()) {
      setError("Agent ID, private key, and intent are required");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.executeAction({
        agent_id: agentId.trim(),
        private_key: privateKey.trim(),
        action_type: actionType,
        intent: intent.trim(),
        url: url.trim() || undefined,
      });
      setResult(data);
      fetchActions(agentId.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action execution failed");
    } finally {
      setSubmitting(false);
    }
  }

  function formatResult(resultStr: string | null): string {
    if (!resultStr) return "No result data";
    try {
      const parsed = JSON.parse(resultStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return resultStr;
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
        <h1 className="text-3xl font-bold gradient-text">Agent Actions</h1>
        <p className="mt-1 text-muted-foreground">
          Execute and track verified agent actions on the network
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Execute Action
          </CardTitle>
          <CardDescription>
            Sign and submit an action for verification on the Bittensor subnet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleExecute} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent ID</label>
                <Input
                  placeholder="Agent UUID"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Key className="h-3 w-3" /> Private Key
                </label>
                <Input
                  type="password"
                  placeholder="Agent private key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {actionTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setActionType(type.value)}
                    disabled={submitting}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      actionType === type.value
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Intent</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background resize-none"
                placeholder="Describe what this action should accomplish..."
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                URL{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={submitting}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Execute Action
            </Button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.verified ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                Action Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Action Type</p>
                  <p className="text-sm capitalize">
                    {result.action_type.replace("_", " ")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <Badge variant={result.verified ? "success" : "destructive"}>
                    {result.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Intent</p>
                  <p className="text-sm">{result.intent}</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Signature</p>
                  <p className="font-mono text-xs break-all text-muted-foreground">
                    {result.signature.length > 80
                      ? `${result.signature.slice(0, 80)}...`
                      : result.signature}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Result Data</p>
                <pre className="max-h-60 overflow-auto rounded-lg bg-black/40 p-4 font-mono text-xs text-foreground">
                  {formatResult(result.result)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Separator />

      <div>
        <h2 className="mb-4 text-xl font-semibold">Action History</h2>
        {loadingActions ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : actionsError ? (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{actionsError}</p>
            </CardContent>
          </Card>
        ) : actions.length > 0 ? (
          <div className="space-y-3">
            {actions.map((action, i) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {action.verified ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">
                              {action.action_type.replace("_", " ")}
                            </span>
                            <Badge
                              variant={
                                action.verified ? "success" : "destructive"
                              }
                            >
                              {action.verified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {action.intent}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(action.created_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-sm text-muted-foreground">
                {agentId.trim()
                  ? "No actions found for this agent"
                  : "Enter an agent ID to view action history"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
