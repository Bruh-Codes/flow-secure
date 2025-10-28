import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"
import FlowVaultEscrow from "FlowVaultEscrow"

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