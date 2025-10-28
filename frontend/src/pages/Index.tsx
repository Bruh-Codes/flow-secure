import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletConnection } from "@/components/WalletConnection";
import { SendTokensForm } from "@/components/SendTokensForm";
import { ClaimTokensForm } from "@/components/ClaimTokensForm";
import { TransactionList } from "@/components/TransactionList";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as fcl from "@onflow/fcl";
import "@/config/flow";
import { useFlowEscrow } from "@/hooks/useFlowEscrow";
import { ModeToggle } from "@/components/dark-mode-toggle";

const Index = () => {
	const [isWalletConnected, setIsWalletConnected] = useState(false);
	const [walletAddress, setWalletAddress] = useState("");
	const { toast } = useToast();
	const {
		escrows,
		fetchActiveEscrows,
		fetchEscrowsBySender,
		fetchEscrowsByReceiver,
	} = useFlowEscrow();

	// Listen to Flow wallet connection state
	useEffect(() => {
		const unsubscribe = fcl.currentUser().subscribe((user) => {
			if (user?.addr) {
				setWalletAddress(user.addr);
				setIsWalletConnected(true);
				if (!walletAddress) {
					toast({
						title: "Wallet Connected",
						description: "Your Flow wallet has been successfully connected.",
					});
				}
			} else {
				setWalletAddress("");
				setIsWalletConnected(false);
			}
		});

		return () => unsubscribe();
	}, [toast, walletAddress]);

	// Fetch escrows when wallet connects
	useEffect(() => {
		if (isWalletConnected) {
			fetchActiveEscrows();
		}
	}, [fetchActiveEscrows, isWalletConnected]);

	const connectWallet = () => {
		// FCL authentication is handled in WalletConnection component
	};

	const disconnectWallet = () => {
		setWalletAddress("");
		setIsWalletConnected(false);
		toast({
			title: "Wallet Disconnected",
			description: "Your wallet has been disconnected.",
		});
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border bg-card">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-gradient-primary rounded-lg">
								<Shield className="h-6 w-6 text-primary-foreground" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-foreground">
									SecureTransfer
								</h1>
								<p className="text-sm text-muted-foreground">
									Secure FLOW escrow transfers on testnet
								</p>
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{/* Wallet Connection */}
				<div className="mb-8">
					<WalletConnection
						isConnected={isWalletConnected}
						walletAddress={walletAddress}
						onConnect={connectWallet}
						onDisconnect={disconnectWallet}
					/>
				</div>

				{isWalletConnected ? (
					<div className="space-y-8">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* Main Actions */}
							<div>
								<Tabs defaultValue="send" className="w-full">
									<TabsList className="grid w-full grid-cols-2 mb-4">
										<TabsTrigger value="send">Create Escrow</TabsTrigger>
										<TabsTrigger value="claim">Claim Escrow</TabsTrigger>
									</TabsList>
									<TabsContent value="send">
										<SendTokensForm
											walletAddress={walletAddress}
											onSuccess={fetchActiveEscrows}
										/>
									</TabsContent>
									<TabsContent value="claim">
										<ClaimTokensForm
											walletAddress={walletAddress}
											onSuccess={fetchActiveEscrows}
										/>
									</TabsContent>
								</Tabs>
							</div>

							{/* Escrow History */}
							<div>
								<TransactionList
									escrows={escrows}
									walletAddress={walletAddress}
									onRefresh={fetchActiveEscrows}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-12">
						<div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
							<Shield className="h-12 w-12 text-muted-foreground" />
						</div>
						<h2 className="text-2xl font-semibold text-foreground mb-3">
							Ready to Start?
						</h2>
						<p className="text-muted-foreground mb-6 max-w-md mx-auto">
							Connect your wallet to create and claim FLOW escrows on testnet.
						</p>
						<Button
							onClick={connectWallet}
							className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
							size="lg"
						>
							Get Started
						</Button>
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="border-t border-border bg-card mt-16">
				<div className="container mx-auto px-4 py-6">
					<div className="text-center text-sm text-muted-foreground">
						<p>
							SecureTransfer - Secure FLOW escrow transfers on Flow blockchain
						</p>
						<p>
							<a
								href="/privacy-policy"
								className="text-primary hover:underline"
							>
								Privacy Policy
							</a>
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Index;
