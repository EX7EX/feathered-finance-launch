
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Lock, UserPlus, LogIn, Phone, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState('login');
  const [authMethod, setAuthMethod] = useState('email');
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signInWithApple, 
    signInWithFacebook,
    signInWithPhone, 
    user 
  } = useAuth();
  const { toast } = useToast();
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

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Format the phone number to E.164 format (required by Supabase)
      let formattedPhone = phone;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      
      await signInWithPhone(formattedPhone);
      
    } catch (error) {
      console.error('Phone authentication error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'apple':
          await signInWithApple();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
        default:
          toast({
            title: "Provider Not Supported",
            description: "This authentication provider is not currently supported.",
            variant: "destructive"
          });
      }
    } catch (error) {
      console.error(`${provider} authentication error:`, error);
    }
  };

  const handleWalletAuth = () => {
    toast({
      title: "Wallet Authentication",
      description: "Please connect your wallet to authenticate.",
    });
    // In a real app, we would integrate with web3 wallets here
    // For now, we use this as a demo only
  };

  const AuthMethodSelector = () => (
    <RadioGroup
      className="flex flex-col space-y-3 mt-4"
      value={authMethod}
      onValueChange={setAuthMethod}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="email" id="auth-email" />
        <Label htmlFor="auth-email" className="flex items-center">
          <Mail className="mr-2 h-4 w-4" /> Email & Password
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="phone" id="auth-phone" />
        <Label htmlFor="auth-phone" className="flex items-center">
          <Phone className="mr-2 h-4 w-4" /> Phone Number
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="wallet" id="auth-wallet" />
        <Label htmlFor="auth-wallet" className="flex items-center">
          <Wallet className="mr-2 h-4 w-4" /> Crypto Wallet
        </Label>
      </div>
    </RadioGroup>
  );

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
              {/* Paper plane logo */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21 5L2 12.5L9 13.5"></path>
                <path d="M9 13.5L13 21L15 14.5L21 5"></path>
                <path d="M2 12.5L9 13.5L13 21"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Welcome to SimplMonie</h2>
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
                  <CardDescription>Access your account</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {authMethod === 'email' && (
                    <form onSubmit={handleAuth} className="space-y-4">
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
                    </form>
                  )}

                  {authMethod === 'phone' && (
                    <form onSubmit={handlePhoneAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="pl-9"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Enter your full phone number with country code (e.g. +1 for US)</p>
                      </div>
                      <Button className="w-full bg-crypto-purple hover:bg-crypto-purple/90" 
                        disabled={isSubmitting} 
                        type="submit">
                        {isSubmitting ? (
                          <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        ) : (
                          "Send Verification Code"
                        )}
                      </Button>
                    </form>
                  )}

                  {authMethod === 'wallet' && (
                    <div className="space-y-4">
                      <Button 
                        className="w-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
                        onClick={handleWalletAuth}
                      >
                        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <AuthMethodSelector />
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-crypto-dark px-2 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => handleSocialAuth('google')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="w-5 h-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => handleSocialAuth('apple')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zM12 16.2c-.56.83-1.15 1.7-2.06 1.7-.9 0-1.2-.58-2.22-.58s-1.34.57-2.19.57C4.66 17.89 3 15.69 3 12.12a4.5 4.5 0 0 1 4.13-4.39c.81 0 1.57.55 2.1.55s1.37-.58 2.31-.58a4.42 4.42 0 0 1 3.43 1.87 4.28 4.28 0 0 0-2 3.63 4.14 4.14 0 0 0 2.5 3.8c-.44 1.33-.9 2.69-2.47 2.69a2.88 2.88 0 0 1-1.87-.58A2.84 2.84 0 0 1 12 16.2z"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => handleSocialAuth('facebook')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5">
                        <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-gray-800 bg-crypto-blue/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Enter your details to create a new account</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {authMethod === 'email' && (
                    <form onSubmit={handleAuth} className="space-y-4">
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
                    </form>
                  )}

                  {authMethod === 'phone' && (
                    <form onSubmit={handlePhoneAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="pl-9"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Enter your full phone number with country code</p>
                      </div>
                      <Button className="w-full bg-crypto-purple hover:bg-crypto-purple/90" 
                        disabled={isSubmitting}
                        type="submit">
                        {isSubmitting ? (
                          <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        ) : (
                          "Send Verification Code"
                        )}
                      </Button>
                    </form>
                  )}

                  {authMethod === 'wallet' && (
                    <div className="space-y-4">
                      <Button 
                        className="w-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
                        onClick={handleWalletAuth}
                      >
                        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Connect your wallet to create an account with your blockchain identity
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <AuthMethodSelector />
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-crypto-dark px-2 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => handleSocialAuth('google')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="w-5 h-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => handleSocialAuth('apple')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zM12 16.2c-.56.83-1.15 1.7-2.06 1.7-.9 0-1.2-.58-2.22-.58s-1.34.57-2.19.57C4.66 17.89 3 15.69 3 12.12a4.5 4.5 0 0 1 4.13-4.39c.81 0 1.57.55 2.1.55s1.37-.58 2.31-.58a4.42 4.42 0 0 1 3.43 1.87 4.28 4.28 0 0 0-2 3.63 4.14 4.14 0 0 0 2.5 3.8c-.44 1.33-.9 2.69-2.47 2.69a2.88 2.88 0 0 1-1.87-.58A2.84 2.84 0 0 1 12 16.2z"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => handleSocialAuth('facebook')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5">
                        <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                      </svg>
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
