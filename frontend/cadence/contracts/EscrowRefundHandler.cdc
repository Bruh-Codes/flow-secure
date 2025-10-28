import FlowTransactionScheduler from "FlowTransactionScheduler"
import FlowVaultEscrow from "FlowVaultEscrow"

access(all) contract EscrowRefundHandler {

    // Handler resource the scheduler will call
    access(all) resource Handler: FlowTransactionScheduler.TransactionHandler {

        // This runs when the scheduled transaction is executed
        access(FlowTransactionScheduler.Execute) fun executeTransaction(id: UInt64, data: AnyStruct?) {
            // Call your escrow contract function that refunds expired escrows
            let result: Int = FlowVaultEscrow.refundAllExpired()


            log("EscrowRefundHandler executed; scheduled id: ".concat(id.toString()))
        }

        // Metadata views (required by examples in the docs)
        access(all) view fun getViews(): [Type] {
            return [Type<StoragePath>(), Type<PublicPath>()]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<StoragePath>():
                    return /storage/EscrowRefundHandler
                case Type<PublicPath>():
                    return /public/EscrowRefundHandler
                default:
                    return nil
            }
        }
    }

    // Factory to create a Handler resource
    access(all) fun createHandler(): @Handler {
        return <- create Handler()
    }
}
