# SovereignID

**Decentralized identity and authorization infrastructure for autonomous AI agents.**

SovereignID provides cryptographic identity, Sybil-resistant verification, and on-chain reputation for AI agents operating in the open economy. Built on Bittensor, integrated with Passport (Holonym) for human verification and Unbrowse for agent web interactions.

## Architecture

```
Human Operator
      |
      v
Passport / Holonym API ──── Sybil-Resistant Verification
      |
      v
Agent Creation ──── Ed25519 Keypair + DID Generation
      |
      v
Bittensor Subnet
  ├── Miners ──── Identity Verification, Ownership Validation, Reputation Computation
  └── Validators ──── Task Distribution, Scoring, Weight Setting
      |
      v
Unbrowse API ──── Signed Agent Web Actions
      |
      v
On-Chain Reputation ──── Trust Scoring with Temporal Decay
```

## Features

- **Human Verification** — Integrates with Passport/Holonym sybil-resistance API (gov-id, phone, biometrics)
- **Agent Identity** — Ed25519 key pairs with W3C DID generation (`did:sovereign:`)
- **Bittensor Subnet** — Full miner/validator implementation with identity verification, ownership validation, and reputation update synapses
- **Cryptographic Signing** — All agent actions are signed with Ed25519 and verifiable on-chain
- **Reputation System** — Score agents based on verified actions with diminishing returns and temporal decay
- **Web Interaction** — Agents execute web tasks via Unbrowse API with signed results
- **Dashboard** — Real-time monitoring of agents, actions, reputation, and subnet status

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, SQLAlchemy (async), SQLite |
| Subnet | Bittensor SDK (Axon/Dendrite, Synapse protocol) |
| Identity | Ed25519 (PyNaCl), SHA-256 identity hashing |
| Human Verification | Passport / Holonym API |
| Web Actions | Unbrowse AI API |
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| UI Components | Radix UI, Framer Motion, Lucide Icons |
| Deployment | Docker Compose |

## Project Structure

```
sovereignid/
├── backend/
│   ├── api/                    # FastAPI route handlers
│   │   ├── routes.py           # Main router aggregator
│   │   ├── routes_verification.py  # Human identity verification
│   │   ├── routes_agents.py    # Agent CRUD operations
│   │   ├── routes_actions.py   # Agent action execution
│   │   ├── routes_subnet.py    # Bittensor subnet registration
│   │   ├── routes_reputation.py    # Reputation queries
│   │   ├── routes_stats.py     # Dashboard statistics
│   │   └── schemas.py          # Pydantic request/response models
│   ├── bittensor/
│   │   ├── protocol.py         # Synapse definitions (wire protocol)
│   │   ├── miner/miner.py      # Bittensor miner node
│   │   └── validator/validator.py  # Bittensor validator node
│   ├── db/
│   │   ├── database.py         # Async SQLAlchemy engine
│   │   └── models.py           # ORM models (Identity, Agent, Action, Reputation)
│   ├── identity/
│   │   └── crypto.py           # Ed25519 key generation, signing, DID creation
│   ├── passport/
│   │   └── verification/client.py  # Holonym sybil-resistance API client
│   ├── reputation/
│   │   └── engine.py           # Reputation scoring with temporal decay
│   ├── unbrowse/
│   │   └── actions/client.py   # Unbrowse AI web interaction client
│   ├── config.py               # Pydantic settings (env-based configuration)
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── layout.tsx      # Root layout (dark theme)
│   │   │   ├── globals.css     # Design system tokens
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx  # Dashboard sidebar layout
│   │   │       ├── page.tsx    # Overview with stats
│   │   │       ├── verify/     # Identity verification
│   │   │       ├── agents/     # Agent management
│   │   │       ├── actions/    # Action execution
│   │   │       ├── reputation/ # Reputation & leaderboard
│   │   │       └── subnet/     # Subnet status
│   │   ├── components/ui/      # Reusable UI components
│   │   └── lib/
│   │       ├── api.ts          # Typed API client
│   │       └── utils.ts        # Tailwind utilities
│   ├── Dockerfile
│   └── next.config.ts
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose (for containerized deployment)

### Option 1: Docker Compose

```bash
# Clone and configure
cp .env.example .env

# Start all services
docker compose up --build
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:8000`.

### Option 2: Local Development

**Backend:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Running the Bittensor Subnet

The miner and validator nodes connect to a Bittensor network. For local development:

```bash
# Start a local subtensor (requires Docker)
docker run -d --name subtensor \
  -p 9944:9944 -p 9945:9945 -p 30333:30333 \
  ghcr.io/opentensor/subtensor:latest \
  --dev --rpc-external --rpc-cors=all

# Create wallet
btcli wallet create --wallet.name sovereignid

# Register on local subnet
btcli subnets register --netuid 1 \
  --wallet-name sovereignid --hotkey default \
  --network ws://127.0.0.1:9945

# Run miner
python -m backend.bittensor.miner.miner \
  --netuid 1 --subtensor.network local \
  --wallet.name sovereignid --wallet.hotkey default \
  --axon.port 8901

# Run validator (separate terminal)
python -m backend.bittensor.validator.validator \
  --netuid 1 --subtensor.network local \
  --wallet.name sovereignid --wallet.hotkey validator
```

## Demo Flow

1. **Open the landing page** at `http://localhost:3000`
2. **Navigate to the dashboard** via "Launch App"
3. **Verify your identity** — Enter a wallet address and use "Demo Verify" for local testing, or "Verify with Passport" to check against the Holonym API
4. **Create an AI agent** — Provide a name, your verified wallet address, and capabilities. Store the private key securely.
5. **Register on the subnet** — The agent identity is registered and verified by Bittensor miners
6. **Execute a web action** — Describe an intent (e.g., "find AI startups founded in 2024"), sign it with your private key, and execute via Unbrowse
7. **View reputation** — Track the agent's reputation score and action history on the leaderboard

## API Reference

The backend exposes a REST API at `http://localhost:8000/api`. Interactive documentation is available at `http://localhost:8000/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/verification/verify` | Verify human identity via Passport |
| POST | `/api/verification/verify-demo` | Demo verification (local dev) |
| GET | `/api/verification/status/{wallet}` | Get verification status |
| POST | `/api/agents/` | Create a new agent |
| GET | `/api/agents/{id}` | Get agent details |
| GET | `/api/agents/by-owner/{wallet}` | List agents by owner |
| POST | `/api/actions/execute` | Execute a signed agent action |
| GET | `/api/actions/{agent_id}` | List agent actions |
| POST | `/api/subnet/register` | Register agent on Bittensor subnet |
| GET | `/api/subnet/status` | Get subnet connectivity status |
| GET | `/api/reputation/{agent_id}` | Get agent reputation summary |
| GET | `/api/reputation/leaderboard` | Get reputation leaderboard |
| GET | `/api/stats/` | Get dashboard statistics |

## Bittensor Subnet Protocol

The subnet defines four synapse types for miner-validator communication:

| Synapse | Purpose | Miner Task |
|---------|---------|------------|
| `IdentityVerificationSynapse` | Verify Ed25519 signatures | Validate signature matches public key |
| `OwnershipValidationSynapse` | Verify agent-owner binding | Confirm identity hash matches claimed owner |
| `ReputationUpdateSynapse` | Compute reputation deltas | Calculate score change from action outcomes |
| `PingIdentitySynapse` | Check miner liveness | Echo nonce value |

Validators score miners with weighted combination: Identity (35%) + Ownership (30%) + Reputation (20%) + Liveness (15%).

## Environment Variables

All backend configuration uses the `SOVEREIGNID_` prefix. See `.env.example` for the full list.

| Variable | Default | Description |
|----------|---------|-------------|
| `SOVEREIGNID_DATABASE_URL` | `sqlite+aiosqlite:///./sovereignid.db` | Database connection string |
| `SOVEREIGNID_BITTENSOR_NETWORK` | `local` | Bittensor network (local/test/finney) |
| `SOVEREIGNID_PASSPORT_API_URL` | `https://api.holonym.io` | Passport verification API |
| `SOVEREIGNID_UNBROWSE_API_URL` | `https://beta-api.unbrowse.ai` | Unbrowse web action API |
| `SOVEREIGNID_UNBROWSE_API_KEY` | — | Unbrowse API key |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Frontend API base URL |

## License

MIT
