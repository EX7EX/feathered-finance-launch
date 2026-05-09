import { useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TEST_TOKENS, TEST_TOKEN_ABI, BASE_SEPOLIA_EXPLORER } from "@/integrations/web3/contracts";
import { useWeb3 } from "@/integrations/web3/provider";
import { Coins, ExternalLink } from "lucide-react";

/**
 * One-click faucet that mints test tokens to the connected wallet.
 * Requires user to be on Base Sepolia.
 */
export const TestnetFaucet = () => {
  const { account, isCorrectNetwork } = useWeb3();
  const { toast } = useToast();
  const [minting, setMinting] = useState<string | null>(null);

  const mint = async (symbol: "tWBTC" | "tUSDC", decimals: number, amount: string) => {
    const tokenAddress = TEST_TOKENS[symbol];
    if (!tokenAddress) {
      toast({
        title: "Faucet unavailable",
        description: `${symbol} address not configured. Deploy contracts first.`,
        variant: "destructive",
      });
      return;
    }
    if (!window.ethereum || !account) {
      toast({ title: "Connect your wallet first", variant: "destructive" });
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: "Switch to Base Sepolia first", variant: "destructive" });
      return;
    }

    setMinting(symbol);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const token = new Contract(tokenAddress, TEST_TOKEN_ABI, signer);
      const tx = await token.mint(account, parseUnits(amount, decimals));
      toast({ title: `Minting ${amount} ${symbol}...` });
      await tx.wait();
      toast({
        title: `Minted ${amount} ${symbol}`,
        description: "Check your wallet balance.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Mint failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setMinting(null);
    }
  };

  return (
    <Card className="bg-card border-border mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className="h-4 w-4" />
          Testnet Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Mint free test tokens to start trading. You'll also need Base Sepolia ETH for gas.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={minting !== null}
            onClick={() => mint("tWBTC", 8, "1")}
          >
            {minting === "tWBTC" ? "Minting..." : "Mint 1 tWBTC"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={minting !== null}
            onClick={() => mint("tUSDC", 6, "50000")}
          >
            {minting === "tUSDC" ? "Minting..." : "Mint 50k tUSDC"}
          </Button>
        </div>
        <a
          href="https://www.alchemy.com/faucets/base-sepolia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Get Base Sepolia ETH for gas <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`${BASE_SEPOLIA_EXPLORER}/address/${account ?? ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-muted-foreground hover:underline"
        >
          View your wallet on Basescan ↗
        </a>
      </CardContent>
    </Card>
  );
};

export default TestnetFaucet;