
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Activity, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCryptoData } from "@/hooks/useCryptoData";

const Index = () => {
  const { user } = useAuth();
  const { data: currentPrices, loading } = useCryptoData(['bitcoin', 'ethereum', 'solana', 'cardano']);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Trade with Confidence",
      description: "Advanced security features protect your assets and trades around the clock",
      icon: <ShieldCheck className="h-6 w-6 text-crypto-purple" />,
      animation: "translate-y-0 opacity-100"
    },
    {
      title: "Lightning Fast Execution",
      description: "Execute trades at the speed of light with our optimized matching engine",
      icon: <Zap className="h-6 w-6 text-crypto-purple" />,
      animation: "translate-y-0 opacity-100"
    },
    {
      title: "Low Trading Fees",
      description: "Enjoy some of the lowest trading fees in the industry. More savings, more profits",
      icon: <Activity className="h-6 w-6 text-crypto-purple" />,
      animation: "translate-y-0 opacity-100"
    }
  ];

  useEffect(() => {
    // Rotate through features
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(featureInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-crypto-dark/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-crypto-gradient flex items-center justify-center">
              {/* Paper plane logo */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21 5L2 12.5L9 13.5"></path>
                <path d="M9 13.5L13 21L15 14.5L21 5"></path>
                <path d="M2 12.5L9 13.5L13 21"></path>
              </svg>
            </div>
            <span className="font-bold text-xl text-white">SimplMonie</span>
          </div>
          
          <div>
            <Button 
              asChild
              variant="ghost" 
              className="border border-gray-700 text-gray-200 hover:bg-gray-800"
            >
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Dashboard" : "Sign In"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-crypto-dark">
        <div className="absolute inset-0 bg-crypto-gradient opacity-5 blur-3xl"></div>
        <div className="container mx-auto px-4 pt-12 pb-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-8 animate-fade-in">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-gradient">Simply</span> Better <br/> Digital Finance
                </h1>
                <p className="mt-6 text-lg text-gray-300 max-w-2xl">
                  Trade cryptocurrencies, participate in token launches, and enjoy gaming rewards 
                  all in one secure and intuitive platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  asChild
                  size="lg" 
                  className="bg-crypto-purple hover:bg-crypto-purple/90 text-white font-medium relative overflow-hidden"
                >
                  <Link to={user ? "/dashboard" : "/auth"}>
                    {user ? "Dashboard" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
                    <span className="absolute inset-0 bg-white/10 animate-pulse-glow pointer-events-none"></span>
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  variant="outline" 
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <Link to="/exchange">
                    Start Trading
                  </Link>
                </Button>
              </div>

              {/* Live Tickers */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {loading ? (
                    Array(4).fill(0).map((_, index) => (
                      <div key={index} className="flex-shrink-0">
                        <div className="w-20 h-4 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                        <div className="w-24 h-6 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                        <div className="w-16 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                      </div>
                    ))
                  ) : (
                    currentPrices.map((ticker, index) => (
                      <div key={index} className="flex-shrink-0">
                        <p className="text-sm text-gray-400">{ticker.symbol}</p>
                        <p className="text-xl font-bold">${ticker.price.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        <p className={`text-xs ${ticker.change24h.startsWith('+') ? 'text-crypto-green' : 'text-crypto-red'}`}>
                          {ticker.change24h}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Interactive Preview */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-crypto-gradient opacity-10 blur-3xl rounded-full animate-pulse-glow"></div>
              <div className="glass-card relative rounded-2xl overflow-hidden border border-gray-700/50 w-full max-w-md transform hover:scale-105 transition-all duration-500">
                <div className="p-6 pb-0">
                  <h3 className="text-xl font-semibold mb-4">Trading Preview</h3>
                  {!loading && currentPrices.length > 0 ? (
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-sm text-gray-400">{currentPrices[0].symbol}</p>
                        <p className={`text-xl font-bold ${currentPrices[0].change24h.startsWith('+') ? 'text-crypto-green' : 'text-crypto-red'}`}>
                          ${currentPrices[0].price.toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </p>
                        <p className={`text-xs ${currentPrices[0].change24h.startsWith('+') ? 'text-crypto-green' : 'text-crypto-red'}`}>
                          {currentPrices[0].change24h}
                        </p>
                      </div>
                      <div className="h-16 w-24 bg-crypto-purple/10 rounded-lg flex items-center justify-center relative">
                        {/* Dynamic chart placeholder with animated line */}
                        <svg viewBox="0 0 100 40" className="w-full h-full">
                          <path 
                            d="M0,20 C15,15 20,25 30,15 C40,5 50,20 60,10 C70,0 80,15 90,5 L90,40 L0,40 Z" 
                            fill="rgba(100, 77, 255, 0.1)"
                            stroke="#644DFF"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="w-20 h-4 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                        <div className="w-24 h-6 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                        <div className="w-16 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                      </div>
                      <div className="h-16 w-24 bg-gray-700/50 rounded animate-pulse"></div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">24h Volume</p>
                      {!loading && currentPrices.length > 0 ? (
                        <p className="font-medium">${(currentPrices[0].volume24h / 1e9).toFixed(1)}B</p>
                      ) : (
                        <div className="w-16 h-5 bg-gray-700/50 rounded animate-pulse"></div>
                      )}
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">24h Change</p>
                      {!loading && currentPrices.length > 0 ? (
                        <p className={`font-medium ${currentPrices[0].change24h.startsWith('+') ? 'text-crypto-green' : 'text-crypto-red'}`}>
                          {currentPrices[0].change24h}
                        </p>
                      ) : (
                        <div className="w-16 h-5 bg-gray-700/50 rounded animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 bg-crypto-purple/10 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Trade Now</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="h-8 px-2 py-1 text-xs bg-crypto-purple/20 hover:bg-crypto-purple/40">Buy</Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 py-1 text-xs bg-gray-700/50 hover:bg-gray-700">Sell</Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-48 w-full bg-crypto-purple/5 mt-6 relative overflow-hidden">
                  {/* Advanced animated chart */}
                  <div className="absolute inset-0 flex items-end">
                    <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                      <path
                        d="M0,50 C30,30 70,80 100,50 C130,20 170,60 200,40 C230,20 270,60 300,30 C330,10 370,50 400,30"
                        fill="none"
                        stroke="#644DFF"
                        strokeWidth="2"
                        className="animate-pulse-glow"
                      />
                      <path
                        d="M0,50 C30,30 70,80 100,50 C130,20 170,60 200,40 C230,20 270,60 300,30 C330,10 370,50 400,30"
                        fill="none"
                        stroke="#33FFE0"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        className="opacity-70"
                      />
                    </svg>
                  </div>
                  {/* Time periods */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 py-2 bg-gray-900/50 text-xs">
                    <span className="text-crypto-purple">1H</span>
                    <span>1D</span>
                    <span>1W</span>
                    <span>1M</span>
                    <span>1Y</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-crypto-blue py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SimplMonie?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Discover how we're changing the way people interact with digital assets</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 transform transition-all duration-500 ${index === activeFeature ? 'scale-105 border-crypto-purple/50' : 'scale-100'}`}
              >
                <div className="h-12 w-12 rounded-full bg-crypto-purple/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-crypto-dark py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-crypto-gradient opacity-5 blur-3xl"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="text-4xl font-bold text-gradient mb-2">$2.8B</div>
              <p className="text-gray-300">24h Trading Volume</p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="text-4xl font-bold text-gradient mb-2">2.5M+</div>
              <p className="text-gray-300">Global Users</p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="text-4xl font-bold text-gradient mb-2">40+</div>
              <p className="text-gray-300">Digital Assets</p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="text-4xl font-bold text-gradient mb-2">99.9%</div>
              <p className="text-gray-300">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-crypto-blue py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Trading Journey?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">Join millions of users and start trading today with our secure and user-friendly platform.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg" 
              className="bg-crypto-purple hover:bg-crypto-purple/90 text-white font-medium"
            >
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Go to Dashboard" : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline" 
              className="border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              <Link to="/exchange">
                Explore the Platform
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Learn more section */}
      <div className="bg-crypto-dark py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-crypto-gradient opacity-5 blur-3xl"></div>
        <div className="container mx-auto px-4 text-center">
          <Button variant="ghost" className="text-gray-400 hover:text-white group">
            Learn more <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:translate-y-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
