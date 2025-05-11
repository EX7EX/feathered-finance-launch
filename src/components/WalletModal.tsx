
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { toast } = useToast();
  
  const walletOptions: WalletOption[] = [
    { id: "metamask", name: "MetaMask", icon: "M" },
    { id: "walletconnect", name: "WalletConnect", icon: "W" },
    { id: "coinbase", name: "Coinbase Wallet", icon: "C" },
    { id: "trustwallet", name: "Trust Wallet", icon: "T" }
  ];
  
  const handleConnectWallet = (wallet: WalletOption) => {
    toast({
      title: "Wallet Connection",
      description: `Connecting to ${wallet.name}... This is a demo only.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-crypto-dark border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-gray-400 text-sm">
            Connect your cryptocurrency wallet to access the exchange features and manage your assets.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="flex items-center justify-start gap-3 p-4 h-auto border-gray-800 hover:bg-gray-800/50 transition-all"
                onClick={() => handleConnectWallet(wallet)}
              >
                <div className="h-10 w-10 rounded-full bg-crypto-purple/20 text-crypto-purple flex items-center justify-center font-bold">
                  {wallet.icon}
                </div>
                <span>{wallet.name}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
