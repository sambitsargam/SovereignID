"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  Fingerprint,
  ShieldCheck,
  ShieldX,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { api, type HumanIdentity } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const verificationTypes = [
  {
    value: "gov-id",
    label: "Government ID",
    description: "Passport, national ID, or driver's licence",
  },
  {
    value: "phone",
    label: "Phone Number",
    description: "Verify via SMS one-time code",
  },
  {
    value: "biometrics",
    label: "Biometrics",
    description: "Face or fingerprint scan",
  },
];

export default function PassportPage() {
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState("");
  const [verificationType, setVerificationType] = useState("gov-id");
  const [result, setResult] = useState<HumanIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill wallet from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("sovereignid_wallet");
    if (saved) setWalletAddress(saved);
  }, []);

  async function handleVerify(demo: boolean) {
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = demo
        ? await api.verifyIdentityDemo(walletAddress.trim(), verificationType)
        : await api.verifyIdentity(walletAddress.trim(), verificationType);
      setResult(data);
      if (data.verified) {
        // Persist wallet so the dashboard header picks it up
        localStorage.setItem("sovereignid_wallet", walletAddress.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <span className="font-bold gradient-text">SovereignID</span>
        <div className="flex-1" />
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg space-y-8"
        >
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
              <Fingerprint className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Identity Passport</h1>
            <p className="text-muted-foreground">
              Prove you&apos;re human. Unlock the full SovereignID network.
            </p>
          </div>

          {/* Passport card */}
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Wallet</CardTitle>
              <CardDescription>
                Link your wallet address to a verified human identity using
                Holonym&apos;s sybil-resistance protocol.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Wallet Address</label>
                <Input
                  placeholder="0x… or ss58 address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Verification type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Method</label>
                <div className="grid gap-2">
                  {verificationTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setVerificationType(type.value)}
                      disabled={loading}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all duration-200 cursor-pointer ${
                        verificationType === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-muted-foreground"
                      }`}
                    >
                      <div
                        className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                          verificationType === type.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            verificationType === type.value
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {type.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleVerify(false)}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Verify with Holonym Passport
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleVerify(true)}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Demo Verify (local dev)
                </Button>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                >
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={result.verified ? "border-green-500/40 glow" : "border-destructive/40"}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    {result.verified ? (
                      <ShieldCheck className="h-6 w-6 text-green-400" />
                    ) : (
                      <ShieldX className="h-6 w-6 text-destructive" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {result.verified ? "Identity Verified" : "Not Verified"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.verified
                          ? "Your wallet is now linked to a verified human identity."
                          : "Verification did not succeed. Try again or use a different method."}
                      </p>
                    </div>
                  </div>

                  {result.verified && (
                    <>
                      <Separator />
                      <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Wallet</p>
                          <p className="font-mono break-all">{result.wallet_address}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Method</p>
                          <p className="capitalize">{result.verification_type.replace("-", " ")}</p>
                        </div>
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={() => router.push("/dashboard")}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Go to Dashboard
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
