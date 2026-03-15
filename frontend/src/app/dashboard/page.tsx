"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Bot,
  Zap,
  Award,
  Fingerprint,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react";
import { api, type DashboardStats } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="skeleton h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-8 w-20" />
            <div className="skeleton h-4 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Identities",
      value: stats?.total_identities ?? 0,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Total Agents",
      value: stats?.total_agents ?? 0,
      icon: Bot,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Total Actions",
      value: stats?.total_actions ?? 0,
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "Avg Reputation",
      value: stats?.avg_reputation?.toFixed(1) ?? "0.0",
      icon: Award,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
  ];

  const quickActions = [
    {
      label: "Verify Identity",
      description: "Verify a wallet address with government ID, phone, or biometrics",
      icon: Fingerprint,
      href: "/dashboard/verify",
      color: "text-blue-400",
    },
    {
      label: "Create Agent",
      description: "Register a new autonomous agent with signing capabilities",
      icon: Plus,
      href: "/dashboard/agents",
      color: "text-purple-400",
    },
    {
      label: "Execute Action",
      description: "Perform a verified action with an existing agent",
      icon: Zap,
      href: "/dashboard/actions",
      color: "text-amber-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your SovereignID network activity
        </p>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <Card className="hover:glow transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
                      >
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <Separator />

      <div>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="group cursor-pointer transition-all duration-300 hover:glow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <action.icon className={`h-8 w-8 ${action.color}`} />
                        <div>
                          <h3 className="font-semibold">{action.label}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              No recent activity
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Activity from identity verifications, agent actions, and reputation events will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
