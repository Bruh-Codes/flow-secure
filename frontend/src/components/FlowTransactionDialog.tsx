import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlowTransactionButton } from "./FlowTransactionButton";
import { CheckCircle, ExternalLink } from "lucide-react";

interface FlowTransactionDialogProps {
  title: string;
  description: string;
  transaction: () => Promise<string>;
  triggerLabel: string;
  children?: React.ReactNode;
}

export const FlowTransactionDialog = ({
  title,
  description,
  transaction,
  triggerLabel,
  children,
}: FlowTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  const handleSuccess = (transactionId: string) => {
    setTxId(transactionId);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setTxId(null), 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {txId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Transaction Successful!</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Transaction ID:</p>
              <p className="text-sm font-mono break-all">{txId}</p>
            </div>
            <a
              href={`https://testnet.flowdiver.io/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View on Flow Testnet
              <ExternalLink className="h-4 w-4" />
            </a>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {children}
            <FlowTransactionButton
              transaction={transaction}
              onSuccess={handleSuccess}
            >
              Confirm Transaction
            </FlowTransactionButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
