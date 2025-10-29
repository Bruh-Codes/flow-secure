import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Clock,
	Copy,
	ArrowUpRight,
	ArrowDownLeft,
	RotateCcw,
	RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Escrow } from "@/hooks/useFlowEscrow";
import { useFlowEscrow } from "@/hooks/useFlowEscrow";
import { useEffect, useState } from "react";
import fcl from "@/config/flow";

interface TransactionListProps {
	escrows: Escrow[];
	walletAddress: string;
	onRefresh: () => void;
}

export const TransactionList = ({
	escrows,
	walletAddress,
	onRefresh,
}: TransactionListProps) => {
	const { toast } = useToast();
	const { refundEscrow, loading, triggerRefundAllExpired } = useFlowEscrow();

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: `${label} Copied`,
			description: `${label} has been copied to your clipboard.`,
		});
	};

	const getTimeRemaining = (expiryTimestamp: string) => {
		const now = Date.now() / 1000;
		const expiry = parseFloat(expiryTimestamp);
		const diff = expiry - now;

		if (diff <= 0) return "Expired";

		const hours = Math.floor(diff / 3600);
		const minutes = Math.floor((diff % 3600) / 60);

		return `${hours}h ${minutes}m`;
	};

	const isExpired = (expiryTimestamp: string) => {
		const now = Date.now() / 1000;
		const expiry = parseFloat(expiryTimestamp);
		return now >= expiry;
	};

	const handleRefund = async (id: string) => {
		try {
			const currentUser = await fcl.currentUser.snapshot();
			console.log("walletAddress prop:", walletAddress);
			console.log("fcl.currentUser address:", currentUser.addr);
			await refundEscrow(id);
			toast({
				title: "Refund Successful",
				description: `Escrow #${id} has been refunded.`,
			});
			onRefresh();
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Refund Failed",
				description:
					error instanceof Error ? error.message : "Failed to refund escrow",
			});
		}
	};

	const getStatusBadge = (state: string, expiryTimestamp: string) => {
		if (state === "Claimed") {
			return (
				<Badge
					variant="secondary"
					className="bg-success/10 text-success border-success/20"
				>
					Claimed
				</Badge>
			);
		}
		if (state === "Refunded") {
			return (
				<Badge
					variant="secondary"
					className="bg-destructive/10 text-destructive border-destructive/20"
				>
					Refunded
				</Badge>
			);
		}
		if (isExpired(expiryTimestamp)) {
			return (
				<Badge
					variant="secondary"
					className="bg-warning/10 text-warning border-warning/20"
				>
					Expired
				</Badge>
			);
		}
		return (
			<Badge
				variant="secondary"
				className="bg-primary/10 text-primary border-primary/20"
			>
				Active
			</Badge>
		);
	};

	const [hasExpiredAutoRefunds, setHasExpiredAutoRefunds] = useState(false);

	useEffect(() => {
		const expiredAuto = escrows.some(
			(escrow) => isExpired(escrow.expiry) && escrow.refundMode === "auto"
		);
		setHasExpiredAutoRefunds(expiredAuto);
	}, [escrows]);

	const getTransactionIcon = (escrow: Escrow) => {
		if (escrow.sender === walletAddress) {
			return <ArrowUpRight className="h-5 w-5 text-primary" />;
		}
		return <ArrowDownLeft className="h-5 w-5 text-success" />;
	};

	if (escrows.length === 0) {
		return (
			<Card className="p-8 bg-card border shadow-soft text-center">
				<div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
					<RotateCcw className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-semibold text-foreground mb-2">
					No Escrows Yet
				</h3>
				<p className="text-muted-foreground">
					Your escrow history will appear here once you create or receive
					escrows.
				</p>
			</Card>
		);
	}

	return (
		<Card className="p-6 bg-card border shadow-soft">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold text-foreground">
					Escrow History
				</h2>
				<div className="flex items-center gap-2">
					{hasExpiredAutoRefunds && (
						<Button
							variant="outline"
							size="sm"
							onClick={async () => {
								try {
									await triggerRefundAllExpired();
									toast({
										title: "Automatic Refund Triggered",
										description:
											"Expired auto-refund escrows are being processed.",
									});
									onRefresh(); // Refresh the list after triggering
								} catch (error) {
									toast({
										variant: "destructive",
										title: "Automatic Refund Failed",
										description:
											error instanceof Error
												? error.message
												: "Failed to trigger automatic refunds",
									});
								}
							}}
							disabled={loading}
						>
							<RefreshCw
								className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
							/>
							Refund All Expired (Auto)
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={onRefresh}
						disabled={loading}
					>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
					</Button>
				</div>
			</div>
			<div className="space-y-4">
				{escrows.map((escrow) => (
					<div
						key={escrow.id}
						className="p-4 border border-border rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
					>
						<div className="flex items-start justify-between mb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-muted/50 rounded-lg">
									{getTransactionIcon(escrow)}
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<span className="font-medium text-foreground">
											{escrow.sender === walletAddress ? "Sent" : "Received"}{" "}
											{escrow.amount} FLOW
										</span>
										{getStatusBadge(escrow.state, escrow.expiry)}
									</div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<span>
											{escrow.sender === walletAddress
												? `To: ${escrow.receiver}`
												: `From: ${escrow.sender}`}
										</span>
									</div>
								</div>
							</div>
							<div className="text-right text-sm">
								<div className="text-muted-foreground">
									{new Date(
										parseFloat(escrow.createdAt) * 1000
									).toLocaleDateString()}
								</div>
								{escrow.state === "Active" && (
									<div
										className={`font-medium ${
											isExpired(escrow.expiry) ? "text-warning" : "text-primary"
										}`}
									>
										{getTimeRemaining(escrow.expiry)}
									</div>
								)}
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>ID: {escrow.id}</span>
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0"
									onClick={() => copyToClipboard(escrow.id, "Escrow ID")}
								>
									<Copy className="h-3 w-3" />
								</Button>
								<span className="ml-2">• Mode: {escrow.refundMode}</span>
							</div>

							{isExpired(escrow.expiry) &&
								escrow.sender === walletAddress &&
								escrow.refundMode === "manual" && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleRefund(escrow.id)}
										disabled={loading}
									>
										Refund
									</Button>
								)}
						</div>
					</div>
				))}
			</div>
		</Card>
	);
};
