import FungibleToken from "FungibleToken"
import FlowVaultEscrow from "FlowVaultEscrow"

transaction(escrowId: UInt64) {
  let receiverVault: &{FungibleToken.Receiver}

  prepare(signer:&Account) {
    self.receiverVault = signer.capabilities
      .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
      .borrow() ?? panic("missing receiver cap")
  }

  execute {
    FlowVaultEscrow.claimEscrow(id: escrowId, receiverVault: self.receiverVault)
  }
}


