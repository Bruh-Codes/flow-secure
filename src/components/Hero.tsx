import { Button } from "@/components/ui/button";
import { Shield, Clock, Zap } from "lucide-react";

export const Hero = ({ onCreateEscrow }: { onCreateEscrow: () => void }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDBjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30" />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">Powered by Forte Actions & Workflows</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            FlowVault
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
            Decentralized escrow and automated payments on Flow blockchain
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={onCreateEscrow}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all"
            >
              Create Escrow
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              View Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Trustless Escrow"
              description="Lock tokens safely with smart contract security"
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Auto Refund"
              description="Automatic refunds if unclaimed by expiry"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Automation"
              description="Scheduled payments and recurring transfers"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-colors">
      <div className="inline-flex p-3 rounded-xl bg-accent/20 text-accent mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-primary-foreground/70">{description}</p>
    </div>
  );
};
