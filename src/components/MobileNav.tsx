
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BarChartIcon,
  RocketIcon,
  GamepadIcon,
  MenuIcon,
  LogOut,
  UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import WalletModal from "./WalletModal";
import { useAuth } from "@/contexts/AuthContext";

const MobileNav = () => {
  const location = useLocation();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-crypto-dark/80 backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-crypto-gradient flex items-center justify-center">
              <span className="font-bold text-white text-xs">FX</span>
            </div>
            <span className="font-bold text-lg text-white">FeatheredX</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <Button 
                onClick={() => setIsWalletModalOpen(true)}
                size="sm"
                className="bg-crypto-purple hover:bg-crypto-purple/90 text-white"
              >
                Connect
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-crypto-purple hover:bg-crypto-purple/90 text-white"
                asChild
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-gray-700">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-crypto-blue border-gray-800">
                <div className="flex flex-col gap-8 pt-10">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-crypto-gradient flex items-center justify-center">
                      <span className="font-bold text-white">FX</span>
                    </div>
                    <span className="font-bold text-xl text-white">FeatheredX</span>
                  </div>
                  
                  {user && (
                    <div className="px-1 py-2 border-b border-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-crypto-purple/20 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-crypto-purple" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.email}</div>
                          <div className="text-xs text-gray-400">Basic Account</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <nav className="flex flex-col gap-4">
                    <Link to="/dashboard" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                      <HomeIcon className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link to="/exchange" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                      <BarChartIcon className="h-5 w-5" />
                      <span className="font-medium">Exchange</span>
                    </Link>
                    <Link to="/launchpad" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                      <RocketIcon className="h-5 w-5" />
                      <span className="font-medium">Launchpad</span>
                    </Link>
                    <Link to="/game" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                      <GamepadIcon className="h-5 w-5" />
                      <span className="font-medium">Game</span>
                    </Link>
                    
                    {user && (
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors mt-4"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-crypto-blue border-t border-gray-800 flex justify-around py-2">
        <Link to="/dashboard" className={`flex flex-col items-center p-2 ${isActive('/dashboard') ? 'text-crypto-purple' : 'text-gray-500'}`}>
          <HomeIcon className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link to="/exchange" className={`flex flex-col items-center p-2 ${isActive('/exchange') ? 'text-crypto-purple' : 'text-gray-500'}`}>
          <BarChartIcon className="h-5 w-5" />
          <span className="text-xs mt-1">Exchange</span>
        </Link>
        <Link to="/launchpad" className={`flex flex-col items-center p-2 ${isActive('/launchpad') ? 'text-crypto-purple' : 'text-gray-500'}`}>
          <RocketIcon className="h-5 w-5" />
          <span className="text-xs mt-1">Launchpad</span>
        </Link>
        <Link to="/game" className={`flex flex-col items-center p-2 ${isActive('/game') ? 'text-crypto-purple' : 'text-gray-500'}`}>
          <GamepadIcon className="h-5 w-5" />
          <span className="text-xs mt-1">Game</span>
        </Link>
      </nav>
      
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </>
  );
};

export default MobileNav;
