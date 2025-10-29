import FlowVaultEscrow from "FlowVaultEscrow"

transaction(escrowId: UInt64,senderAddress:Address) {
  prepare(signer: &Account) {}

  execute {
    FlowVaultEscrow.refundEscrow(id: escrowId,signerAddress:senderAddress)
  }
}


