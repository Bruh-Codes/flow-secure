import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlowTransactionLinkProps {
  txId: string;
  network?: "mainnet" | "testnet";
  variant?: "link" | "button";
}

export const FlowTransactionLink = ({
  txId,
  network = "testnet",
  variant = "link",
}: FlowTransactionLinkProps) => {
  const baseUrl =
    network === "mainnet"
      ? "https://flowdiver.io"
      : "https://testnet.flowdiver.io";
  const url = `${baseUrl}/tx/${txId}`;

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        asChild
        className="hover:bg-primary/10 hover:text-primary hover:border-primary/50"
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          View Transaction
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
    >
      View on Flow Explorer
      <ExternalLink className="h-3 w-3" />
    </a>
  );
};
