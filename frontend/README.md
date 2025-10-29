## Features

- **Wallet Connection:** Connects to Flow wallets using FCL (Flow Client Library).
- **Create Escrow:** Allows users to create new escrows by specifying a recipient, amount, expiry duration, and refund mode (manual or automatic).
- **Claim Escrow:** Enables recipients to claim their escrowed FLOW tokens.
- **Escrow History:** Displays a list of all active, claimed, and refunded escrows relevant to the connected wallet.
- **Manual Refund:** Provides an option for senders to manually refund expired escrows (if the refund mode was set to manual).
- **Forte Integration:** Supports automatic refunds for escrows created with the "auto" refund mode, leveraging Flow Forte Workflows.
- **Responsive Design:** Built with Tailwind CSS and shadcn/ui for a modern and responsive user experience.

## Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Flow Integration:** FCL (Flow Client Library), @onflow/react-sdk
- **State Management:** React Hooks
- **Routing:** React Router DOM
- **Notifications:** Sonner

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/en) (v18 or later) and [Yarn](https://yarnpkg.com/getting-started/install) installed.

### Installation

From the project root directory, install all dependencies:

```bash
yarn install
```

### Running the Development Server

To start the frontend development server:

```bash
yarn frontend:dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Building for Production

To build the application for production:

```bash
yarn frontend:build
```

The build artifacts will be placed in the `dist` directory.

## Configuration

The Flow network configuration and contract addresses are defined in `src/config/flow.ts`. Ensure these addresses match your deployed Cadence contracts on the target Flow network (e.g., Testnet).

## Interaction with Flow Contracts

The frontend interacts with the `FlowVaultEscrow` Cadence contract deployed on the Flow blockchain. Key interactions include:

- **`createEscrow`:** Initiates a transaction to create a new escrow on-chain.
- **`claimEscrow`:** Initiates a transaction for a recipient to claim funds from an active escrow.
- **`refundEscrow`:** Initiates a transaction for a sender to manually refund an expired escrow.
- **`fetchActiveEscrows`:** Queries the blockchain to retrieve a list of active escrows.

The `useFlowEscrow` hook (`src/hooks/useFlowEscrow.ts`) encapsulates all the Cadence transaction and script logic for these interactions.

### Testing with Local Accounts

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
