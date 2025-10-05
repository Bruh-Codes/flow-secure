import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

interface NavbarProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export const Navbar = ({ walletAddress, onConnectWallet, onDisconnectWallet }: NavbarProps) => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FV</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FlowVault</h1>
              <p className="text-xs text-muted-foreground">Decentralized Escrow</p>
            </div>
          </div>

          {walletAddress ? (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Connected</p>
                <p className="font-mono text-sm text-foreground">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnectWallet}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={onConnectWallet}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
