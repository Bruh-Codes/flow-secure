import * as fcl from "@onflow/fcl";

// Configure Flow for testnet
fcl.config({
  "flow.network": "testnet",
  "app.detail.title": "SecureTransfer",
  "app.detail.icon": "https://placekitten.com/g/200/200",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
  "0xFungibleToken": "0x9a0766d93b6608b7",
  "0xFlowToken": "0x7e60df042a9c0868",
  "0xFlowVaultEscrow": "0xa72b13062e901c7c",
});

export default fcl;
