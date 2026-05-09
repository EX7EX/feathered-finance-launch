import { useWeb3 } from "@/integrations/web3/provider";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Persistent banner. Shows two states:
 *  - Wallet not on Base Sepolia → wrong-network warning + switch button
 *  - Wallet on Base Sepolia → friendly testnet notice
 * Hidden entirely when no wallet is connected.
 */
export const TestnetBanner = () => {
  const { account, isCorrectNetwork, switchToBaseSepolia } = useWeb3();

  if (!account) return null;

  if (!isCorrectNetwork) {
    return (
      <div className="w-full bg-destructive/15 text-destructive border-b border-destructive/30 px-4 py-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Wrong network. Switch to Base Sepolia to trade safely.</span>
        </div>
        <Button size="sm" variant="destructive" onClick={switchToBaseSepolia}>
          Switch network
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-accent/10 text-accent border-b border-accent/20 px-4 py-2 text-center text-xs">
      You're on Base Sepolia testnet — no real funds at risk.
    </div>
  );
};

export default TestnetBanner;