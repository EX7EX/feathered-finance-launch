
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState('login');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (tab === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-crypto-dark flex flex-col">
      <div className="flex items-center p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-crypto-gradient flex items-center justify-center mb-4">
              <span className="font-bold text-white text-lg">FX</span>
            </div>
            <h2 className="text-2xl font-bold">Welcome to FeatheredX</h2>
            <p className="text-gray-400 mt-2">The next-gen decentralized trading experience</p>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-gray-800 bg-crypto-blue/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                
                <form onSubmit={handleAuth}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button variant="link" className="p-0 text-xs h-auto text-crypto-purple" type="button" onClick={() => navigate('/forgot-password')}>
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full bg-crypto-purple hover:bg-crypto-purple/90" 
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" /> Sign In
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-gray-800 bg-crypto-blue/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Enter your details to create a new account</CardDescription>
                </CardHeader>
                
                <form onSubmit={handleAuth}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full bg-crypto-purple hover:bg-crypto-purple/90" 
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" /> Create Account
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
