import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Zap, Repeat, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Automation {
  id: string;
  type: "recurring" | "scheduled_refund" | "auto_claim";
  recipient: string;
  amount: string;
  token: string;
  frequency?: string;
  nextRun: Date;
  status: "active" | "paused";
}

export const AutomationPanel = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: "auto-1",
      type: "recurring",
      recipient: "0x1234...5678",
      amount: "100",
      token: "FLOW",
      frequency: "weekly",
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "active",
    },
    {
      id: "auto-2",
      type: "scheduled_refund",
      recipient: "0xabcd...ef01",
      amount: "250",
      token: "USDC",
      nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "active",
    },
  ]);

  const [showNewAutomation, setShowNewAutomation] = useState(false);
  const [newType, setNewType] = useState<"recurring" | "scheduled_refund" | "auto_claim">("recurring");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("FLOW");
  const [frequency, setFrequency] = useState("weekly");

  const handleCreateAutomation = () => {
    if (!recipient || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newAutomation: Automation = {
      id: `auto-${Date.now()}`,
      type: newType,
      recipient,
      amount,
      token,
      frequency: newType === "recurring" ? frequency : undefined,
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "active",
    };

    setAutomations([newAutomation, ...automations]);
    toast.success("Automation created successfully");
    setShowNewAutomation(false);
    setRecipient("");
    setAmount("");
  };

  const toggleAutomation = (id: string) => {
    setAutomations(
      automations.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } as Automation : a
      )
    );
    toast.success("Automation status updated");
  };

  const automationIcons = {
    recurring: Repeat,
    scheduled_refund: RefreshCw,
    auto_claim: Zap,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Automation & Scheduling</h2>
          <p className="text-muted-foreground">Set up recurring payments and automated actions</p>
        </div>
        <Button
          onClick={() => setShowNewAutomation(!showNewAutomation)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Zap className="h-4 w-4 mr-2" />
          New Automation
        </Button>
      </div>

      {showNewAutomation && (
        <Card className="p-6 border-accent/20">
          <h3 className="text-lg font-semibold mb-4">Create New Automation</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Automation Type</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring">Recurring Payment</SelectItem>
                  <SelectItem value="scheduled_refund">Scheduled Refund</SelectItem>
                  <SelectItem value="auto_claim">Auto Claim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Address</Label>
                <Input
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Token</Label>
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLOW">FLOW</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="FUSD">FUSD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newType === "recurring" && (
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowNewAutomation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAutomation}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Create Automation
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((automation) => {
          const Icon = automationIcons[automation.type];
          return (
            <Card key={automation.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold capitalize">
                      {automation.type.replace("_", " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {automation.frequency && `Every ${automation.frequency}`}
                    </p>
                  </div>
                </div>
                <Badge variant={automation.status === "active" ? "default" : "secondary"}>
                  {automation.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    {automation.amount} {automation.token}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-mono">{automation.recipient}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Run</span>
                  <span>{automation.nextRun.toLocaleDateString()}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => toggleAutomation(automation.id)}
              >
                {automation.status === "active" ? "Pause" : "Resume"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
