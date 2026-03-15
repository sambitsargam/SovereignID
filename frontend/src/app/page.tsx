"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Bot,
  Key,
  Network,
  Fingerprint,
  Globe,
  ArrowRight,
  Check,
  Zap,
  Lock,
  Eye,
  Award,
  ChevronRight,
  ExternalLink,
  Github,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Architecture", href: "#architecture" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
];

const PROBLEMS = [
  {
    icon: Bot,
    title: "No Agent Identity",
    description:
      "AI agents operate without verifiable identity. There is no standard for proving an agent's origin, capabilities, or authorization level.",
  },
  {
    icon: Eye,
    title: "Sybil Vulnerability",
    description:
      "Without identity infrastructure, malicious actors can spin up unlimited fake agents, flooding networks and eroding trust in autonomous systems.",
  },
  {
    icon: Lock,
    title: "No Accountability",
    description:
      "Agent actions are unsigned and unverifiable. When something goes wrong, there is no cryptographic trail linking actions to responsible parties.",
  },
];

const STEPS = [
  {
    icon: Fingerprint,
    title: "Verify Human",
    description: "Prove you are a real person via passport-based verification using the Passport API.",
  },
  {
    icon: Bot,
    title: "Create Agent",
    description: "Spawn an autonomous AI agent with a unique Ed25519 keypair and DID document.",
  },
  {
    icon: Key,
    title: "Register Identity",
    description: "Register the agent identity on-chain through the Bittensor subnet for decentralized validation.",
  },
  {
    icon: Zap,
    title: "Execute Actions",
    description: "Your verified agent signs every action cryptographically, building on-chain reputation over time.",
  },
];

const FEATURES = [
  {
    icon: Fingerprint,
    title: "Human Verification",
    description: "Passport-based biometric verification ensures every agent traces back to a real human operator.",
    tag: "Passport API",
  },
  {
    icon: Key,
    title: "Agent Identity",
    description: "Ed25519 keypairs and W3C DID documents give each agent a globally unique, self-sovereign identity.",
    tag: "Ed25519 + DID",
  },
  {
    icon: Network,
    title: "Bittensor Subnet",
    description: "A dedicated miner/validator network provides decentralized verification and consensus on agent identities.",
    tag: "Subnet 71",
  },
  {
    icon: Award,
    title: "Reputation System",
    description: "On-chain scoring tracks agent reliability, accuracy, and trustworthiness across all interactions.",
    tag: "On-chain",
  },
  {
    icon: Shield,
    title: "Signed Actions",
    description: "Every agent action is cryptographically signed, creating an immutable audit trail of accountability.",
    tag: "Crypto Proofs",
  },
  {
    icon: Globe,
    title: "Web Interaction",
    description: "Agents interact with the real web via Unbrowse, performing verified actions on behalf of their operators.",
    tag: "Unbrowse",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ---- Background effects ---- */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Top-left glow */}
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-purple-700/10 blur-[160px]" />
        {/* Center glow */}
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/8 blur-[140px]" />
        {/* Bottom-right glow */}
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-purple-800/10 blur-[120px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ================================================================ */}
      {/*  NAVIGATION                                                      */}
      {/* ================================================================ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong fixed left-0 right-0 top-0 z-50"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Sovereign<span className="text-accent">ID</span>
            </span>
          </Link>

          {/* Links -- hidden on small screens */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-accent hover:shadow-lg hover:shadow-purple-500/20"
          >
            Launch App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.nav>

      {/* ================================================================ */}
      {/*  HERO                                                            */}
      {/* ================================================================ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        {/* Animated ring decoration */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            className="h-[700px] w-[700px] rounded-full border border-purple-500/10"
          />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="h-[500px] w-[500px] rounded-full border border-violet-400/10"
          />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-8 flex justify-center">
            <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
              Powered by Bittensor Subnet
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Decentralized Identity for{" "}
            <span className="gradient-text">Autonomous AI Agents</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            SovereignID provides cryptographic identity, Sybil-resistant
            verification, and on-chain reputation for AI agents operating in the
            open economy.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white transition-all hover:bg-accent hover:shadow-xl hover:shadow-purple-600/25"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="glass group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-secondary"
            >
              <Github className="h-5 w-5" />
              View on GitHub
              <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-8"
          >
            {[
              { value: "Ed25519", label: "Key Standard" },
              { value: "W3C DID", label: "Identity Spec" },
              { value: "TAO", label: "Incentive Layer" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold text-accent sm:text-xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronRight className="h-4 w-4 rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================ */}
      {/*  PROBLEM                                                         */}
      {/* ================================================================ */}
      <section id="problem" className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-accent">
              The Problem
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
              AI Agents Need Identity
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              As autonomous agents proliferate, the lack of verifiable identity
              creates systemic risks across every layer of the AI economy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                custom={i}
                className="glass group rounded-2xl p-8 transition-all hover:glow"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <p.icon className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  SOLUTION                                                        */}
      {/* ================================================================ */}
      <section id="solution" className="relative py-32">
        {/* Decorative divider */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-accent">
              The Solution
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
              How SovereignID Works
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A four-step pipeline from human verification to autonomous,
              accountable agent actions.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="relative mt-20 grid gap-8 md:grid-cols-4"
          >
            {/* Connecting line (desktop) */}
            <div className="pointer-events-none absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0 md:block" />

            {STEPS.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} custom={i} className="relative text-center">
                {/* Step number ring */}
                <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-purple-500/20" />
                  <div className="absolute inset-2 rounded-full border border-purple-500/10" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                    <s.icon className="h-7 w-7 text-accent" />
                  </div>
                  {/* Step label */}
                  <span className="absolute -top-1 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  ARCHITECTURE                                                    */}
      {/* ================================================================ */}
      <section id="architecture" className="relative py-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-accent">
              Under the Hood
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
              System Architecture
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              An end-to-end pipeline connecting human identity to autonomous
              agent actions through Bittensor consensus.
            </motion.p>
          </motion.div>

          {/* Architecture Diagram */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
            custom={0}
            className="mt-16"
          >
            <div className="glass glow overflow-hidden rounded-2xl p-8 sm:p-12">
              {/* Main flow -- horizontal on md+, vertical on mobile */}
              <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-0">
                {/* Node: Human */}
                <ArchNode
                  icon={<Fingerprint className="h-6 w-6 text-accent" />}
                  title="Human Operator"
                  subtitle="Passport verified"
                  color="accent"
                />

                <ArchArrow />

                {/* Node: Passport Verification */}
                <ArchNode
                  icon={<Shield className="h-6 w-6 text-success" />}
                  title="Passport API"
                  subtitle="Biometric check"
                  color="success"
                />

                <ArchArrow />

                {/* Node: Agent Creation */}
                <ArchNode
                  icon={<Bot className="h-6 w-6 text-accent" />}
                  title="Agent Creation"
                  subtitle="Ed25519 + DID"
                  color="accent"
                />

                <ArchArrow />

                {/* Node: Bittensor Subnet */}
                <div className="flex flex-col items-center gap-3">
                  <div className="gradient-border rounded-2xl">
                    <div className="rounded-2xl bg-card p-5 text-center">
                      <Network className="mx-auto h-6 w-6 text-purple-400" />
                      <p className="mt-2 text-sm font-semibold">Bittensor Subnet</p>
                      <div className="mt-3 flex justify-center gap-2">
                        <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs text-accent">
                          Miners
                        </span>
                        <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs text-accent">
                          Validators
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <ArchArrow />

                {/* Node: Web Actions */}
                <ArchNode
                  icon={<Globe className="h-6 w-6 text-accent" />}
                  title="Web Actions"
                  subtitle="Unbrowse integration"
                  color="accent"
                />
              </div>

              {/* Legend */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-border/50 pt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" /> Identity Layer
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" /> Verification Layer
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-400" /> Consensus Layer
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  FEATURES                                                        */}
      {/* ================================================================ */}
      <section id="features" className="relative py-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-accent">
              Capabilities
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Built for the Agent Economy
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every component is designed to make autonomous agents verifiable,
              accountable, and trustworthy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="glass group rounded-2xl p-7 transition-all hover:glow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  DEMO CTA                                                        */}
      {/* ================================================================ */}
      <section id="demo" className="relative py-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={staggerContainer}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="glass glow rounded-3xl px-8 py-20 text-center sm:px-16">
              {/* Background decoration */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-600/10 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet-600/10 blur-[80px]" />

              <motion.div variants={fadeUp} custom={0} className="relative z-10">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Try the Live Demo
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                  See SovereignID in action. Verify your identity, create an
                  agent, and watch it execute signed actions on the web.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 text-base font-semibold text-white transition-all hover:bg-accent hover:shadow-xl hover:shadow-purple-600/25"
                  >
                    Open Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    Star on GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  FOOTER                                                          */}
      {/* ================================================================ */}
      <footer className="border-t border-border/50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            {/* Branding */}
            <div className="flex flex-col items-center gap-3 md:items-start">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold tracking-tight">
                  Sovereign<span className="text-accent">ID</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Built for the decentralized future.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#problem" className="transition-colors hover:text-foreground">
                Problem
              </a>
              <a href="#solution" className="transition-colors hover:text-foreground">
                Solution
              </a>
              <a href="#features" className="transition-colors hover:text-foreground">
                Features
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-xs text-muted-foreground md:flex-row">
            <p>Powered by Bittensor &bull; Passport API &bull; Unbrowse</p>
            <p>Hackathon 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ArchNode({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-xl ${
          color === "success" ? "bg-success/15" : "bg-primary/15"
        }`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function ArchArrow() {
  return (
    <div className="flex items-center justify-center text-muted-foreground md:px-2">
      {/* Vertical on mobile, horizontal on md+ */}
      <ChevronRight className="hidden h-5 w-5 md:block" />
      <ChevronRight className="h-5 w-5 rotate-90 md:hidden" />
    </div>
  );
}
