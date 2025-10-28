import Test
import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"
import FlowVaultEscrow from "FlowVaultEscrow"

access(all) fun testScheduledRefund() {

    // --- Test Setup ---

    let sender = Test.createAccount()
    let receiver = Test.createAccount()

    // --- Contract Deployment ---

    let deployEscrowErr = Test.deployContract(
        name: "FlowVaultEscrow",
        path: "../contracts/FlowVaultEscrow.cdc",
        arguments: []
    )
    Test.expect(deployEscrowErr, Test.beNil())

    // --- Account Setup ---

    // Setup sender's account
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

    // --- Escrow Creation ---

        let expiry = getCurrentBlock().timestamp + 120.0 // Not expired
    let amount = 25.0

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
            "manual" // refundMode
        ]
    )
    let createEscrowResult = Test.executeTransaction(createEscrowTx)
    Test.expect(createEscrowResult, Test.beSucceeded())
}
