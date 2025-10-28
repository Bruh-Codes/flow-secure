<img width="889" height="500" alt="image" src="https://github.com/user-attachments/assets/0d450109-6d93-4fb0-a25a-536ad6f42582" />

## Problem Solved

Flow-Secure addresses the critical need for **trustless, automated, and secure conditional asset transfers** on the Flow blockchain. It tackles:

1.  **Lack of Trust in Peer-to-Peer Transactions:** Eliminates the need for intermediaries by holding funds in a smart contract, ensuring release only upon predefined conditions.
2.  **Manual & Inefficient Time-Sensitive Actions:** Leverages **Flow Forte automation and scheduled transactions** to automatically refund expired escrows, removing manual oversight and ensuring timely execution.
3.  **Opaque & Insecure Transfers:** Provides transparency and auditability through open-source Cadence smart contracts, with built-in security measures.

# Introducing Flow-Secure

Flow-Secure is a decentralized escrow application that allows for secure, time-locked transfers of native currency and Flow tokens on the Flow blockchain. It features robust Cadence smart contracts and a modern, user-friendly web interface. This project is designed to be integrated with Forte Workflows and automations.

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

## Deployment

The Flow-Secure Cadence contracts are deployed on the **Flow Testnet**.

**FlowVaultEscrow Contract Address:** `0xa72b13062e901c7c`
**Flowscan Link (FlowVaultEscrow):** [https://testnet.flowscan.io/contract/A.a72b13062e901c7c.FlowVaultEscrow](https://testnet.flowscan.io/contract/A.a72b13062e901c7c.FlowVaultEscrow)

**EscrowRefundHandler Contract Address:** `0xa72b13062e901c7c`
**Flowscan Link (EscrowRefundHandler):** [https://testnet.flowscan.io/contract/A.a72b13062e901c7c.EscrowRefundHandler](https://testnet.flowscan.io/contract/A.a72b13062e901c7c.EscrowRefundHandler)

## Project Structure

This project is a monorepo managed with Yarn Workspaces.

- `flowVault/`: A Cadence project containing the `FlowVaultEscrow` smart contract and Forte integration.
- `frontend/`: A React application providing the web interface for interacting with the escrow system. See [frontend/README.md](frontend/README.md) for more details.

---

## Tech Stack

| Area               | Technologies                                                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Smart Contract** | Cadence, [Flow CLI](https://docs.onflow.org/flow-cli/), [Flow Emulator](https://docs.onflow.org/flow-cli/#flow-emulator)                                                                                                      |
| **Frontend**       | [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [FCL (Flow Client Library)](https://developers.flow.com/tools/fcl-js/) |
| **Automation**     | Forte Workflows                                                                                                                                                                                          |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en) (v18 or later)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Flow CLI](https://docs.onflow.org/flow-cli/install)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Bruh-Codes/flow-vault-secure
cd flow-vault-secure
```
### 2. Install Dependencies

Run the following command from the root directory to install all necessary dependencies for both the frontend and the smart contract project.

```bash
yarn install
```

### 3. Set up the Smart Contracts

The smart contracts are managed using the Flow CLI.

**Run Local Flow Emulator**

For local development and testing, you can start a local Flow emulator:

```bash
flow emulator
```

**Deploy Contracts to Emulator**

To deploy the contracts to your local emulator:

```bash
flow project deploy
```

**Test the Contracts**

To run the test suite for the `FlowVaultEscrow` contract:

```bash
flow test
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
- `yarn contracts:test`: Runs the Cadence smart contract tests using Flow CLI.
- `yarn contracts:deploy`: Deploys the Cadence smart contracts to the configured network.