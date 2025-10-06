# FlowVault Secure

FlowVault Secure is a decentralized escrow application that allows for secure, time-locked transfers of native currency and ERC20 tokens on EVM-compatible blockchains. It features a robust Solidity smart contract and a modern, user-friendly web interface. This project is designed to be integrated with Forte Workflows and automations.

## How It Works: The Escrow Process

The `FlowVaultEscrow` smart contract provides the following core functionalities:

- **Escrow Creation**: Users can create an escrow for either native currency (e.g., ETH) or any ERC20 token. When creating an escrow, the sender specifies the recipient's address, the amount, and an expiry timestamp. For ERC20 token escrows, the sender must first grant approval to the contract to transfer the specified amount.

- **Active Escrow**: Once created, the funds are securely held within the `FlowVaultEscrow` contract, and the escrow is marked as `Active`.

- **Claiming Funds**: The designated recipient can claim the entire amount from the escrow at any point before the expiry time. Upon a successful claim, the funds are transferred to the recipient, and the escrow's status changes to `Claimed`.

- **Refunding**: If the expiry time is reached and the funds have not been claimed by the recipient, the original sender has the right to a refund. The sender can call the refund function to retrieve their locked funds, and the escrow's status will be updated to `Refunded`.

- **Security & Events**: The contract is built with security in mind, incorporating a re-entrancy guard to prevent common attack vectors. It also emits events (`EscrowCreated`, `EscrowClaimed`, `EscrowRefunded`) for each major action, allowing for easy off-chain monitoring and integration.

## Forte Integration — Automations & Workflows

FlowVault integrates Flow Forte Actions & Workflows to automate escrow management on-chain — removing the need for manual intervention once an escrow is created.

## How It Works

When a new escrow is created, the contract emits an EscrowCreated event containing:

Escrow ID

Sender

Receiver

Amount

Expiry timestamp

Forte listens to this event via its Connector, then automatically sets up a scheduled workflow tied to that escrow.

Automation Logic

Event Trigger:
EscrowCreated triggers a Forte workflow that starts tracking that escrow.

Scheduled Wait:
Forte waits until the escrow’s expiry time using its native scheduling primitives (delay_until).

Conditional Check:
Once expiry is reached, Forte queries the contract using getEscrow(id) to verify the escrow’s state.

Auto Refund Execution:

If the escrow is still Active and not claimed,
Forte automatically calls refundEscrow(id) on the contract.

The funds are instantly refunded to the sender, and
the event EscrowRefunded is emitted.

Dashboard Update:
The frontend listens for EscrowRefunded and updates the escrow status to Refunded automatically by Forte.

## Project Structure

This project is a monorepo managed with Yarn Workspaces.

- `flow-escrow/`: A Foundry project containing the `FlowVaultEscrow` smart contract.
- `frontend/`: A React application providing the web interface for interacting with the escrow system.

---

## Tech Stack

| Area               | Technologies                                                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Smart Contract** | Solidity, [Foundry](https://getfoundry.sh/), [OpenZeppelin](https://www.openzeppelin.com/contracts)                                                                                                      |
| **Frontend**       | [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Wagmi](https://wagmi.sh/), Reown |
| **Automation**     | Forte Workflows                                                                                                                                                                                          |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en) (v18 or later)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_REPOSITORY_URL>
cd flow-vault-secure
```

### 2. Install Dependencies

Run the following command from the root directory to install all necessary dependencies for both the frontend and the smart contract project.

```bash
yarn install
```

### 3. Set up the Smart Contracts

The smart contracts are managed using Foundry.

**Run Local Blockchain**

For local development and testing, you can start a local Anvil node:

```bash
anvil
```

**Test the Contracts**

To run the test suite for the `FlowVaultEscrow` contract:

```bash
yarn contracts:test
```

### 4. Run the Frontend

To start the frontend development server:

```bash
yarn frontend:dev
```

The application will be available at `http://localhost:5173` (or the next available port).

---

## Available Scripts

You can run the following scripts from the root directory of the project:

- `yarn frontend:dev`: Starts the frontend development server.
- `yarn frontend:build`: Builds the frontend application for production.
- `yarn contracts:test`: Runs the Solidity smart contract tests using Foundry.
