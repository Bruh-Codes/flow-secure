import FlowVaultEscrow from "FlowVaultEscrow"

transaction {
  prepare(signer: &Account) {}

  execute {
    let _: Int = FlowVaultEscrow.refundAllExpired()
     log("Batch refund executed. Count: ".concat(_.toString()))
  }
}


