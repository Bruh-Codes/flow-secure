// FlowVaultEscrow - Complete Cadence 1.0 Contract with Forte Actions
// Supports FlowToken escrows with automated refunds using Flow's native Forte

import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"

access(all) contract FlowVaultEscrow {

    // --- Enums & Structs ---
    
    access(all) enum EscrowState: UInt8 {
        access(all) case Active
        access(all) case Claimed
        access(all) case Refunded
    }

    access(all) struct Escrow {
        access(all) let id: UInt64
        access(all) let sender: Address
        access(all) let receiver: Address
        access(all) let amount: UFix64
        access(all) let expiry: UFix64
        access(all) var state: EscrowState 
        access(all) let isNative: Bool
        access(all) let createdAt: UFix64
        access(all) let refundMode: String  // "manual" or "auto"

        init(
            id: UInt64,
            sender: Address,
            receiver: Address,
            amount: UFix64,
            expiry: UFix64,
            isNative: Bool,
            refundMode: String
        ) {
            self.id = id
            self.sender = sender
            self.receiver = receiver
            self.amount = amount
            self.expiry = expiry
            self.state = EscrowState.Active
            self.isNative = isNative
            self.createdAt = getCurrentBlock().timestamp
            self.refundMode = refundMode  // Default to auto refund
        }

        // Setter function for state
        access(contract) fun setState(_ newState: EscrowState) {
            self.state = newState
        }
    }

    // --- Storage ---
    
    access(self) var nextEscrowId: UInt64
    access(self) var escrows: {UInt64: Escrow}
    access(self) var escrowVaults: @{UInt64: {FungibleToken.Vault}}

    // --- Storage Paths ---
    access(all) let EscrowStoragePath: StoragePath
    access(all) let EscrowPublicPath: PublicPath

    // --- Events ---
    
    access(all) event EscrowCreated(
        id: UInt64, 
        sender: Address, 
        receiver: Address, 
        amount: UFix64, 
        expiry: UFix64
    )
    access(all) event EscrowClaimed(
        id: UInt64, 
        receiver: Address, 
        when: UFix64
    )
    access(all) event EscrowRefunded(
        id: UInt64, 
        sender: Address, 
        when: UFix64
    )
    access(all) event BatchRefundExecuted(
        count: Int, 
        when: UFix64
    )

    // --- Initialize ---
    
    init() {
        self.nextEscrowId = 1
        self.escrows = {}
        self.escrowVaults <- {}
        
        self.EscrowStoragePath = /storage/FlowVaultEscrow
        self.EscrowPublicPath = /public/FlowVaultEscrow
    }

    // --- Core Functions ---

    /// Create a new escrow with FlowToken
    access(all) fun createEscrow(
        payment: @{FungibleToken.Vault},
        sender: Address,
        receiver: Address,
        expiry: UFix64,
        refundMode: String // "manual" or "auto"
    ): UInt64 {
        pre {
            payment.balance > 0.0: "Amount must be greater than 0"
            expiry > getCurrentBlock().timestamp + 60.0: "Expiry must be at least 60 seconds in the future"
            receiver != sender: "Receiver cannot be sender"
        }

        let amount = payment.balance
        let id = self.nextEscrowId
        self.nextEscrowId = id + 1

        // Create escrow record
        let escrow = Escrow(
            id: id,
            sender: sender,
            receiver: receiver,
            amount: amount,
            expiry: expiry,
            isNative: true,
            refundMode: refundMode
        )
        self.escrows[id] = escrow

        // Store the tokens
        self.escrowVaults[id] <-! payment

        emit EscrowCreated(
            id: id, 
            sender: sender, 
            receiver: receiver, 
            amount: amount, 
            expiry: expiry
        )

        return id
    }

    /// Claim escrow funds (receiver only, before expiry)
    access(all) fun claimEscrow(id: UInt64, receiverVault: &{FungibleToken.Receiver}) {
        pre {
            self.escrows.containsKey(id): "Escrow not found"
        }

        let escrow = self.escrows[id]!
        let currentTime = getCurrentBlock().timestamp

        // Validate claim conditions
        assert(escrow.state == EscrowState.Active, message: "Escrow is not active")
        assert(currentTime <= escrow.expiry, message: "Escrow has expired")
        assert(receiverVault.owner!.address == escrow.receiver, message: "Only receiver can claim")

        // Update state using setter
        escrow.setState(EscrowState.Claimed)
        self.escrows[id] = escrow

        // Transfer funds to receiver
        let vault <- self.escrowVaults.remove(key: id)!
        receiverVault.deposit(from: <-vault)

        emit EscrowClaimed(id: id, receiver: escrow.receiver, when: currentTime)
    }

    /// Refund a single escrow (after expiry, callable by anyone)
    access(all) fun refundEscrow(id: UInt64) {
        pre {
            self.escrows.containsKey(id): "Escrow not found"
        }

        let escrow = self.escrows[id]!
        let currentTime = getCurrentBlock().timestamp

        // Validate refund conditions
        assert(escrow.state == EscrowState.Active, message: "Escrow is not active")
        assert(currentTime > escrow.expiry, message: "Escrow has not expired yet")

        // Update state using setter
        escrow.setState(EscrowState.Refunded)
        self.escrows[id] = escrow

        // Get sender's vault capability using Capability Controllers API
        let senderAccount = getAccount(escrow.sender)
        let receiverCap = senderAccount.capabilities
            .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .borrow()
            ?? panic("Sender vault capability not found")

        // Transfer funds back to sender
        let vault <- self.escrowVaults.remove(key: id)!
        receiverCap.deposit(from: <-vault)

        emit EscrowRefunded(id: id, sender: escrow.sender, when: currentTime)
    }

    // --- FORTE ACTION: Batch Refund ---

    /// Refund all expired escrows in one transaction
    /// This is called by Forte Agent on schedule
    access(all) fun refundAllExpired(): Int {
        let expiredIds = self.getExpiredEscrows()
        var refundCount = 0
        let currentTime = getCurrentBlock().timestamp
        
        for id in expiredIds {
            // Try to refund each expired escrow
            let escrow = self.escrows[id]!
            
            // Double check it's still active and expired
            if escrow.state == EscrowState.Active && currentTime > escrow.expiry && escrow.refundMode.toLower() == "auto" {
                // Update state using setter
                escrow.setState(EscrowState.Refunded)
                self.escrows[id] = escrow
                
                // Get sender's vault using Capability Controllers API
                let senderAccount = getAccount(escrow.sender)
                let receiverCapOptional = senderAccount.capabilities
                    .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                    .borrow()
                
                if let receiverCap = receiverCapOptional {
                    // Transfer funds back
                    let vault <- self.escrowVaults.remove(key: id)!
                    receiverCap.deposit(from: <-vault)
                    
                    emit EscrowRefunded(id: id, sender: escrow.sender, when: currentTime)
                    refundCount = refundCount + 1
                } else {
                    // If vault not found, restore the vault and revert state
                    let vault <- self.escrowVaults.remove(key: id)!
                    self.escrowVaults[id] <-! vault
                    escrow.setState(EscrowState.Active)
                    self.escrows[id] = escrow
                }
            }
        }
        
        if refundCount > 0 {
            emit BatchRefundExecuted(count: refundCount, when: currentTime)
        }
        
        return refundCount
    }

    // --- Query Functions ---

    /// Get a single escrow by ID
    access(all) fun getEscrow(id: UInt64): Escrow? {
        return self.escrows[id]
    }

    /// Get all expired escrow IDs
    access(all) fun getExpiredEscrows(): [UInt64] {
        let expired: [UInt64] = []
        let currentTime = getCurrentBlock().timestamp
        
        for id in self.escrows.keys {
            let escrow = self.escrows[id]!
            if escrow.state == EscrowState.Active && currentTime > escrow.expiry {
                expired.append(id)
            }
        }
        
        return expired
    }

    /// Get all active escrows
    access(all) fun getActiveEscrows(): [Escrow] {
        let active: [Escrow] = []
        
        for escrow in self.escrows.values {
            if escrow.state == EscrowState.Active {
                active.append(escrow)
            }
        }
        
        return active
    }

    /// Get escrows by sender
    access(all) fun getEscrowsBySender(sender: Address): [Escrow] {
        let result: [Escrow] = []
        
        for escrow in self.escrows.values {
            if escrow.sender == sender {
                result.append(escrow)
            }
        }
        
        return result
    }

    /// Get escrows by receiver
    access(all) fun getEscrowsByReceiver(receiver: Address): [Escrow] {
        let result: [Escrow] = []
        
        for escrow in self.escrows.values {
            if escrow.receiver == receiver {
                result.append(escrow)
            }
        }
        
        return result
    }

    /// Check if an escrow is claimable
    access(all) fun isClaimable(id: UInt64): Bool {
        if let escrow = self.escrows[id] {
            return escrow.state == EscrowState.Active && 
                   getCurrentBlock().timestamp <= escrow.expiry
        }
        return false
    }

    /// Check if an escrow is refundable
    access(all) fun isRefundable(id: UInt64): Bool {
        if let escrow = self.escrows[id] {
            return escrow.state == EscrowState.Active && 
                   getCurrentBlock().timestamp > escrow.expiry
        }
        return false
    }

    /// Get total number of escrows
    access(all) fun getTotalEscrows(): UInt64 {
        return self.nextEscrowId - 1
    }

    /// Get statistics
    access(all) fun getStats(): {String: Int} {
        var activeCount = 0
        var claimedCount = 0
        var refundedCount = 0
        var expiredCount = 0
        let currentTime = getCurrentBlock().timestamp
        
        for escrow in self.escrows.values {
            switch escrow.state {
                case EscrowState.Active:
                    activeCount = activeCount + 1
                    if currentTime > escrow.expiry {
                        expiredCount = expiredCount + 1
                    }
                case EscrowState.Claimed:
                    claimedCount = claimedCount + 1
                case EscrowState.Refunded:
                    refundedCount = refundedCount + 1
            }
        }
        
        return {
            "total": self.escrows.length,
            "active": activeCount,
            "claimed": claimedCount,
            "refunded": refundedCount,
            "expired": expiredCount
        }
    }
}