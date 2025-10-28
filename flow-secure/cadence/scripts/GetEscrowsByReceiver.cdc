import FlowVaultEscrow from "../contracts/FlowVaultEscrow.cdc"

access(all) fun main(receiver: Address): [FlowVaultEscrow.Escrow] {
  return FlowVaultEscrow.getEscrowsByReceiver(receiver: receiver)
}