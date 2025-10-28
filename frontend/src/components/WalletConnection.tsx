import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, CheckCircle } from "lucide-react";
import * as fcl from "@onflow/fcl";
import "@/config/flow";
import { ModeToggle } from "./dark-mode-toggle";

interface WalletConnectionProps {
	isConnected: boolean;
	walletAddress?: string;
	onConnect: () => void;
	onDisconnect: () => void;
}

export const WalletConnection = ({
	isConnected,
	walletAddress,
	onConnect,
	onDisconnect,
}: WalletConnectionProps) => {
	const [isConnecting, setIsConnecting] = useState(false);

	const handleConnect = async () => {
		setIsConnecting(true);
		try {
			await fcl.authenticate();
			// onConnect will be called from the parent's useEffect listening to FCL
		} catch (error) {
			console.error("Failed to connect wallet:", error);
		} finally {
			setIsConnecting(false);
		}
	};

	const handleDisconnect = async () => {
		await fcl.unauthenticate();
		onDisconnect();
	};

	const truncateAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	if (isConnected && walletAddress) {
		return (
			<Card className="p-4 bg-card border shadow-soft">
				<div className="flex items-center justify-end gap-5">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-success/10 rounded-lg">
							<CheckCircle className="h-5 w-5 text-success" />
						</div>
						<div>
							<p className="font-medium text-foreground">Wallet Connected</p>
							<p className="text-sm text-muted-foreground">
								{truncateAddress(walletAddress)}
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleDisconnect}
						className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
					>
						Disconnect
					</Button>
					<div>
						<ModeToggle />
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 bg-card border shadow-soft text-center">
			<div className="mb-4">
				<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
					<Wallet className="h-8 w-8 text-primary" />
				</div>
				<h3 className="text-lg font-semibold text-foreground mb-2">
					Connect Your Wallet
				</h3>
				<p className="text-muted-foreground">
					Connect your wallet to start sending and receiving tokens securely.
				</p>
			</div>
			<Button
				onClick={handleConnect}
				disabled={isConnecting}
				className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
				size="lg"
			>
				{isConnecting ? (
					<>
						<div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
						Connecting...
					</>
				) : (
					<>
						<Wallet className="mr-2 h-5 w-5" />
						Connect Wallet
					</>
				)}
			</Button>
		</Card>
	);
};
