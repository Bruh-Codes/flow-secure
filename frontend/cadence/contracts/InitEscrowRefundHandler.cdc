import EscrowRefundHandler from "EscrowRefundHandler"
import FlowTransactionScheduler from "FlowTransactionScheduler"

transaction() {
    prepare(signer: auth(Storage, Capabilities) &Account) {

        // Save a handler resource to storage if not already present
        if signer.storage.borrow<&AnyResource>(from: /storage/EscrowRefundHandler) == nil {
            let handler <- EscrowRefundHandler.createHandler()
            signer.storage.save(<-handler, to: /storage/EscrowRefundHandler)
        }

        // Issue an entitled capability for the scheduler (private controller)
        let _: Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}> = signer.capabilities.storage
            .issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(/storage/EscrowRefundHandler)

        // Issue a non-entitled public capability so other parties can discover it
        let publicCap: Capability<&{FlowTransactionScheduler.TransactionHandler}> = signer.capabilities.storage
            .issue<&{FlowTransactionScheduler.TransactionHandler}>(/storage/EscrowRefundHandler)

        signer.capabilities.publish(publicCap, at: /public/EscrowRefundHandler)
    }
}
