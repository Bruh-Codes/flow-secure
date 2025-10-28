import FlowVaultEscrow from "../contracts/FlowVaultEscrow.cdc"

access(all) fun main(escrowId: UInt64): FlowVaultEscrow.Escrow? {
  return FlowVaultEscrow.getEscrow(id: escrowId)
}