import FlowVaultEscrow from "FlowVaultEscrow"

transaction(escrowId: UInt64) {
  prepare(signer: &Account) {}

  execute {
    FlowVaultEscrow.refundEscrow(id: escrowId)
  }
}


