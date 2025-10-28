import FlowVaultEscrow from "FlowVaultEscrow"

access(all) fun main(): [UInt64] {
  return FlowVaultEscrow.getExpiredEscrows()
}


