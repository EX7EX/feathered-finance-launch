
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              The Next-Gen <span className="text-gradient">Decentralized</span> Trading Experience
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl">
              Trade cryptocurrencies, participate in token launches, and enjoy gaming rewards all in one secure platform.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              asChild
              size="lg" 
              className="bg-crypto-purple hover:bg-crypto-purple/90 text-white font-medium"
            >
              <Link to="/dashboard">
                Launch App <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline" 
              className="border-gray-700 hover:bg-gray-800"
            >
              <Link to="/game">
                Play & Earn
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-8 pt-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-crypto-purple/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-crypto-purple" />
              </div>
              <div>
                <p className="font-medium">Security First</p>
                <p className="text-sm text-gray-400">Non-custodial trading</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-crypto-purple/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-crypto-purple" />
              </div>
              <div>
                <p className="font-medium">Lightning Fast</p>
                <p className="text-sm text-gray-400">Instant transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-crypto-purple/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-crypto-purple" />
              </div>
              <div>
                <p className="font-medium">Low Fees</p>
                <p className="text-sm text-gray-400">Competitive pricing</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-crypto-gradient opacity-20 blur-3xl rounded-full"></div>
            <div className="glass-card relative rounded-2xl overflow-hidden border border-gray-700/50 w-full max-w-md">
              <div className="p-6 pb-0">
                <h3 className="text-xl font-semibold mb-4">Trading Preview</h3>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-400">BTC/USDT</p>
                    <p className="text-xl font-bold text-crypto-green">$48,351.25</p>
                    <p className="text-xs text-crypto-green">+2.4%</p>
                  </div>
                  <div className="h-12 w-20 bg-crypto-purple/10 rounded-lg animate-pulse">
                    {/* Chart placeholder */}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">24h Volume</p>
                    <p className="font-medium">$1.2B</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">24h Change</p>
                    <p className="font-medium text-crypto-green">+2.4%</p>
                  </div>
                </div>
              </div>
              <div className="h-48 w-full bg-crypto-purple/5 mt-6 relative overflow-hidden">
                {/* Mock chart */}
                <div className="absolute inset-0 flex items-end">
                  <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                    <path
                      d="M0,50 C30,30 70,80 100,50 C130,20 170,60 200,40 C230,20 270,60 300,30 C330,10 370,50 400,30"
                      fill="none"
                      stroke="#644DFF"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
