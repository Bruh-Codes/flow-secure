import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        if signer.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault) == nil {
            signer.storage.save(<-FlowToken.createEmptyVault(), to: /storage/flowTokenVault)
            signer.capabilities.unpublish(/public/flowTokenReceiver)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault),
                at: /public/flowTokenReceiver
            )
            signer.capabilities.unpublish(/public/flowTokenBalance)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault),
                at: /public/flowTokenBalance
            )
        }
    }
}
