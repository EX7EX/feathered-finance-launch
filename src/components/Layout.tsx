
import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-crypto-dark">
      {isMobile ? <MobileNav /> : <Navbar />}
      <div className="flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1 p-4 md:p-6 pb-24">
          {children}
        </main>
      </div>
      {isMobile && <div className="h-16"></div>}
    </div>
  );
};

export default Layout;
