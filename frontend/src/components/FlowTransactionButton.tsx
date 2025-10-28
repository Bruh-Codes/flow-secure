import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as fcl from "@onflow/fcl";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FlowTransactionButtonProps {
  transaction: () => Promise<string>;
  onSuccess?: (txId: string) => void;
  onError?: (error: Error) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const FlowTransactionButton = ({
  transaction,
  onSuccess,
  onError,
  children,
  disabled = false,
}: FlowTransactionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTransaction = async () => {
    setIsLoading(true);
    try {
      const txId = await transaction();
      
      // Wait for transaction to be sealed
      const txStatus = await fcl.tx(txId).onceSealed();
      
      toast({
        title: "Transaction Successful",
        description: `Transaction ID: ${txId}`,
      });
      
      onSuccess?.(txId);
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTransaction}
      disabled={disabled || isLoading}
      className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
};
