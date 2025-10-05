import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { CreateEscrowDialog } from "@/components/CreateEscrowDialog";
import { type Escrow } from "@/components/EscrowCard";
import { toast } from "sonner";

const Index = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [escrows, setEscrows] = useState<Escrow[]>([
    {
      id: "0xa1b2c3d4e5f67890",
      recipient: "0x1234567890abcdef",
      amount: "100.00",
      token: "FLOW",
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "active",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      txHash: "0xabcdef123456789",
    },
    {
      id: "0x9876543210fedcba",
      recipient: "0xfedcba0987654321",
      amount: "50.00",
      token: "USDC",
      expiry: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday (expired)
      status: "refunded",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      txHash: "0x123456789abcdef",
    },
    {
      id: "0x1122334455667788",
      recipient: "0xaabbccddeeff0011",
      amount: "250.00",
      token: "FLOW",
      expiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: "claimed",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      claimedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      txHash: "0xdeadbeef12345678",
    },
  ]);

  const handleCreateEscrow = (data: {
    recipient: string;
    amount: string;
    token: string;
    expiry: Date;
  }) => {
    const newEscrow: Escrow = {
      id: `0x${Math.random().toString(16).slice(2, 18)}`,
      recipient: data.recipient,
      amount: data.amount,
      token: data.token,
      expiry: data.expiry,
      status: "active",
      createdAt: new Date(),
      txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
    };

    setEscrows([newEscrow, ...escrows]);
    toast.success("Escrow created successfully", {
      description: `${data.amount} ${data.token} locked until ${data.expiry.toLocaleDateString()}`,
    });
  };

  const handleClaimEscrow = (id: string) => {
    setEscrows(
      escrows.map((e) =>
        e.id === id
          ? { ...e, status: "claimed" as const, claimedAt: new Date() }
          : e
      )
    );
    toast.success("Funds claimed successfully", {
      description: "Tokens have been transferred to your wallet",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero onCreateEscrow={() => setShowCreateDialog(true)} />
      <Dashboard
        escrows={escrows}
        onCreateEscrow={() => setShowCreateDialog(true)}
        onClaimEscrow={handleClaimEscrow}
      />
      <CreateEscrowDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateEscrow={handleCreateEscrow}
      />
    </div>
  );
};

export default Index;
