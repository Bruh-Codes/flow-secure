import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Clock } from "lucide-react";
import { useFlowEscrow } from "@/hooks/useFlowEscrow";
import { toast } from "sonner";

interface ClaimTokensFormProps {
	walletAddress: string;
	onSuccess: () => void;
}

export const ClaimTokensForm = ({
	walletAddress,
	onSuccess,
}: ClaimTokensFormProps) => {
	const [escrowId, setEscrowId] = useState("");
	const { claimEscrow, loading } = useFlowEscrow();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!escrowId) {
			toast.error("Missing Information", {
				description: "Please enter the escrow ID.",
			});
			return;
		}

		try {
			const txId = await claimEscrow(escrowId);

			toast.error("Escrow Claimed", {
				description: `Successfully claimed escrow #${escrowId}`,
			});

			setEscrowId("");
			onSuccess();
		} catch (error) {
			console.error("Error object in ClaimTokensForm:", error);
			console.error("Is error an instance of Error:", error instanceof Error);

			let errorMessage = "Failed to claim escrow.";
			if (error instanceof Error) {
				if (error.message.includes("Escrow has expired")) {
					errorMessage = "Claim Failed: The escrow has expired.";
				} else if (/only receiver can claim/i.test(error.message)) {
					errorMessage =
						"Claim Failed: Only the designated receiver can claim this escrow.";
				} else {
					errorMessage = error.message;
				}
			} else if (
				typeof error === "object" &&
				error !== null &&
				"message" in error
			) {
				errorMessage = error.message;
			} else {
				errorMessage = String(error);
			}

			toast.error("Claim Failed", {
				description: errorMessage,
			});
		}
	};

	const isFormValid = escrowId.trim() !== "";

	return (
		<Card className="p-6 bg-card border shadow-soft">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-foreground mb-2">
					Claim Escrow
				</h2>
				<p className="text-muted-foreground">
					Enter the escrow ID to claim your FLOW tokens.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="escrowId">Escrow ID</Label>
					<Input
						id="escrowId"
						placeholder="Enter escrow ID..."
						value={escrowId}
						onChange={(e) => setEscrowId(e.target.value)}
						className="font-mono text-sm"
					/>
				</div>

				<div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
					<div className="flex items-center gap-2 text-warning mb-2">
						<Clock className="h-4 w-4" />
						<span className="font-medium">Time Limit</span>
					</div>
					<p className="text-sm text-muted-foreground">
						You must claim the tokens before the escrow expires. After expiry,
						the tokens will be refunded to the sender.
					</p>
				</div>

				<Button
					type="submit"
					disabled={!isFormValid || loading}
					className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
					size="lg"
				>
					{loading ? (
						<>
							<div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
							Claiming...
						</>
					) : (
						<>
							<Download className="mr-2 h-5 w-5" />
							Claim Tokens
						</>
					)}
				</Button>
			</form>
		</Card>
	);
};
