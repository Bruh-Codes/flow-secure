import FlowVaultEscrow from "FlowVaultEscrow"

access(all) fun main(): [FlowVaultEscrow.Escrow] {
  return FlowVaultEscrow.getActiveEscrows()
}


