import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const Auth: React.FC = () => {
  return (
    <div data-testid="auth-container" className="min-h-screen bg-crypto-dark flex flex-col">
      <div className="p-4">
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div data-testid="auth-content" className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Auth;
