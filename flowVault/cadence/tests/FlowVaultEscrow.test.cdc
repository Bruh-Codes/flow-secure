import Test
import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"
import FlowVaultEscrow from "FlowVaultEscrow"

// Test suite for the FlowVaultEscrow contract
access(all) fun testEscrowLifecycle() {

    // --- Test Setup ---

    // Create test accounts for sender and receiver
    let sender = Test.createAccount()
    let receiver = Test.createAccount()

    // --- Contract Deployment ---

    // Deploy the FlowVaultEscrow contract to the service account
    let deployErr = Test.deployContract(
        name: "FlowVaultEscrow",
        path: "../contracts/FlowVaultEscrow.cdc",
        arguments: []
    )
    Test.expect(deployErr, Test.beNil())

    // --- Account Setup ---

    // Setup sender's account with a FlowToken vault
    let setupSenderTx = Test.Transaction(
        code: 
            "import FungibleToken from \"FungibleToken\"\n"
            .concat("import FlowToken from \"FlowToken\"\n")
            .concat("\n")
            .concat("transaction {\n")
            .concat("    prepare(signer: auth(Storage, Capabilities) &Account) {\n")
            .concat("        if signer.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault) == nil {\n")
            .concat("            signer.storage.save(<-FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()), to: /storage/flowTokenVault)\n")
            .concat("            signer.capabilities.unpublish(/public/flowTokenReceiver)\n")
            .concat("            signer.capabilities.publish(\n")
            .concat("                signer.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault),\n")
            .concat("                at: /public/flowTokenReceiver\n")
            .concat("            )\n")
            .concat("            signer.capabilities.unpublish(/public/flowTokenBalance)\n")
            .concat("            signer.capabilities.publish(\n")
            .concat("                signer.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault),\n")
            .concat("                at: /public/flowTokenBalance\n")
            .concat("            )\n")
            .concat("        }\n")
            .concat("    }\n")
            .concat("}\n"),
        authorizers: [sender.address],
        signers: [sender],
        arguments: []
    )
    let setupSenderResult = Test.executeTransaction(setupSenderTx)
    Test.expect(setupSenderResult, Test.beSucceeded())

    // Mint tokens to sender
    let mintTx = Test.Transaction(
        code: 
            "import FungibleToken from \"FungibleToken\"\n"
            .concat("import FlowToken from \"FlowToken\"\n")
            .concat("\n")
            .concat("transaction(recipient: Address, amount: UFix64) {\n")
            .concat("    prepare(signer: auth(Storage, Capabilities) &Account) {\n")
            .concat("        let minter = signer.storage.borrow<&FlowToken.Minter>(from: /storage/flowTokenMinter) ?? panic(\"No minter in storage\")\n")
            .concat("        let recipientAccount = getAccount(recipient)\n")
            .concat("        let receiver = recipientAccount.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).borrow() ?? panic(\"Could not borrow receiver reference to the recipient's Vault\")\n")
            .concat("        let minted <- minter.mintTokens(amount: amount)\n")
            .concat("        receiver.deposit(from: <-minted)\n")
            .concat("    }\n")
            .concat("}\n"),
        authorizers: [Test.serviceAccount().address],
        signers: [Test.serviceAccount()],
        arguments: [sender.address, 100.0]
    )
    let mintResult = Test.executeTransaction(mintTx)
    Test.expect(mintResult, Test.beSucceeded())

    // Setup receiver's account with a FlowToken vault
    let setupReceiverTx = Test.Transaction(
        code: 
            "import FungibleToken from \"FungibleToken\"\n"
            .concat("import FlowToken from \"FlowToken\"\n")
            .concat("\n")
            .concat("transaction {\n")
            .concat("    prepare(signer: auth(Storage, Capabilities) &Account) {\n")
            .concat("        if signer.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault) == nil {\n")
            .concat("            signer.storage.save(<-FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()), to: /storage/flowTokenVault)\n")
            .concat("            signer.capabilities.unpublish(/public/flowTokenReceiver)\n")
            .concat("            signer.capabilities.publish(\n")
            .concat("                signer.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault),\n")
            .concat("                at: /public/flowTokenReceiver\n")
            .concat("            )\n")
            .concat("            signer.capabilities.unpublish(/public/flowTokenBalance)\n")
            .concat("            signer.capabilities.publish(\n")
            .concat("                signer.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault),\n")
            .concat("                at: /public/flowTokenBalance\n")
            .concat("            )\n")
            .concat("        }\n")
            .concat("    }\n")
            .concat("}\n"),
        authorizers: [receiver.address],
        signers: [receiver],
        arguments: []
    )
    let setupReceiverResult = Test.executeTransaction(setupReceiverTx)
    Test.expect(setupReceiverResult, Test.beSucceeded())

    // --- Escrow Creation ---

    // Set an expiry time 120 seconds in the future
    let expiry = getCurrentBlock().timestamp + 120.0
    let amount = 25.0

    // Create a new escrow
    let createEscrowTx = Test.Transaction(
        code:
            "import FungibleToken from \"FungibleToken\"\n"
            .concat("import FlowToken from \"FlowToken\"\n")
            .concat("import FlowVaultEscrow from \"FlowVaultEscrow\"\n")
            .concat("\n")
            .concat("transaction(receiver: Address, amount: UFix64, expiry: UFix64, refundMode: String) {\n")
            .concat("    let payment: @{FungibleToken.Vault}\n")
            .concat("    let sender: Address\n")
            .concat("    prepare(signer:  auth(Storage, Capabilities) &Account) {\n")
            .concat("        self.sender = signer.address\n")
            .concat("        let vaultRef: auth(FungibleToken.Withdraw) &FlowToken.Vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault) ?? panic(\"Could not borrow reference to the FlowToken vault\")\n")
            .concat("        self.payment <- vaultRef.withdraw(amount: amount)\n")
            .concat("    }\n")
            .concat("    execute {\n")
            .concat("        let result: UInt64 =  FlowVaultEscrow.createEscrow(payment: <-self.payment, sender: self.sender, receiver: receiver, expiry: expiry, refundMode: refundMode)\n")
            .concat("    }\n")
            .concat("}\n"),
        authorizers: [sender.address],
        signers: [sender],
        arguments: [
            receiver.address,
            amount,
            expiry,
            "auto" // refundMode
        ]
    )
    let createEscrowResult: Test.TransactionResult = Test.executeTransaction(createEscrowTx)
    Test.expect(createEscrowResult, Test.beSucceeded())

    

        // --- Verification ---

    

        // Verify that the escrow was created correctly

         let escrowResult = Test.executeScript(

              

                 "import FlowVaultEscrow from \"../contracts/FlowVaultEscrow.cdc\"\n"

                 .concat("\n")

                 .concat("access(all) fun main(escrowId: UInt64): FlowVaultEscrow.Escrow? {\n")

                 .concat("  return FlowVaultEscrow.getEscrow(id: escrowId)\n")

                 .concat("}\n"),

             [UInt64(1)]

         )

         Test.expect(escrowResult, Test.beSucceeded())

        

         let escrow = escrowResult.returnValue as! FlowVaultEscrow.Escrow

         Test.assert(sender.address == escrow.sender)

         Test.assert(receiver.address == escrow.receiver)

         Test.assert(amount == escrow.amount)

         Test.assert(FlowVaultEscrow.EscrowState.Active == escrow.state)

    

        // --- Escrow Claim ---

    

        // Claim the escrow as the receiver

        let claimEscrowTx = Test.Transaction(

            code:
                "import FungibleToken from \"FungibleToken\"\n"

            .concat("import FlowVaultEscrow from \"FlowVaultEscrow\"\n")

            .concat("\n")

            .concat("transaction(escrowId: UInt64) {\n")

            .concat("  let receiverVault: &{FungibleToken.Receiver}\n")

            .concat("\n")

            .concat("  prepare(signer:&Account) {\n")

            .concat("    self.receiverVault = signer.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).borrow() ?? panic(\"missing receiver cap\")\n")

            .concat("  }\n")

            .concat("\n")

            .concat("  execute {\n")

            .concat("    FlowVaultEscrow.claimEscrow(id: escrowId, receiverVault: self.receiverVault)\n")

            .concat("  }\n")

            .concat("}\n"),

            authorizers: [receiver.address],

            signers: [receiver],

            arguments: [UInt64(1)] // Escrow ID

        )

        let claimEscrowResult = Test.executeTransaction(claimEscrowTx)

        Test.expect(claimEscrowResult, Test.beSucceeded())

    

        // --- Verification ---

    

        // Verify the escrow is now claimed

        let claimedEscrowResult = Test.executeScript(

            "import FlowVaultEscrow from \"../contracts/FlowVaultEscrow.cdc\"\n"

            .concat("\n")

            .concat("access(all) fun main(escrowId: UInt64): FlowVaultEscrow.Escrow? {\n")

            .concat("  return FlowVaultEscrow.getEscrow(id: escrowId)\n")

            .concat("}\n"),

            [UInt64(1)]

        )

        let claimedEscrow = claimedEscrowResult.returnValue as! FlowVaultEscrow.Escrow

        Test.assert(FlowVaultEscrow.EscrowState.Claimed == claimedEscrow.state, message: "escrow state should be Claimed")

    

        // Verify receiver's balance

        let receiverBalanceResult = Test.executeScript(

            "import FungibleToken from \"FungibleToken\"\n"

            .concat("access(all) fun main(address: Address): UFix64 {\n")

            .concat("    let vaultRef = getAccount(address).capabilities.get<&{FungibleToken.Balance}>(/public/flowTokenBalance).borrow() ?? panic(\"Could not borrow Balance capability\")\n")

            .concat("    return vaultRef.balance\n")

            .concat("}\n"),

            [receiver.address]

        )

        Test.expect(receiverBalanceResult, Test.beSucceeded())

        Test.assert(amount == receiverBalanceResult.returnValue as! UFix64, message: "receiver balance should be equal to the amount claimed")

        

        // --- Escrow Refund Test ---

    

        // Create a second escrow that will be refunded

        let expiryRefund = getCurrentBlock().timestamp + 120.0

        let amountRefund = 15.0

    

        let createEscrowRefundTx = Test.Transaction(

            code:

                "import FungibleToken from \"FungibleToken\"\n"

                .concat("import FlowToken from \"FlowToken\"\n")

                .concat("import FlowVaultEscrow from \"FlowVaultEscrow\"\n")

                .concat("\n")

                .concat("transaction(receiver: Address, amount: UFix64, expiry: UFix64, refundMode: String) {\n")

                .concat("    let payment: @{FungibleToken.Vault}\n")

                .concat("    let sender: Address\n")

                .concat("    prepare(signer:  auth(Storage, Capabilities) &Account) {\n")

                .concat("        self.sender = signer.address\n")

                .concat("        let vaultRef: auth(FungibleToken.Withdraw) &FlowToken.Vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault) ?? panic(\"Could not borrow reference to the FlowToken vault\")\n")

                .concat("        self.payment <- vaultRef.withdraw(amount: amount)\n")

                .concat("    }\n")

                .concat("    execute {\n")

                .concat("        let result: UInt64 =  FlowVaultEscrow.createEscrow(payment: <-self.payment, sender: self.sender, receiver: receiver, expiry: expiry, refundMode: refundMode)\n")

                .concat("    }\n")

                .concat("}\n"),

            authorizers: [sender.address],

            signers: [sender],

            arguments: [

                receiver.address,

                amountRefund,

                expiryRefund,

                "auto"

            ]

        )

        let createEscrowRefundResult = Test.executeTransaction(createEscrowRefundTx)

        Test.expect(createEscrowRefundResult, Test.beSucceeded())

    

        // Advance the clock to expire the escrow

        Test.moveTime(by: 121.0)

    

        // Refund the escrow

        let refundEscrowTx = Test.Transaction(

            code:

                "import FlowVaultEscrow from \"FlowVaultEscrow\"\n"

                .concat("\n")

                .concat("transaction(escrowId: UInt64) {\n")

                .concat("  prepare(signer: &Account) {}")

                .concat("\n")

                .concat("  execute {\n")

                .concat("    FlowVaultEscrow.refundEscrow(id: escrowId)\n")

                .concat("  }\n")

                .concat("}\n"),

            authorizers: [sender.address], // Anyone can call this

            signers: [sender],

            arguments: [UInt64(2)] // Escrow ID

        )

        let refundEscrowResult = Test.executeTransaction(refundEscrowTx)

        Test.expect(refundEscrowResult, Test.beSucceeded())

    

        // --- Verification ---

    

        // Verify the escrow is now refunded

        let refundedEscrowResult = Test.executeScript(

            "import FlowVaultEscrow from \"../contracts/FlowVaultEscrow.cdc\"\n"

            .concat("\n")

            .concat("access(all) fun main(escrowId: UInt64): FlowVaultEscrow.Escrow? {\n")

            .concat("  return FlowVaultEscrow.getEscrow(id: escrowId)\n")

            .concat("}\n"),

            [UInt64(2)]

        )

        let refundedEscrow = refundedEscrowResult.returnValue as! FlowVaultEscrow.Escrow

        Test.assert(FlowVaultEscrow.EscrowState.Refunded == refundedEscrow.state, message: "escrow state should be Refunded")

    }

    