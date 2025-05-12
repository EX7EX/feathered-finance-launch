
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  WalletIcon, 
  BellIcon, 
  UserIcon, 
  SearchIcon,
  ChevronDownIcon,
  LogOut
} from "lucide-react";
import WalletModal from "./WalletModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  const handleConnectWallet = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect your wallet.",
      });
      return;
    }
    setIsWalletModalOpen(true);
  };
  
  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "No new notifications at this time.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-crypto-dark/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-crypto-gradient flex items-center justify-center">
              {/* Paper plane logo */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21 5L2 12.5L9 13.5"></path>
                <path d="M9 13.5L13 21L15 14.5L21 5"></path>
                <path d="M2 12.5L9 13.5L13 21"></path>
              </svg>
            </div>
            <span className="font-bold text-xl text-white">SimplMonie</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/exchange" className="text-gray-300 hover:text-white transition-colors">Exchange</Link>
            <Link to="/launchpad" className="text-gray-300 hover:text-white transition-colors">Launchpad</Link>
            <Link to="/game" className="text-gray-300 hover:text-white transition-colors">Game</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex items-center">
            <SearchIcon className="absolute left-3 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-gray-800/50 border border-gray-700 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-crypto-purple w-[200px]"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex gap-1 border-gray-700 hover:bg-gray-800 text-gray-300"
            onClick={handleNotifications}
          >
            <BellIcon className="h-4 w-4" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex items-center gap-1 border-gray-700 hover:bg-gray-800 text-gray-300"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Account</span>
                  <ChevronDownIcon className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-crypto-blue border-gray-800">
                <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-crypto-purple/20">
                  <Link to="/profile" className="flex w-full items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-gray-300 focus:text-white focus:bg-crypto-purple/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex items-center gap-1 border-gray-700 hover:bg-gray-800 text-gray-300"
              asChild
            >
              <Link to="/auth">
                <UserIcon className="h-4 w-4 mr-1" />
                Sign In
              </Link>
            </Button>
          )}
          
          <Button 
            onClick={handleConnectWallet}
            className="bg-crypto-purple hover:bg-crypto-purple/90 text-white"
          >
            <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
          </Button>
        </div>
      </div>
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </header>
  );
};

export default Navbar;
