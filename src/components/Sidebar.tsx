
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  HomeIcon,
  BarChartIcon,
  RocketIcon,
  GamepadIcon,
  WalletIcon,
  SettingsIcon,
  HelpCircleIcon,
  UserIcon,
  TrophyIcon,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: "/dashboard", icon: <HomeIcon className="h-5 w-5" />, label: "Dashboard" },
    { path: "/exchange", icon: <BarChartIcon className="h-5 w-5" />, label: "Exchange" },
    { path: "/launchpad", icon: <RocketIcon className="h-5 w-5" />, label: "Launchpad" },
    { path: "/game", icon: <GamepadIcon className="h-5 w-5" />, label: "Game" },
    { path: "/leaderboard", icon: <TrophyIcon className="h-5 w-5" />, label: "Leaderboard" },
    { path: "/profile", icon: <UserIcon className="h-5 w-5" />, label: "Profile" },
  ];
  
  const bottomNavItems = [
    { path: "/wallet", icon: <WalletIcon className="h-5 w-5" />, label: "Wallet" },
    { path: "/settings", icon: <SettingsIcon className="h-5 w-5" />, label: "Settings" },
    { path: "/help", icon: <HelpCircleIcon className="h-5 w-5" />, label: "Help" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-crypto-blue min-h-[calc(100vh-4rem)] p-4">
      <div className="flex flex-col flex-grow">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-crypto-purple/20 text-crypto-purple"
                  : "text-gray-400 hover:bg-crypto-purple/10 hover:text-gray-200"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive(item.path) && (
                <div className="ml-auto w-1.5 h-5 bg-crypto-purple rounded-full" />
              )}
            </Link>
          ))}
        </nav>
        
        <div className="mt-6 px-3">
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-crypto-gradient animate-pulse-glow"></div>
              <div>
                <h4 className="font-medium text-sm">Earn rewards</h4>
                <p className="text-xs text-gray-400">Play & earn tokens</p>
              </div>
            </div>
            <Link 
              to="/game" 
              className="block w-full text-center text-sm py-1.5 rounded-lg bg-crypto-purple/20 text-crypto-purple hover:bg-crypto-purple/30 transition-colors"
            >
              Play Now
            </Link>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="pt-6 border-t border-gray-800 mt-6">
            <nav className="space-y-1">
              {bottomNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-crypto-purple/10 hover:text-gray-200 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
