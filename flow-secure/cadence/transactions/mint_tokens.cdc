import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"

transaction(recipient: Address, amount: UFix64) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        let minter = signer.storage.borrow<&FlowToken.Minter>(from: /storage/flowTokenMinter)
            ?? panic("No minter in storage")
        let recipientAccount = getAccount(recipient)
        let receiver = recipientAccount.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).borrow()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
        let minted <- minter.mintTokens(amount: amount)
        receiver.deposit(from: <-minted)
    }
}
