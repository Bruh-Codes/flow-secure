import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"

transaction(amount: UFix64, recipient: Address) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        let minter: &FlowToken.Minter = signer.storage.borrow<&FlowToken.Minter>(from: /storage/flowTokenMinter)
            ?? panic("No minter in storage")
        let recipientAccount: &Account = getAccount(recipient)
        let receiver: &{FungibleToken.Receiver} = recipientAccount.capabilities
            .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        let minted: @FlowToken.Vault <- minter.mintTokens(amount: amount)
        receiver.deposit(from: <-minted)
    }
}
