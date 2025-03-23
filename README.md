# zkHyperliquid

[![TypeScript](https://img.shields.io/badge/TypeScript-^5.0.0-3178C6)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-nightly-B7410E)](https://www.rust-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

zkHyperliquid is a high-performance trading platform built on zero-knowledge proofs. It uses the Vapp framework to enable secure and cross-chain interoperability via AggLayer.

![zkHyperliquid](./assets/app.png)

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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
