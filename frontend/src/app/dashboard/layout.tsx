"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  Zap,
  Award,
  Network,
  Menu,
  X,
  Shield,
  ShieldCheck,
  ShieldX,
  Wallet,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "My Agents", icon: Bot },
  { href: "/dashboard/actions", label: "Actions", icon: Zap },
  { href: "/dashboard/reputation", label: "Reputation", icon: Award },
  { href: "/dashboard/subnet", label: "Subnet Status", icon: Network },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Wallet state
  const [wallet, setWallet] = useState("");
  const [walletInput, setWalletInput] = useState("");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sovereignid_wallet");
    if (saved) {
      setWallet(saved);
      setWalletInput(saved);
    }
  }, []);

  // Check verification status whenever wallet changes
  useEffect(() => {
    if (!wallet) {
      setVerified(null);
      return;
    }
    setChecking(true);
    api
      .getVerificationStatus(wallet)
      .then((data) => setVerified(data.verified))
      .catch(() => setVerified(false))
      .finally(() => setChecking(false));
  }, [wallet]);

  function handleWalletSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = walletInput.trim();
    if (!trimmed) return;
    localStorage.setItem("sovereignid_wallet", trimmed);
    setWallet(trimmed);
  }

  function handleDisconnect() {
    localStorage.removeItem("sovereignid_wallet");
    setWallet("");
    setWalletInput("");
    setVerified(null);
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col glass-strong transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold gradient-text">SovereignID</span>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/20 text-primary glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <p className="text-xs text-muted-foreground">
              Decentralized identity verification powered by Bittensor Subnet 55.
            </p>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 lg:px-6">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {sidebarOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <div className="flex-1" />

          {/* Wallet area */}
          {!wallet ? (
            /* No wallet connected — show input */
            <form
              onSubmit={handleWalletSubmit}
              className="flex items-center gap-2"
            >
              <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Enter wallet address..."
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className="h-8 w-52 text-xs"
              />
              <Button type="submit" size="sm" className="h-8 text-xs px-3">
                Connect
              </Button>
            </form>
          ) : (
            /* Wallet connected — show address + verification badge */
            <div className="flex items-center gap-3">
              {/* Verification status badge */}
              {checking ? (
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Checking…</span>
                </div>
              ) : verified ? (
                <div className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Verified</span>
                </div>
              ) : (
                <Link href="/passport">
                  <div className="flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 transition-colors hover:bg-amber-500/20">
                    <ShieldX className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">
                      Not Verified — Verify →
                    </span>
                  </div>
                </Link>
              )}

              {/* Wallet address chip */}
              <button
                onClick={handleDisconnect}
                title="Click to disconnect"
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <Wallet className="h-3 w-3" />
                {wallet.length > 14
                  ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
                  : wallet}
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
