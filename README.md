# zkHyperliquid

[![TypeScript](https://img.shields.io/badge/TypeScript-^5.0.0-3178C6)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-nightly-B7410E)](https://www.rust-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

zkHyperliquid is a high-performance trading platform built on zero-knowledge proofs. It uses the Vapp framework to enable secure and cross-chain interoperability via AggLayer.

![zkHyperliquid](./assets/app.png)

## Goal
- Provide an efficient, scalable trading platform with low-latency order execution.
- Enable trustless verification of trade execution and asset state changes using zk proofs.
- Support cross-chain interoperability natively via AggLayer.
- Ensure asset security and correctness through pessimistic proofs and zk-verification mechanisms for any cross-chain transactions.


## Key Features

- Secure, verifiable transactions via zero-knowledge proofs
- High-throughput, low-latency trading environment
- Cross-chain interoperability through AggLayer integration
- Resistance to front-running and other common DeFi vulnerabilities
- Trustless order matching with cryptographic verification

## Project Structure

```
.
├── ui/                    # Frontend application
├── server/                # Backend server
│   └── src/               # Source code
│       ├── api/           # REST API endpoints for orders and users
│       ├── block/         # Block creation and database management
│       ├── engine/        # Order matching engine and mempool
│       ├── oracle/        # Oracle to get L1 state, to confirm settlement
│       ├── sender/        # Transaction sender services
│       └── user/          # User management and authentication
├── zkVM/                  # SP1 project to generate ZKPs
│   ├── program/          # Rust program to generate ZKPs
│   └── script/           # Rust script to generate ZKPs
└── contract/              # Foundry-based Solidity smart contracts
    ├── src/               # Contract source code (RollupBridge)
    ├── script/            # Deployment scripts
    ├── test/              # Contract test files
    └── lib/               # Contract dependencies
```

## How to run?

### Run the server

The server is a Rust application that runs on port 3000.

```bash
cd server
cargo run --release
```

### Run the UI

The UI is a Next.js application that runs on port 3001.

```bash
cd ui
bun install
bun dev --port 3001
```

## Architecture Diagram

![zkHyperliquid Architecture Diagram](./assets/zkHyperliquid.png)
Black components are complimented, the rest are not implemented yet.

## Key Features & Functionalities

### Execution Server
- Provides RPC endpoints for clients to sign and send transaction requests.
- Provides RPC endpoints for clients to initiate deposit and withdraw transaction requests to process cross-chain transactions on AggLayer.
- Matches orders and updates asset state within a sparse Merkle tree.
- Processes transactions through a Finite State Machine (FSM).
- Batches processed transactions into epoch blocks.
- Logs transactions, including order matching and cross-chain transfers.
- Submits transaction logs to a zkVM for proof generation.

### zkVirtual Machine (zkVM) Execution
- Executes transaction logs within an FSM for cryptographic verification.
- Generates zk proofs confirming state transitions.
- Uses SP1
- [Optional] Stores execution traces in a Data Availability (DA) layer.

### Wrap Proof and Submission
- Wraps execution proofs into succinct proofs (SNARKs).
- Prepares certificates for cross-chain transactions (AggSender).
- Submits proofs to AggLayer for cross-chain process.

### Pessimistic Proofs
- Generates pessimistic proofs to track asset movements.
- Ensures execution proof validity before L1 settlement.

### Settlement on Ethereum
- Finalizes state changes securely on Ethereum.
- Prevents invalid state transitions via zk-proof enforcement.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
