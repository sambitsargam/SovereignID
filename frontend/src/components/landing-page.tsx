"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Eye,
  ShieldOff,
  UserCheck,
  Key,
  Network,
  Shield,
  Lock,
  Star,
  Globe,
  Code,
  Blocks,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const problems = [
  {
    icon: AlertTriangle,
    title: "No Verifiable Identity",
    description:
      "AI agents operate without provable identity, making it impossible to establish trust or accountability in autonomous interactions.",
  },
  {
    icon: Eye,
    title: "No Action Provenance",
    description:
      "Agent actions lack cryptographic signatures, leaving no auditable trail and opening the door to impersonation and fraud.",
  },
  {
    icon: ShieldOff,
    title: "Sybil Attacks",
    description:
      "Without identity verification, malicious actors can spawn unlimited fake agents to manipulate networks and extract value.",
  },
];

const solutions = [
  {
    icon: UserCheck,
    title: "Human Verification",
    subtitle: "Passport / Holonym",
    description:
      "Root every agent identity in a verified human through privacy-preserving zero-knowledge proofs. One human, bounded agents.",
  },
  {
    icon: Key,
    title: "Agent Identity",
    subtitle: "Ed25519 + DID",
    description:
      "Each agent receives a unique decentralized identifier backed by Ed25519 keypairs for cryptographic signing of all actions.",
  },
  {
    icon: Network,
    title: "Trust Network",
    subtitle: "Bittensor Subnet",
    description:
      "Miners verify identities and validators score trust. Decentralized consensus ensures no single point of failure or control.",
  },
];

const steps = [
  { number: 1, label: "Human Verifies", sublabel: "via Passport" },
  { number: 2, label: "Creates Agent", sublabel: "DID + Keypair" },
  { number: 3, label: "Identity Registered", sublabel: "On-chain" },
  { number: 4, label: "Miners Verify", sublabel: "Bittensor" },
  { number: 5, label: "Agent Executes", sublabel: "Autonomous" },
  { number: 6, label: "Results Signed", sublabel: "Cryptographic" },
];

const features = [
  {
    icon: Shield,
    title: "Sybil-Resistant Identity",
    description:
      "Human-rooted verification prevents unlimited agent spawning and ensures network integrity.",
  },
  {
    icon: Lock,
    title: "Cryptographic Signing",
    description:
      "Every agent action is signed with Ed25519 keys, creating an immutable audit trail.",
  },
  {
    icon: Blocks,
    title: "Decentralized Trust",
    description:
      "No central authority. Trust is computed by a decentralized network of miners and validators.",
  },
  {
    icon: Star,
    title: "Agent Reputation",
    description:
      "Dynamic reputation scores based on behavioral history, peer attestations, and verification status.",
  },
  {
    icon: Globe,
    title: "Web Interaction",
    description:
      "Verified agents interact with the web through Unbrowse, carrying their identity across services.",
  },
  {
    icon: Code,
    title: "Open Protocol",
    description:
      "Fully open-source and extensible. Build on top of SovereignID with well-documented APIs.",
  },
];

const techStack = [
  { name: "Bittensor", color: "emerald" },
  { name: "Passport", color: "emerald" },
  { name: "Unbrowse", color: "emerald" },
  { name: "FastAPI", color: "emerald" },
  { name: "Next.js", color: "emerald" },
  { name: "Ed25519", color: "emerald" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16,185,129,0.15) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(5,150,105,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(52,211,153,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Animated mesh / floating orbs */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
              animation: "float-slow 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-1/3 -right-48 h-[600px] w-[600px] rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)",
              animation: "float-slow 25s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute -bottom-24 left-1/3 h-[400px] w-[400px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)",
              animation: "float-slow 18s ease-in-out infinite 3s",
            }}
          />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <motion.div
            className="absolute top-[15%] left-[10%] h-2 w-2 rounded-full bg-emerald-400/60"
            animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[25%] right-[15%] h-1.5 w-1.5 rounded-full bg-emerald-300/50"
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-[30%] left-[20%] h-1 w-1 rounded-full bg-emerald-500/40"
            animate={{ y: [0, -25, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-[40%] right-[25%] h-3 w-3 rounded-full bg-emerald-400/20"
            animate={{ y: [0, -10, 0], scale: [1, 1.3, 1] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute bottom-[20%] right-[10%] h-2 w-2 rounded-full bg-emerald-300/30"
            animate={{ y: [0, -18, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />
          {/* Small diamond shapes */}
          <motion.div
            className="absolute top-[60%] left-[8%] h-3 w-3 rotate-45 border border-emerald-500/30"
            animate={{ rotate: [45, 90, 45], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[20%] right-[30%] h-2 w-2 rotate-45 border border-emerald-400/20"
            animate={{ rotate: [45, 135, 45], opacity: [0.15, 0.4, 0.15] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Decentralized Identity Protocol
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Sovereign Identity for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Autonomous AI Agents
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
          >
            Decentralized identity and authorization infrastructure powered by
            Bittensor, human verification, and cryptographic trust.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_32px_rgba(16,185,129,0.3)]"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/50 px-8 py-3.5 text-base font-semibold text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800/80"
            >
              View on GitHub
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-zinc-500"
            >
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="h-8 w-[1px] bg-gradient-to-b from-zinc-500 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PROBLEM                                                     */}
      {/* ============================================================ */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              The Problem
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              The Identity Crisis
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              As AI agents become autonomous actors on the internet, the lack of
              verifiable identity creates critical vulnerabilities.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                custom={i + 1}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl transition-all duration-500 hover:border-red-500/30 hover:bg-zinc-900/80"
              >
                <div className="mb-5 inline-flex rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <problem.icon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="mt-3 leading-relaxed text-zinc-400">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SOLUTION                                                    */}
      {/* ============================================================ */}
      <section className="relative py-32 px-6">
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 opacity-[0.07]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(16,185,129,1) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              The Solution
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              SovereignID Protocol
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              A three-layer architecture that roots agent identity in verified
              humans, secures actions with cryptography, and decentralizes trust
              through Bittensor.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {solutions.map((solution, i) => (
              <motion.div
                key={solution.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={scaleIn}
                custom={i + 1}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/30"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-2 inline-flex rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <solution.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-emerald-400/70">
                    {solution.subtitle}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">
                    {solution.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-zinc-400">
                    {solution.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                */}
      {/* ============================================================ */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Architecture
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              From human verification to signed agent actions in six steps.
            </p>
          </motion.div>

          {/* Desktop flow -- horizontal */}
          <div className="mt-20 hidden lg:block">
            <div className="relative flex items-start justify-between">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-8 z-0 h-[2px]">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }}
                  className="h-full w-full origin-left bg-gradient-to-r from-emerald-500/60 via-emerald-400/40 to-emerald-500/60"
                />
              </div>

              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  custom={i * 0.8}
                  className="relative z-10 flex w-36 flex-col items-center text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-zinc-950 text-xl font-bold text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
                    {step.number}
                  </div>
                  <p className="mt-4 text-sm font-semibold">{step.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{step.sublabel}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile flow -- vertical */}
          <div className="mt-16 lg:hidden">
            <div className="relative ml-8 border-l-2 border-emerald-500/30 pl-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp}
                  custom={i * 0.5}
                  className="relative mb-10 last:mb-0"
                >
                  <div className="absolute -left-[calc(2rem+1.25rem+1px)] flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-zinc-950 text-sm font-bold text-emerald-400">
                    {step.number}
                  </div>
                  <p className="font-semibold">{step.label}</p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {step.sublabel}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section className="relative py-32 px-6">
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute right-0 top-1/4 h-[500px] w-[500px] opacity-[0.05]"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,1) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Features
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Core Capabilities
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              Everything you need to build trusted, autonomous AI systems.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i + 1}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/20 hover:bg-zinc-900/80"
              >
                {/* Corner accent */}
                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-emerald-500/10 blur-xl" />
                </div>

                <div className="mb-5 inline-flex rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-3 transition-colors duration-300 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/10">
                  <feature.icon className="h-6 w-6 text-zinc-300 transition-colors duration-300 group-hover:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TECH STACK                                                  */}
      {/* ============================================================ */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Technology
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Built With
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeIn}
            custom={1}
            className="mt-14 flex flex-wrap items-center justify-center gap-4"
          >
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                custom={i * 0.8}
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-6 py-3 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:text-emerald-400"
              >
                {tech.name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="relative py-32 px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(16,185,129,1) 0%, transparent 70%)",
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="relative mx-auto max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Deploy verifiable identity infrastructure for your AI agents.
            Join the decentralized trust network today.
          </p>
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-10 py-4 text-lg font-semibold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_48px_rgba(16,185,129,0.3)]"
            >
              Launch Dashboard
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
      <footer className="border-t border-zinc-800/60 py-12 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Sovereign
              <span className="text-emerald-400">ID</span>
            </span>
          </div>

          <nav className="flex items-center gap-8 text-sm text-zinc-500">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-zinc-200"
            >
              Dashboard
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-200">
              GitHub
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-200">
              Docs
            </Link>
          </nav>

          <p className="text-sm text-zinc-600">
            Built for the decentralized future
          </p>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*  GLOBAL KEYFRAMES                                            */}
      {/* ============================================================ */}
      <style jsx global>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -40px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(15px, 35px) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
