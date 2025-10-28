import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFlowEscrow } from "@/hooks/useFlowEscrow";

interface SendTokensFormProps {
	walletAddress: string;
	onSuccess: () => void;
}

export const SendTokensForm = ({
	walletAddress: sender,
	onSuccess,
}: SendTokensFormProps) => {
	const [recipient, setRecipient] = useState("");
	const [amount, setAmount] = useState("");
	const [duration, setDuration] = useState("24");
	const [refundMode, setRefundMode] = useState<"manual" | "auto">("manual");
	const { toast } = useToast();
	const { createEscrow, loading } = useFlowEscrow();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!recipient || !amount) {
			toast({
				variant: "destructive",
				title: "Missing Information",
				description: "Please fill in all fields.",
			});
			return;
		}

		try {
			const durationHours = parseInt(duration);
			if (isNaN(durationHours)) {
				toast({
					variant: "destructive",
					title: "Invalid Duration",
					description: "Please select a valid escrow duration.",
				});
				return;
			}
			const txId = await createEscrow(
				amount,
				recipient,
				durationHours * 3600,
				refundMode
			);

			toast({
				title: "Escrow Created",
				description: `${amount} FLOW escrowed for ${recipient.slice(
					0,
					6
				)}...${recipient.slice(-4)}`,
			});

			// Reset form
			setRecipient("");
			setAmount("");
			setDuration("24");
			setRefundMode("manual");

			onSuccess();
		} catch (error) {
			console.error("Error creating escrow:", error);
			toast({
				variant: "destructive",
				title: "Transaction Failed",
				description:
					error instanceof Error ? error.message : "Failed to create escrow",
			});
		}
	};

	const isFormValid = () => {
		return recipient && amount && parseFloat(amount) > 0;
	};

	return (
		<TooltipProvider>
			<Card className="p-6 bg-card border shadow-soft">
				<div className="mb-6">
					<h2 className="text-xl font-semibold text-foreground mb-2">
						Create Escrow
					</h2>
					<p className="text-muted-foreground">
						Lock FLOW tokens in escrow for a receiver to claim.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="recipient">Receiver Address</Label>
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-4 w-4 text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent>
									<p>The Flow address that can claim the escrowed tokens.</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<Input
							id="recipient"
							placeholder="0x..."
							value={recipient}
							onChange={(e) => setRecipient(e.target.value)}
							className="font-mono text-sm"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="amount">Amount (FLOW)</Label>
						<Input
							id="amount"
							type="number"
							placeholder="0.00"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							min="0"
							step="0.01"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="duration">Expiry (hours)</Label>
						<Select value={duration} onValueChange={setDuration}>
							<SelectTrigger>
								<SelectValue placeholder="Select duration" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">1 hour</SelectItem>
								<SelectItem value="6">6 hours</SelectItem>
								<SelectItem value="12">12 hours</SelectItem>
								<SelectItem value="24">24 hours</SelectItem>
								<SelectItem value="48">48 hours</SelectItem>
								<SelectItem value="72">72 hours</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label>Refund Mode</Label>
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-4 w-4 text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent>
									<p>
										Manual: You must trigger refund after expiry
										<br />
										Auto: Automatic refund after expiry
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<RadioGroup
							value={refundMode}
							onValueChange={(v) => setRefundMode(v as "manual" | "auto")}
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="manual" id="manual" />
								<Label htmlFor="manual" className="font-normal cursor-pointer">
									Manual
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="auto" id="auto" />
								<Label htmlFor="auto" className="font-normal cursor-pointer">
									Automatic
								</Label>
							</div>
						</RadioGroup>
					</div>

					<Button
						type="submit"
						disabled={!isFormValid() || loading}
						className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
					>
						{loading ? (
							<>
								<div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
								Creating Escrow...
							</>
						) : (
							<>
								<Send className="mr-2 h-4 w-4" />
								Create Escrow
							</>
						)}
					</Button>
				</form>
			</Card>
		</TooltipProvider>
	);
};
