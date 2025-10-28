import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export interface Escrow {
	id: string;
	sender: string;
	receiver: string;
	amount: string;
	expiry: string;
	state: "Active" | "Claimed" | "Refunded";
	isNativeToken: boolean;
	createdAt: string;
	refundMode: string;
}

export const useFlowEscrow = () => {
	const [escrows, setEscrows] = useState<Escrow[]>([]);
	const [stats, setStats] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(false);

	const fetchActiveEscrows = async () => {
		try {
			const result = await fcl.query({
				cadence: `
        import FlowVaultEscrow from 0xa72b13062e901c7c

        access(all) fun main(): [FlowVaultEscrow.Escrow] {
            return FlowVaultEscrow.getActiveEscrows()
        }
        `,
			});
			setEscrows(result || []);
			return result || [];
		} catch (error) {
			console.error("Error fetching active escrows:", error);
			return [];
		}
	};

	//not used now
	const fetchEscrowsBySender = async (sender: string) => {
		try {
			const result = await fcl.query({
				cadence: `
        
        access(all) fun getEscrowsBySender(sender: Address): [Escrow] {
        let result: [Escrow] = []
        
        for escrow in self.escrows.values {
            if escrow.sender == sender {
                result.append(escrow)
            }
        }
        
        return result
        
    }
        `,
				args: (arg, t) => [arg(sender, t.Address)],
			});
			return result || [];
		} catch (error) {
			console.error("Error fetching escrows by sender:", error);
			return [];
		}
	};

	//not used now
	const fetchEscrowsByReceiver = async (receiver: string) => {
		try {
			const result = await fcl.query({
				cadence: `
        
        access(all) fun getEscrowsBySender(sender: Address): [Escrow] {
        let result: [Escrow] = []
        
        for escrow in self.escrows.values {
            if escrow.sender == sender {
                result.append(escrow)
            }
        }
        
        return result
    }
        `,
				args: (arg, t) => [arg(receiver, t.Address)],
			});
			return result || [];
		} catch (error) {
			console.error("Error fetching escrows by receiver:", error);
			return [];
		}
	};
	// not used now
	const fetchStats = async () => {
		try {
			const result = await fcl.query({
				cadence: `
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
        `,
			});
			setStats(result || {});
			return result || {};
		} catch (error) {
			console.error("Error fetching stats:", error);
			return {};
		}
	};
	// not used now
	const checkIsClaimable = async (id: string) => {
		try {
			const result = await fcl.query({
				cadence: `
        access(all) fun isClaimable(id: UInt64): Bool {
        if let escrow = self.escrows[id] {
            return escrow.state == EscrowState.Active && 
                   getCurrentBlock().timestamp <= escrow.expiry
        }
        return false
    }
        `,
				args: (arg, t) => [arg(id, t.UInt64)],
			});
			return result;
		} catch (error) {
			console.error("Error checking claimable:", error);
			return false;
		}
	};
	// not used now
	const checkIsRefundable = async (id: string) => {
		try {
			const result = await fcl.query({
				cadence: `
        
        access(all) fun isRefundable(id: UInt64): Bool {
        if let escrow = self.escrows[id] {
            return escrow.state == EscrowState.Active && 
                   getCurrentBlock().timestamp > escrow.expiry
        }
        return false
    }
        `,
				args: (arg, t) => [arg(id, t.UInt64)],
			});
			return result;
		} catch (error) {
			console.error("Error checking refundable:", error);
			return false;
		}
	};

	//used now
	const createEscrow = async (
		amount: string,
		receiver: string,
		expirySeconds: number,
		refundMode: "manual" | "auto"
	) => {
		setLoading(true);
		try {
			const formattedAmount = parseFloat(amount).toFixed(8);
			const expiry = Number(Date.now() / 1000 + expirySeconds).toFixed(8);

			console.log("formattedAmount:", formattedAmount, typeof formattedAmount);
			console.log("expiry:", expiry, typeof expiry);

			const txId = await fcl.mutate({
				cadence: `
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import FlowVaultEscrow from 0xa72b13062e901c7c

transaction(receiver: Address, amount: UFix64, expiry: UFix64, refundMode: String) {

    let payment: @{FungibleToken.Vault}
    let sender: Address

    prepare(signer:  auth(Storage, Capabilities) &Account) {
        self.sender = signer.address
        let vaultRef: auth(FungibleToken.Withdraw) &FlowToken.Vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the FlowToken vault")
        self.payment <- vaultRef.withdraw(amount: amount)
    }

    execute {
        let result: UInt64 =  FlowVaultEscrow.createEscrow(
            payment: <-self.payment,
            sender: self.sender,
            receiver: receiver,
            expiry: expiry,
            refundMode: refundMode
        )
    }
}
        `,
				args: (arg, t) => [
					arg(receiver, t.Address),
					arg(formattedAmount, t.UFix64),
					arg(expiry, t.UFix64),
					arg(refundMode, t.String),
				],
				limit: 9999,
			});

			await fcl.tx(txId).onceSealed();
			await fetchActiveEscrows();
			return txId;
		} catch (error) {
			console.error("Error creating escrow:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	//used now
	const claimEscrow = async (id: string) => {
		setLoading(true);
		try {
			const txId = await fcl.mutate({
				cadence: `
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import FlowVaultEscrow from 0xa72b13062e901c7c

transaction(id: UInt64) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        let receiverVault = signer.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .borrow()
            ?? panic("Could not borrow receiver vault reference")

        FlowVaultEscrow.claimEscrow(id: id, receiverVault: receiverVault)
    }

    execute {
        // All logic is in prepare
    }
}`,
				args: (arg, t) => [arg(id, t.UInt64)],
				limit: 9999,
			});

			await fcl.tx(txId).onceSealed();
			await fetchActiveEscrows();
			return txId;
		} catch (error) {
			console.error("Error claiming escrow:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};
	//used now
	const refundEscrow = async (id: string) => {
		setLoading(true);
		try {
			const txId = await fcl.mutate({
				cadence: `
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
        `,
				args: (arg, t) => [arg(id, t.UInt64)],
				limit: 9999,
			});

			await fcl.tx(txId).onceSealed();
			await fetchActiveEscrows();
			return txId;
		} catch (error) {
			console.error("Error refunding escrow:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	return {
		escrows,
		stats,
		loading,
		fetchActiveEscrows,
		fetchEscrowsBySender,
		fetchEscrowsByReceiver,
		fetchStats,
		checkIsClaimable,
		checkIsRefundable,
		createEscrow,
		claimEscrow,
		refundEscrow,
	};
};
