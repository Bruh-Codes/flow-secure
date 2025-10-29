<img width="889" height="500" alt="image" src="https://github.com/user-attachments/assets/0d450109-6d93-4fb0-a25a-536ad6f42582" />

# FlowVault Secure

FlowVault Secure is a comprehensive decentralized escrow system built on the Flow blockchain, offering secure, time-based `FlowToken` payments with advanced features like automated refunds. This repository contains both the core smart contract logic and the user-friendly frontend application.

## Key Features

- **Wallet Connection:** Connects to Flow wallets using FCL (Flow Client Library).
- **Create Escrow:** Allows users to create new escrows by specifying a recipient, amount, expiry duration, and refund mode (manual or automatic).
- **Claim Escrow:** Enables recipients to claim their escrowed FLOW tokens.
- **Escrow History:** Displays a list of all active, claimed, and refunded escrows relevant to the connected wallet.
- **Manual Refund:** Provides an option for senders to manually refund expired escrows (if the refund mode was set to manual).
- **Forte Integration:** Supports automatic refunds for escrows created with the "auto" refund mode, leveraging Flow Forte Workflows.
- **Responsive Design:** Built with Tailwind CSS and shadcn/ui for a modern and responsive user experience.

---

## Smart Contracts: FlowVault

FlowVault is a decentralized escrow smart contract system on the Flow blockchain, enabling secure, time-based `FlowToken` payments. It integrates with **Forte**, Flow's native transaction scheduler, for automated refunds of expired escrows, offering a more reliable and user-friendly experience than traditional systems.

### Problem Solved: The Costly Mistake of Wrong Addresses & Manual Refunds

Have you ever worried about sending cryptocurrency to the wrong address, losing your funds forever? Or dealt with cumbersome, manual processes to get your money back from an expired transaction?

FlowVault directly addresses these critical pain points in decentralized finance by providing:

- **Protection Against Wrong Addresses:** Funds are held securely in an escrow, allowing you to reclaim them if the recipient doesn't claim within the set time, or if you need to manually refund. This acts as a safety net against accidental transfers to incorrect or unresponsive addresses.
- **Automated & Reliable Refunds:** Leveraging Flow's Forte service, FlowVault automatically processes refunds for expired escrows. No more chasing recipients or manual intervention – your funds are returned to you seamlessly.
- **Trustless Transactions:** Eliminating the need for intermediaries, all funds are secured by smart contract logic, ensuring your assets are safe from censorship or misuse.
- **Transparency & Auditability:** Every escrow activity is recorded on the Flow blockchain, providing a transparent and immutable audit trail for all transactions.

### Smart Contract Capabilities

- **Trustless & Secure:** Funds held in smart contracts, removing third-party risk.
- **Time-Based Escrows:** Funds locked until a specified expiry date.
- **Automated Refunds (Forte):** Senders can opt-in for automatic refunds upon escrow expiry.
- **On-Chain Audit Trail:** Transparent and immutable history of all escrow actions.
- **Full Cadence Logic:** Entire system implemented in Cadence smart contracts.
- **Queryable & Composable:** Rich on-chain functions for easy integration.

### How It Works

FlowVault escrows transition through `Active`, `Claimed`, or `Refunded` states:

1.  **Creation:** Sender creates an escrow with Receiver, amount, expiry, and `refundMode` (`"manual"` or `"auto"`). Funds are held in the contract.
2.  **Claiming:** Receiver can claim funds before expiry.
3.  **Refunding:** Expired `manual` escrows can be refunded by the sender. Expired `auto` escrows are automatically refunded by a Forte Agent.

### Project Structure

Cadence code is organized into:

- `contracts/`: Core smart contracts. View deployed contracts on the [Flow Contract Browser](https://contractbrowser.com/account/0x8930cf9fab05a37b/contracts).
- `transactions/`: Transaction scripts for interactions.
- `scripts/`: Scripts for querying escrow states.
- `tests/`: Automated test files.

### Getting Started (Smart Contracts)

This guide outlines the basic steps for a developer to get started with the FlowVault smart contracts.

#### Prerequisites

Ensure you have the [Flow CLI](https://developers.flow.com/tools/flow-cli/install) installed.

#### Account Setup and `flow.json` Configuration

1.  **Create a Flow Account:** If you don't have one, create a Flow account. You can use the Flow CLI for this.
2.  **Configure `flow.json`:** Ensure your project's `flow.json` file is correctly configured with your account details and contract deployment order. This file defines how your contracts are deployed and which accounts are used.

#### Deploying the Project

Once your `flow.json` is configured and the Flow Emulator is running (if deploying locally), you can deploy the smart contracts:

```sh
flow project deploy
```

This command will deploy the contracts specified in your `flow.json` to the configured account.

### Testing (Smart Contracts)

Automated tests are in `cadence/tests/`. Run all tests with:

```sh
flow test ./cadence/tests/*
```

### Future Improvements (Smart Contracts)

- Support for Multiple Fungible Tokens.
- Milestone-Based Escrows.
- Dispute Resolution.

---

## Frontend Application

This section details the frontend application for FlowVault Secure.

### Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Flow Integration:** FCL (Flow Client Library), @onflow/react-sdk
- **State Management:** React Hooks
- **Routing:** React Router DOM
- **Notifications:** Sonner

### Getting Started (Frontend)

#### Prerequisites

Ensure you have [Node.js](https://nodejs.org/en) (v18 or later) and [Yarn](https://yarnpkg.com/getting-started/install) installed.

#### Installation

From the project root directory, install all dependencies:

```bash
yarn install
```

#### Running the Development Server

To start the frontend development server:

```bash
yarn frontend:dev
```

The application will be available at `http://localhost:5173` (or the next available port).

#### Building for Production

To build the application for production:

```bash
yarn frontend:build
```

The build artifacts will be placed in the `dist` directory.

### Configuration (Frontend)

The Flow network configuration and contract addresses are defined in `src/config/flow.ts`. Ensure these addresses match your deployed Cadence contracts on the target Flow network (e.g., Testnet).

### Interaction with Flow Contracts (Frontend)

The frontend interacts with the `FlowVaultEscrow` Cadence contract deployed on the Flow blockchain. Key interactions include:

- **`createEscrow`:** Initiates a transaction to create a new escrow on-chain.
- **`claimEscrow`:** Initiates a transaction for a recipient to claim funds from an active escrow.
- **`refundEscrow`:** Initiates a transaction for a sender to manually refund an expired escrow.
- **`fetchActiveEscrows`:** Queries the blockchain to retrieve a list of active escrows.

The `useFlowEscrow` hook (`src/hooks/useFlowEscrow.ts`) encapsulates all the Cadence transaction and script logic for these interactions.

### Testing with Local Accounts (Frontend)

For local development and testing, you might need to configure your Flow client (FCL) to use a private key associated with a test account. This allows your frontend to sign transactions directly from your development environment.

**Important:** Never use private keys from your mainnet accounts for local testing. Always use dedicated testnet accounts.

To add a private key to your Flow configuration (e.g., in `flow.json` or directly in your FCL setup), you typically need to:

1.  **Generate a test account** on the Flow Testnet (or local emulator).
2.  **Obtain the private key** for that test account.
3.  **Configure FCL** (usually in `flow.json` or `src/config/flow.ts`) to include this private key for the desired account address. The exact method depends on your FCL setup, but it often involves adding an `accounts` object with the address and private key.

Example (conceptual, actual implementation may vary based on your `flow.json` or FCL config):

```json
{
  "contracts": { ... },
  "networks": { ... },
  "accounts": {
    "test-account": {
      "address": "0x...",
      "keys": "YOUR_PRIVATE_KEY_HERE"
    }
  }
}
```

Refer to the [Flow Client Library (FCL) documentation](https://developers.flow.com/tools/clients/fcl-js/configure-fcl) for detailed instructions on configuring accounts and keys.
