import FlowVaultEscrow from "FlowVaultEscrow"

access(all) fun main(escrowId: UInt64): Bool {
  return FlowVaultEscrow.isClaimable(id: escrowId)
}


