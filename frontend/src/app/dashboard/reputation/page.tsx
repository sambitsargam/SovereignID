"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Search,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Star,
  Shield,
} from "lucide-react";
import { api, type Agent, type ReputationSummary } from "@/lib/api";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function ReputationPage() {
  const [leaderboard, setLeaderboard] = useState<Agent[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const [agentId, setAgentId] = useState("");
  const [reputation, setReputation] = useState<ReputationSummary | null>(null);
  const [loadingReputation, setLoadingReputation] = useState(false);
  const [reputationError, setReputationError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await api.getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        setLeaderboardError(
          err instanceof Error ? err.message : "Failed to load leaderboard"
        );
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    fetchLeaderboard();
  }, []);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!agentId.trim()) return;

    setLoadingReputation(true);
    setReputationError(null);
    setReputation(null);

    try {
      const data = await api.getReputation(agentId.trim());
      setReputation(data);
    } catch (err) {
      setReputationError(
        err instanceof Error ? err.message : "Failed to load reputation"
      );
    } finally {
      setLoadingReputation(false);
    }
  }

  function getRankIcon(index: number) {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-700" />;
    return (
      <span className="flex h-5 w-5 items-center justify-center text-xs text-muted-foreground">
        {index + 1}
      </span>
    );
  }

  function getDeltaIcon(delta: number) {
    if (delta > 0) return <TrendingUp className="h-3 w-3 text-success" />;
    if (delta < 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text">Reputation</h1>
        <p className="mt-1 text-muted-foreground">
          Track agent reputation scores and network trust metrics
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                Top agents ranked by reputation score
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLeaderboard ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-14 w-full" />
                  ))}
                </div>
              ) : leaderboardError ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">{leaderboardError}</p>
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Agent</div>
                    <div className="col-span-3">Score</div>
                    <div className="col-span-2">Trust</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <Separator />
                  {leaderboard.map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className="grid grid-cols-12 items-center gap-2 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="col-span-1">{getRankIcon(i)}</div>
                      <div className="col-span-4">
                        <p className="truncate text-sm font-medium">
                          {agent.name}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {agent.id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(agent.reputation_score / 10) * 100}
                            className="h-2 flex-1"
                          />
                          <span className="text-sm font-semibold text-primary">
                            {agent.reputation_score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm">
                          {agent.trust_score.toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm text-muted-foreground">
                          {agent.total_actions}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No agents on the leaderboard yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Agent Lookup
              </CardTitle>
              <CardDescription>
                Get detailed reputation for a specific agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookup} className="flex gap-2">
                <Input
                  placeholder="Agent ID"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  disabled={loadingReputation}
                  className="flex-1"
                />
                <Button type="submit" disabled={loadingReputation} size="sm">
                  {loadingReputation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>
              {reputationError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                >
                  <p className="text-sm text-destructive">{reputationError}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {reputation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Reputation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="text-center">
                    <p className="text-4xl font-bold gradient-text">
                      {reputation.reputation_score.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">out of 10.0</p>
                    <Progress
                      value={(reputation.reputation_score / 10) * 100}
                      className="mt-3"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Shield className="h-4 w-4 text-primary" />
                        <p className="text-lg font-semibold">
                          {reputation.trust_score.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Trust Score
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {reputation.total_actions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Actions
                      </p>
                    </div>
                  </div>

                  {reputation.recent_events.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="mb-3 text-sm font-medium">
                          Recent Events
                        </p>
                        <div className="space-y-2">
                          {reputation.recent_events.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5"
                            >
                              <div className="mt-0.5">
                                {getDeltaIcon(event.score_delta)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium capitalize">
                                    {event.event_type.replace("_", " ")}
                                  </span>
                                  <Badge
                                    variant={
                                      event.score_delta > 0
                                        ? "success"
                                        : event.score_delta < 0
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {event.score_delta > 0 ? "+" : ""}
                                    {event.score_delta.toFixed(1)}
                                  </Badge>
                                </div>
                                {event.reason && (
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {event.reason}
                                  </p>
                                )}
                                <p className="mt-0.5 text-xs text-muted-foreground/60">
                                  {new Date(
                                    event.created_at
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
