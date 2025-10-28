import FlowVaultEscrow from "../contracts/FlowVaultEscrow.cdc"

access(all) fun main(sender: Address): [FlowVaultEscrow.Escrow] {
  return FlowVaultEscrow.getEscrowsBySender(sender: sender)
}