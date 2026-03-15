"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Fingerprint,
  ShieldCheck,
  ShieldX,
  Clock,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const verificationTypes = [
  { value: "gov-id", label: "Government ID" },
  { value: "phone", label: "Phone Verification" },
  { value: "biometrics", label: "Biometric Scan" },
];

export default function VerifyPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [verificationType, setVerificationType] = useState("gov-id");
  const [result, setResult] = useState<HumanIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text">Verify Identity</h1>
        <p className="mt-1 text-muted-foreground">
          Verify a wallet address on the Bittensor network
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            Identity Verification
          </CardTitle>
          <CardDescription>
            Enter your wallet address and select a verification method to prove
            your identity on-chain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Wallet Address
            </label>
            <Input
              placeholder="0x... or ss58 address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Verification Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {verificationTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setVerificationType(type.value)}
                  disabled={loading}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    verificationType === type.value
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button
              onClick={() => handleVerify(false)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Fingerprint className="mr-2 h-4 w-4" />
              )}
              Verify with Passport
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleVerify(true)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Demo Verify
            </Button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
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
          <Card className={result.verified ? "glow" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.verified ? (
                  <ShieldCheck className="h-5 w-5 text-success" />
                ) : (
                  <ShieldX className="h-5 w-5 text-destructive" />
                )}
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={result.verified ? "success" : "destructive"}>
                  {result.verified ? "Verified" : "Not Verified"}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Identity ID</p>
                  <p className="font-mono text-sm">{result.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Wallet</p>
                  <p className="font-mono text-sm break-all">
                    {result.wallet_address}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm capitalize">
                    {result.verification_type.replace("-", " ")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Expiry
                  </p>
                  <p className="text-sm">
                    {result.verification_expiry
                      ? new Date(result.verification_expiry).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm">
                  {new Date(result.created_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
