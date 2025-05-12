
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  logo?: React.ReactNode;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { toast } = useToast();
  
  const walletOptions: WalletOption[] = [
    { 
      id: "metamask", 
      name: "MetaMask", 
      icon: "M",
      logo: (
        <svg height="40" width="40" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.04184 1L15.0512 10.809L12.7335 4.99098L2.04184 1Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28.2049 23.4855L24.7394 28.8753L32.1469 30.8987L34.2974 23.6114L28.2049 23.4855Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M0.712646 23.6114L2.85317 30.8987L10.2607 28.8753L6.79517 23.4855L0.712646 23.6114Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.86936 14.4855L7.7439 17.684L15.1376 18.0108L14.8733 10.0493L9.86936 14.4855Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25.1307 14.4855L20.0519 9.95889L19.8242 18.0108L27.2062 17.684L25.1307 14.4855Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.2607 28.8753L14.6826 26.7018L10.8869 23.6631L10.2607 28.8753Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20.3175 26.7018L24.7394 28.8753L24.1015 23.6631L20.3175 26.7018Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: "walletconnect", 
      name: "WalletConnect", 
      icon: "W",
      logo: (
        <svg width="40" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M169.209 185.796C214.45 141.427 287.55 141.427 332.791 185.796L341.063 193.918C343.433 196.24 343.433 200.055 341.063 202.276L321.776 221.158C320.641 222.27 318.819 222.27 317.684 221.158L306.321 210.02C275.358 179.788 226.642 179.788 195.679 210.02L183.368 222.12C182.233 223.232 180.411 223.232 179.276 222.12L159.989 203.237C157.619 200.916 157.619 197.1 159.989 194.879L169.209 185.796ZM366.425 218.896L383.619 235.773C385.989 238.095 385.989 241.91 383.619 244.132L299.67 326.253C297.3 328.574 293.656 328.574 291.387 326.253C291.386 326.253 291.386 326.253 291.386 326.253L232.455 268.582C231.888 268.026 230.976 268.026 230.408 268.582C230.408 268.582 230.408 268.582 230.408 268.582L171.494 326.253C169.124 328.574 165.48 328.574 163.211 326.253C163.211 326.253 163.211 326.253 163.21 326.253L79.3813 244.132C77.0114 241.91 77.0114 238.095 79.3813 235.773L96.5748 218.896C98.9447 216.674 102.589 216.674 104.858 218.896L163.789 276.566C164.357 277.123 165.268 277.123 165.836 276.566C165.836 276.566 165.836 276.566 165.837 276.566L224.734 218.896C227.104 216.674 230.748 216.574 233.017 218.896C233.017 218.896 233.017 218.896 233.018 218.896L291.966 276.566C292.533 277.123 293.445 277.123 294.013 276.566L352.926 218.896C355.296 216.674 358.94 216.674 361.209 218.896L366.425 218.896Z" fill="#3B99FC"/>
        </svg>
      )
    },
    { 
      id: "coinbase", 
      name: "Coinbase Wallet", 
      icon: "C",
      logo: (
        <svg width="40" height="40" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="1024" height="1024" fill="#0052FF"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M152 512C152 710.823 313.177 872 512 872C710.823 872 872 710.823 872 512C872 313.177 710.823 152 512 152C313.177 152 152 313.177 152 512ZM420 396C406.745 396 396 406.745 396 420V604C396 617.255 406.745 628 420 628H604C617.255 628 628 617.255 628 604V420C628 406.745 617.255 396 604 396H420Z" fill="white"/>
        </svg>
      )
    },
    { 
      id: "trustwallet", 
      name: "Trust Wallet", 
      icon: "T",
      logo: (
        <svg width="40" height="40" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M470.577 185.345L307.924 123.121C306.009 122.349 303.991 122.349 302.076 123.121L139.423 185.345C136.841 186.345 135.133 188.86 135.133 191.66V284.341C135.133 401.586 221.815 507.793 302.076 548.312C303.991 549.084 306.009 549.084 307.924 548.312C387.757 507.793 474.867 401.586 474.867 284.341V191.66C474.867 188.86 473.159 186.345 470.577 185.345ZM409.6 297.314L297.659 409.255C294.566 412.348 289.775 412.348 286.682 409.255L200.737 323.31C197.644 320.217 197.644 315.426 200.737 312.333L221.01 292.06C224.103 288.967 228.894 288.967 231.987 292.06L286.682 346.754L367.776 265.66C370.869 262.567 375.66 262.567 378.753 265.66L399.026 285.933C402.119 289.026 402.119 293.817 399.026 296.91L409.6 297.314Z" fill="#3375BB"/>
        </svg>
      )
    }
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
        <div className="grid gap-6 py-4">
          <p className="text-gray-400 text-sm">
            Connect your cryptocurrency wallet to access the exchange features and manage your assets securely.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="flex flex-col items-center justify-center gap-3 p-4 h-auto border-gray-800 hover:bg-gray-800/50 transition-all"
                onClick={() => handleConnectWallet(wallet)}
              >
                <div className="h-14 w-14 flex items-center justify-center">
                  {wallet.logo || (
                    <div className="h-10 w-10 rounded-full bg-crypto-purple/20 text-crypto-purple flex items-center justify-center font-bold">
                      {wallet.icon}
                    </div>
                  )}
                </div>
                <span>{wallet.name}</span>
              </Button>
            ))}
          </div>
          <div className="bg-crypto-purple/10 rounded-lg p-4 mt-2">
            <h4 className="font-medium mb-2">New to crypto wallets?</h4>
            <p className="text-sm text-gray-300 mb-4">
              Wallets are used to send, receive, and store digital assets. Connect a wallet to access SimplMonie.
            </p>
            <Button variant="ghost" className="text-crypto-purple hover:text-crypto-purple/80 p-0 h-auto">
              Learn more about wallets
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
