# FlowVault: A Decentralized Escrow System on Flow

FlowVault is a decentralized escrow smart contract system on the Flow blockchain, enabling secure, time-based `FlowToken` payments. It integrates with **Forte**, Flow's native transaction scheduler, for automated refunds of expired escrows, offering a more reliable and user-friendly experience than traditional systems.

## Problem Solved: The Costly Mistake of Wrong Addresses & Manual Refunds

Have you ever worried about sending cryptocurrency to the wrong address, losing your funds forever? Or dealt with cumbersome, manual processes to get your money back from an expired transaction?

FlowVault directly addresses these critical pain points in decentralized finance by providing:

- **Protection Against Wrong Addresses:** Funds are held securely in an escrow, allowing you to reclaim them if the recipient doesn't claim within the set time, or if you need to manually refund. This acts as a safety net against accidental transfers to incorrect or unresponsive addresses.
- **Automated & Reliable Refunds:** Leveraging Flow's Forte service, FlowVault automatically processes refunds for expired escrows. No more chasing recipients or manual intervention – your funds are returned to you seamlessly.
- **Trustless Transactions:** Eliminating the need for intermediaries, all funds are secured by smart contract logic, ensuring your assets are safe from censorship or misuse.
- **Transparency & Auditability:** Every escrow activity is recorded on the Flow blockchain, providing a transparent and immutable audit trail for all transactions.

## Core Features

- **Trustless & Secure:** Funds held in smart contracts, removing third-party risk.
- **Time-Based Escrows:** Funds locked until a specified expiry date.
- **Automated Refunds (Forte):** Senders can opt-in for automatic refunds upon escrow expiry.
- **On-Chain Audit Trail:** Transparent and immutable history of all escrow actions.
- **Full Cadence Logic:** Entire system implemented in Cadence smart contracts.
- **Queryable & Composable:** Rich on-chain functions for easy integration.

## How It Works

FlowVault escrows transition through `Active`, `Claimed`, or `Refunded` states:

1.  **Creation:** Sender creates an escrow with Receiver, amount, expiry, and `refundMode` (`"manual"` or `"auto"`). Funds are held in the contract.
2.  **Claiming:** Receiver can claim funds before expiry.
3.  **Refunding:** Expired `manual` escrows can be refunded by the sender. Expired `auto` escrows are automatically refunded by a Forte Agent.

## Project Structure

Cadence code is organized into:

- `contracts/`: Core smart contracts. View deployed contracts on the [Flow Contract Browser](https://contractbrowser.com/account/0x8930cf9fab05a37b/contracts).
- `transactions/`: Transaction scripts for interactions.
- `scripts/`: Scripts for querying escrow states.
- `tests/`: Automated test files.

## Getting Started

This guide outlines the basic steps for a developer to get started with the FlowVault project.

### Prerequisites

Ensure you have the [Flow CLI](https://developers.flow.com/tools/flow-cli/install) installed.

### Account Setup and `flow.json` Configuration

1.  **Create a Flow Account:** If you don't have one, create a Flow account. You can use the Flow CLI for this.
2.  **Configure `flow.json`:** Ensure your project's `flow.json` file is correctly configured with your account details and contract deployment order. This file defines how your contracts are deployed and which accounts are used.

### Deploying the Project

Once your `flow.json` is configured and the Flow Emulator is running (if deploying locally), you can deploy the smart contracts:

```sh
flow project deploy
```

This command will deploy the contracts specified in your `flow.json` to the configured account.

## Testing

Automated tests are in `cadence/tests/`. Run all tests with:

```sh
flow test ./cadence/tests/*
```

## Future Improvements

- Support for Multiple Fungible Tokens.
- Milestone-Based Escrows.
- Dispute Resolution.
- Frontend UI.
