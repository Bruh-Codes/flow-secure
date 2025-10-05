import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EscrowCard, type Escrow } from "./EscrowCard";
import { AutomationPanel } from "./AutomationPanel";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";

interface DashboardProps {
  escrows: Escrow[];
  onCreateEscrow: () => void;
  onClaimEscrow: (id: string) => void;
  walletAddress: string | null;
}

export const Dashboard = ({ escrows, onCreateEscrow, onClaimEscrow, walletAddress }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("all");

  const activeEscrows = escrows.filter((e) => e.status === "active");
  const claimedEscrows = escrows.filter((e) => e.status === "claimed");
  const refundedEscrows = escrows.filter((e) => e.status === "refunded");

  const stats = [
    { label: "Total Escrows", value: escrows.length, color: "text-foreground" },
    { label: "Active", value: activeEscrows.length, color: "text-warning" },
    { label: "Claimed", value: claimedEscrows.length, color: "text-success" },
    { label: "Refunded", value: refundedEscrows.length, color: "text-muted-foreground" },
  ];

  if (!walletAddress) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Wallet className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Connect your Flow wallet to view your escrows and start managing payments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your escrows and automated payments</p>
          </div>
          <Button onClick={onCreateEscrow} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Escrow
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="claimed">Claimed</TabsTrigger>
            <TabsTrigger value="refunded">Refunded</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <EscrowGrid escrows={escrows} onClaim={onClaimEscrow} />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <EscrowGrid escrows={activeEscrows} onClaim={onClaimEscrow} />
          </TabsContent>

          <TabsContent value="claimed" className="mt-6">
            <EscrowGrid escrows={claimedEscrows} onClaim={onClaimEscrow} />
          </TabsContent>

          <TabsContent value="refunded" className="mt-6">
            <EscrowGrid escrows={refundedEscrows} onClaim={onClaimEscrow} />
          </TabsContent>

          <TabsContent value="automation" className="mt-6">
            <AutomationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const EscrowGrid = ({ escrows, onClaim }: { escrows: Escrow[]; onClaim: (id: string) => void }) => {
  if (escrows.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No escrows found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {escrows.map((escrow) => (
        <EscrowCard key={escrow.id} escrow={escrow} onClaim={onClaim} />
      ))}
    </div>
  );
};
