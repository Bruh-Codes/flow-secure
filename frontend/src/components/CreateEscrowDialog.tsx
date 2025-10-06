import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface CreateEscrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEscrow: (data: {
    recipient: string;
    amount: string;
    token: string;
    expiry: Date;
  }) => void;
}

export const CreateEscrowDialog = ({ open, onOpenChange, onCreateEscrow }: CreateEscrowDialogProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("FLOW");
  const [expiry, setExpiry] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !amount || !expiry) {
      toast.error("Please fill in all fields");
      return;
    }

    if (expiry <= new Date()) {
      toast.error("Expiry date must be in the future");
      return;
    }

    onCreateEscrow({
      recipient,
      amount,
      token,
      expiry,
    });

    // Reset form
    setRecipient("");
    setAmount("");
    setToken("FLOW");
    setExpiry(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Escrow</DialogTitle>
          <DialogDescription>
            Lock tokens securely with automatic refund protection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x1234567890abcdef"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger id="token">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLOW">FLOW</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="FUSD">FUSD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiry ? format(expiry, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiry}
                  onSelect={setExpiry}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              Create Escrow
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
