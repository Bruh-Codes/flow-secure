import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type EscrowStatus = "active" | "claimed" | "refunded";

export interface Escrow {
  id: string;
  recipient: string;
  amount: string;
  token: string;
  expiry: Date;
  status: EscrowStatus;
  createdAt: Date;
  claimedAt?: Date;
  txHash?: string;
}

interface EscrowCardProps {
  escrow: Escrow;
  onClaim?: (id: string) => void;
}

export const EscrowCard = ({ escrow, onClaim }: EscrowCardProps) => {
  const isExpired = new Date() > escrow.expiry;
  const canClaim = escrow.status === "active" && !isExpired;

  const statusConfig = {
    active: {
      badge: "default",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    claimed: {
      badge: "default",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    refunded: {
      badge: "secondary",
      icon: XCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  };

  const config = statusConfig[escrow.status];
  const StatusIcon = config.icon;

  return (
    <Card className="p-6 hover:shadow-lg transition-all border-border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Escrow ID</p>
            <p className="font-mono text-sm">{escrow.id.slice(0, 12)}...</p>
          </div>
        </div>
        <Badge variant={config.badge as any} className="capitalize">
          {escrow.status}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Amount</p>
            <p className="text-2xl font-bold text-foreground">
              {escrow.amount} <span className="text-sm font-normal text-muted-foreground">{escrow.token}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Recipient</p>
            <p className="font-mono text-sm text-foreground truncate">{escrow.recipient}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground">{formatDistanceToNow(escrow.createdAt, { addSuffix: true })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expires</span>
            <span className={`font-medium ${isExpired ? "text-destructive" : "text-foreground"}`}>
              {isExpired ? "Expired" : formatDistanceToNow(escrow.expiry, { addSuffix: true })}
            </span>
          </div>
          {escrow.claimedAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Claimed</span>
              <span className="text-foreground">{formatDistanceToNow(escrow.claimedAt, { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {escrow.txHash && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={`https://flowscan.org/tx/${escrow.txHash}`} target="_blank" rel="noopener noreferrer">
              View Transaction <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        )}

        {canClaim && onClaim && (
          <Button 
            onClick={() => onClaim(escrow.id)} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Claim Funds
          </Button>
        )}
      </div>
    </Card>
  );
};
