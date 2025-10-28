
import FlowTransactionScheduler from "FlowTransactionScheduler"
import FlowTransactionSchedulerUtils from "FlowTransactionSchedulerUtils"
import FlowToken from "FlowToken"
import FungibleToken from "FungibleToken"

/// Schedule a single execution of the EscrowRefundHandler after `delaySeconds`
transaction(delaySeconds: UFix64, priority: UInt8, executionEffort: UInt64) {

    // IMPORTANT: use AuthAccount here so we can borrow/save from storage
     prepare(signer: auth(Storage, Capabilities) &Account) {

        // 1) Ensure a Manager is initialized in the signer's account
                if !signer.storage.check<@{FlowTransactionSchedulerUtils.Manager}>(from: FlowTransactionSchedulerUtils.managerStoragePath) {
            let manager: @{FlowTransactionSchedulerUtils.Manager} <- FlowTransactionSchedulerUtils.createManager()
            signer.storage.save(<-manager, to: FlowTransactionSchedulerUtils.managerStoragePath)

            let managerCap: Capability<&{FlowTransactionSchedulerUtils.Manager}> = signer.capabilities.storage
                .issue<&{FlowTransactionSchedulerUtils.Manager}>(FlowTransactionSchedulerUtils.managerStoragePath)

            signer.capabilities.publish(managerCap, at: FlowTransactionSchedulerUtils.managerPublicPath)
            log("Created and published Manager capability.")
        } else {
            log("Manager already present.")
        }

        // 2) Get the handler capability
        var handlerCap: Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>? = nil
        let controllers = signer.capabilities.storage.getControllers(forPath: /storage/EscrowRefundHandler)

        if controllers.length == 0 {
            panic("❌ Handler controllers not found. Run InitEscrowRefundHandler first.")
        }

        if let c = controllers[0].capability as? Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}> {
            handlerCap = c
        } else if controllers.length > 1 {
            handlerCap = controllers[1].capability as! Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>
        } else {
            panic("❌ Could not resolve handler capability.")
        }

        // 3) Prepare schedule parameters
        let future: UFix64 = getCurrentBlock().timestamp + delaySeconds

        let pr: FlowTransactionScheduler.Priority = 
            priority == 0 ? FlowTransactionScheduler.Priority.High :
            priority == 1 ? FlowTransactionScheduler.Priority.Medium :
            FlowTransactionScheduler.Priority.Low

        let transactionData: AnyStruct? = nil

        // 4) Estimate the fee and withdraw it from signer's FlowToken vault
        let est: FlowTransactionScheduler.EstimatedScheduledTransaction = FlowTransactionScheduler.estimate(
            data: transactionData,
            timestamp: future,
            priority: pr,
            executionEffort: executionEffort
        )

        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the FlowToken vault")

        let feeAmount: UFix64 = est.flowFee ?? 0.0
        let fees: @FlowToken.Vault <- vaultRef.withdraw(amount: feeAmount) as! @FlowToken.Vault

        // 5) Borrow manager and schedule the handler
         let managerRef: auth(FlowTransactionSchedulerUtils.Owner) &{FlowTransactionSchedulerUtils.Manager} = signer.storage.borrow<auth(FlowTransactionSchedulerUtils.Owner) &{FlowTransactionSchedulerUtils.Manager}>(
            from: FlowTransactionSchedulerUtils.managerStoragePath
        ) ?? panic("Could not borrow the scheduler manager from storage")

        let result: UInt64 = managerRef.schedule(
            handlerCap: handlerCap!,
            data: transactionData,
            timestamp: future,
            priority: pr,
            executionEffort: executionEffort,
            fees: <-fees
        )

        log("✅ EscrowRefundHandler scheduled for timestamp: ".concat(future.toString()))
    }

    execute {
        log("Schedule transaction submitted.")
    }
}



















