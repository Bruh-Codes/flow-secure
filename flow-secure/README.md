# FlowVault: A Decentralized Escrow System on Flow

FlowVault is a fully-featured, decentralized escrow smart contract system built on the Flow blockchain. It enables users to send and receive `FlowToken` payments that are held in a secure, on-chain vault until specific, time-based conditions are met.

A key feature of FlowVault is its integration with **Forte**, Flow's native transaction scheduling service, to provide automated, "set it and forget it" refunds for expired escrows. This creates a more reliable and user-friendly experience compared to traditional escrow systems that require manual intervention.

This project was developed for a hackathon to showcase the power and flexibility of Cadence and the Flow blockchain.

## Core Features

*   **Trustless & Secure:** All funds are held in a smart contract, removing the need for a trusted third party and ensuring that funds cannot be misused.
*   **Time-Based Escrows:** Escrows are locked until a specific expiry date, after which they can be either claimed by the receiver or refunded to the sender.
*   **Automated Refunds with Forte:** Senders can opt-in to have their funds automatically returned if the escrow expires, thanks to a seamless integration with Flow's Forte transaction scheduler.
*   **On-Chain Audit Trail:** Every action (creation, claim, refund) emits a blockchain event, providing a transparent and immutable history of all escrow activity.
*   **Full On-Chain Logic:** The entire system, including all business logic, is implemented in Cadence smart contracts.
*   **Queryable & Composable:** A rich set of on-chain query functions allows for easy integration with frontends and other smart contracts.

## How It Works: The User Journey

The FlowVault system revolves around a simple yet powerful state machine for each escrow: `Active`, `Claimed`, or `Refunded`.

1.  **Creating an Escrow:**
    *   A **Sender** initiates a transaction to create an escrow, specifying the **Receiver's** address, the amount of `FlowToken`, and an **expiry time**.
    *   The Sender also chooses a `refundMode`:
        *   `"manual"`: If the escrow expires, the refund must be manually triggered.
        *   `"auto"`: The escrow will be automatically refunded by a Forte Agent if it expires.
    *   The `FlowToken` is then transferred into a secure vault within the `FlowVaultEscrow` smart contract.

2.  **Claiming an Escrow:**
    *   At any point before the expiry time, the **Receiver** can initiate a `claimEscrow` transaction.
    *   The smart contract verifies the Receiver's identity and the escrow's status. If valid, the `FlowToken` is transferred to the Receiver's wallet, and the escrow state is set to `Claimed`.

3.  **Refunding an Escrow:**
    *   If the expiry time passes and the funds have not been claimed, the escrow can be refunded.
    *   **Manual Refund:** If the `refundMode` was `"manual"`, anyone can call the `refundEscrow` transaction. The funds are then returned to the **Sender**.
    *   **Automatic Refund:** If the `refundMode` was `"auto"`, a pre-configured Forte Agent automatically calls the `refundAllExpired` function at a regular interval. This function finds all expired escrows and returns the funds to their respective Senders.

## Architecture & File Structure

The project is organized into three main directories within the `cadence/` folder:

*   `contracts/`: Contains the core smart contracts that define the logic and data structures.
*   `transactions/`: Contains the Cadence transaction scripts for creating, claiming, and refunding escrows.
*   `scripts/`: Contains the Cadence scripts for querying the state of the smart contracts.

### Key Files

#### Contracts (`cadence/contracts/`)

*   **`FlowVaultEscrow.cdc`**: The main smart contract that contains all the core logic for the escrow system.
*   **`EscrowRefundHandler.cdc`**: A contract that defines the `TransactionHandler` resource required by the Forte scheduler. This handler's `executeTransaction` function is what gets called by Forte.
*   **`InitEscrowRefundHandler.cdc`**: A one-time transaction to initialize the `EscrowRefundHandler` in an account, effectively making it a Forte Agent.

#### Transactions (`cadence/transactions/`)

*   **`CreateEscrow.cdc`**: (Implicitly defined in the contract) Creates a new escrow.
*   **`ClaimEscrow.cdc`**: Allows a receiver to claim the funds from an active escrow.
*   **`RefundEscrow.cdc`**: Manually refunds a single expired escrow.
*   **`RefundAllExpired.cdc`**: Refunds all expired escrows that have opted-in for automatic refunds. This is designed to be called by the Forte Agent.
*   **`ScheduleEscrowRefund.cdc`**: Schedules a future execution of the `refundAllExpired` function via the Forte `FlowTransactionScheduler`.

#### Scripts (`cadence/scripts/`)

*   **`GetActiveEscrows.cdc`**: Returns a list of all active escrows.
*   **`GetExpiredEscrows.cdc`**: Returns a list of all expired escrows.
*   **`GetEscrow.cdc`**: Fetches the details of a single escrow by its ID.
*   **`GetStats.cdc`**: Provides statistics about the number of escrows in each state.
*   **`IsClaimable.cdc`**: Checks if an escrow is currently claimable.
*   **`IsRefundable.cdc`**: Checks if an escrow is currently refundable.

#### Tests (`cadence/tests/`)

*   **`FlowVaultEscrow.test.cdc`**: A comprehensive test suite that covers the creation, claiming, and refunding of escrows.
*   **`ScheduledTransactions.test.cdc`**: A test file for the automated refund functionality using Forte.
*   **`Minimal.test.cdc`**: A minimal test file to ensure the basic setup is working.

## Prerequisites

Before you begin, ensure you have the [Flow CLI](https://developers.flow.com/tools/flow-cli/install) installed. This tool is essential for deploying contracts, running transactions, and executing scripts.

## Getting Started: A Step-by-Step Guide

This guide will walk you through deploying and interacting with the FlowVault contracts on the Flow Emulator.

### Step 1: Configure `flow.json`

Your `flow.json` file should be configured to define your accounts and specify the deployment order. For a local emulator environment, it should look something like this:

```json
{
  "contracts": {
    "FlowVaultEscrow": "./cadence/contracts/FlowVaultEscrow.cdc",
    "EscrowRefundHandler": "./cadence/contracts/EscrowRefundHandler.cdc"
  },
  "accounts": {
    "emulator-account": {
      "address": "f8d6e0586b0a20c7",
      "key": "..."
    }
  },
  "deployments": {
    "emulator": {
      "emulator-account": [
        "FlowVaultEscrow",
        "EscrowRefundHandler"
      ]
    }
  }
}
```

### Step 2: Start the Flow Emulator

Open a terminal window and run the following command to start the local emulator:

```sh
flow emulator
```

Keep the emulator running in the background.

### Step 3: Deploy the Smart Contracts

Open a **new** terminal window and run the following command to deploy the contracts to your emulator account:

```sh
flow project deploy
```

This will deploy `FlowVaultEscrow` and `EscrowRefundHandler` to the `emulator-account`.

### Step 4: Initialize the Forte Agent

To enable automated refunds, you must initialize an account as a Forte Agent. This is a one-time setup.

```sh
flow transactions send ./cadence/transactions/InitEscrowRefundHandler.cdc --signer emulator-account
```

### Step 5: Create an Escrow

Now, let's create a new escrow. This transaction requires arguments for the `receiver`, `amount`, `expiry`, and `refundMode`.

```sh
flow transactions send ./cadence/transactions/CreateEscrow.cdc 0xf8d6e0586b0a20c7 10.0 60.0 "auto" --signer emulator-account
```

*   `0xf8d6e0586b0a20c7`: The receiver's address.
*   `10.0`: The amount of FlowToken to escrow.
*   `60.0`: The expiry time in seconds from now.
*   `"auto"`: The refund mode.

### Step 6: Interact with the Escrow

You can now use the scripts to view the escrow's state or transactions to interact with it.

**Get Escrow Details:**

```sh
flow scripts execute ./cadence/scripts/GetEscrow.cdc 1
```

*(Replace `1` with the ID of the escrow you created.)*

**Claim the Escrow (as the Receiver):**

```sh
flow transactions send ./cadence/transactions/ClaimEscrow.cdc 1 --signer emulator-account
```

### Step 7: Schedule Automated Refunds

To test the automated refund feature, you can schedule the refund handler to run in the near future.

```sh
flow transactions send ./cadence/transactions/ScheduleEscrowRefund.cdc 30.0 1 100 --signer emulator-account
```

*   `30.0`: Delay in seconds.
*   `1`: Priority (`0`=High, `1`=Medium, `2`=Low).
*   `100`: Execution effort.

## Troubleshooting

**Problem: Transaction fails with "missing receiver capability".**

*   **Cause:** The account you are trying to send an escrow to (the receiver) does not have a `FlowToken` vault set up.
*   **Solution:** The receiver must run a transaction to set up a vault. This is a standard requirement for receiving tokens on Flow.

**Problem: `flow project deploy` fails.**

*   **Cause:** There might be an issue with your `flow.json` configuration or the Flow Emulator might not be running.
*   **Solution:**
    1.  Ensure the `flow emulator` is running in a separate terminal.
    2.  Double-check the account names and contract paths in your `flow.json` file.
    3.  Make sure the private key for your `emulator-account` is correct.

**Problem: `claimEscrow` fails with "escrow has expired".**

*   **Cause:** You are trying to claim an escrow after its expiry time has passed.
*   **Solution:** The receiver can only claim an escrow *before* the expiry time. After expiry, the escrow can only be refunded.

## Testing the System

There are two ways to test the FlowVault smart contracts:

1.  **Using the Cadence Test Framework:** The project includes a suite of automated tests that cover the entire escrow lifecycle.
2.  **Manual Testing with Transactions & Scripts:** You can manually test the system by sending transactions and executing scripts using the Flow CLI.

### Automated Testing

The `cadence/tests/` directory contains the following test files:

*   **`FlowVaultEscrow.test.cdc`**: A comprehensive test suite that covers the creation, claiming, and refunding of escrows.
*   **`ScheduledTransactions.test.cdc`**: A test file for the automated refund functionality using Forte.
*   **`Minimal.test.cdc`**: A minimal test file to ensure the basic setup is working.

To run the tests, use the `flow test` command:

```sh
# Run all tests
flow test 'test/*'
```

### Manual Testing

You can manually test the system by using the transactions in `cadence/transactions/` and the scripts in `cadence/scripts/`.

**1. Create an Escrow:**

Use the `CreateEscrow.cdc` transaction to create a new escrow.

```sh
flow transactions send ./cadence/transactions/CreateEscrow.cdc 0xf8d6e0586b0a20c7 10.0 60.0 "auto" --signer emulator-account
```

**2. Verify the Escrow:**

Use the `GetEscrow.cdc` script to verify that the escrow was created correctly.

```sh
flow scripts execute ./cadence/scripts/GetEscrow.cdc 1
```

**3. Claim the Escrow:**

Use the `ClaimEscrow.cdc` transaction to claim the escrow.

```sh
flow transactions send ./cadence/transactions/ClaimEscrow.cdc 1 --signer emulator-account
```

**4. Verify the Claim:**

Use the `GetEscrow.cdc` script again to verify that the escrow has been claimed. The `state` should now be `Claimed`.

**5. Refund an Expired Escrow:**

To test the refund functionality, create an escrow and wait for it to expire. Then, use the `RefundEscrow.cdc` transaction to refund the escrow.

```sh
# Create an escrow with a short expiry
flow transactions send ./cadence/transactions/CreateEscrow.cdc 0xf8d6e0586b0a20c7 10.0 10.0 "manual" --signer emulator-account

# Wait for the escrow to expire (e.g., 15 seconds)

# Refund the escrow
flow transactions send ./cadence/transactions/RefundEscrow.cdc 2 --signer emulator-account
```

**6. Verify the Refund:**

Use the `GetEscrow.cdc` script to verify that the escrow has been refunded. The `state` should now be `Refunded`.

## Future Improvements

*   **Support for Multiple Fungible Tokens:** Extend the contract to support escrows with other FTs, not just `FlowToken`.
*   **Milestone-Based Escrows:** Allow for more complex conditions than just time, such as milestone-based releases.
*   **Dispute Resolution:** Implement an optional dispute resolution mechanism.
*   **Frontend UI:** Build a user-friendly frontend to make interacting with the smart contracts easier for non-technical users.