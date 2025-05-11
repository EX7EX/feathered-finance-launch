
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RocketIcon, ClockIcon, Calendar, ArrowRightIcon, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Launchpad = () => {
  const { toast } = useToast();
  
  const handleParticipate = (project: string) => {
    toast({
      title: "Participation Request",
      description: `Your request to participate in ${project} has been recorded. This is a demo.`,
    });
  };
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const projects = [
    {
      id: 1,
      name: "QuantumX",
      logo: "Q",
      description: "Next-gen DeFi protocol with cross-chain capabilities",
      raisedAmount: 850000,
      targetAmount: 1000000,
      percentageComplete: 85,
      participants: 3246,
      startDate: "2023-06-15",
      endDate: "2023-06-30",
      status: "active",
    },
    {
      id: 2,
      name: "NeuralChain",
      logo: "N",
      description: "AI-powered blockchain for decentralized machine learning",
      raisedAmount: 1200000,
      targetAmount: 1500000,
      percentageComplete: 80,
      participants: 5189,
      startDate: "2023-06-10",
      endDate: "2023-06-25",
      status: "active",
    },
    {
      id: 3,
      name: "EcoLedger",
      logo: "E",
      description: "Sustainable blockchain focused on carbon neutrality",
      raisedAmount: 300000,
      targetAmount: 750000,
      percentageComplete: 40,
      participants: 1872,
      startDate: "2023-06-18",
      endDate: "2023-07-02",
      status: "active",
    },
    {
      id: 4,
      name: "MetaFinance",
      logo: "M",
      description: "Metaverse financial infrastructure project",
      raisedAmount: 2500000,
      targetAmount: 2500000,
      percentageComplete: 100,
      participants: 7452,
      startDate: "2023-05-20",
      endDate: "2023-06-05",
      status: "completed",
    },
    {
      id: 5,
      name: "DeFiGuard",
      logo: "D",
      description: "Security-focused DeFi insurance protocol",
      raisedAmount: 0,
      targetAmount: 1200000,
      percentageComplete: 0,
      participants: 0,
      startDate: "2023-07-01",
      endDate: "2023-07-15",
      status: "upcoming",
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <RocketIcon className="h-6 w-6 mr-2 text-crypto-purple" /> Launchpad
            </h1>
            <p className="text-gray-400">Discover and participate in new token launches.</p>
          </div>
          
          <Button className="bg-crypto-purple hover:bg-crypto-purple/90">
            Submit Your Project
          </Button>
        </div>
        
        <Card className="bg-crypto-card border-gray-800 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-crypto-purple to-crypto-teal opacity-20"></div>
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-crypto-purple/20 text-crypto-purple text-xs font-medium">
                    <RocketIcon className="h-3 w-3 mr-1" /> Featured Launch
                  </div>
                  <h2 className="text-2xl font-bold">FeatheredX Ecosystem Token</h2>
                  <p className="text-gray-300 max-w-xl">The native token powering the FeatheredX hybrid exchange, launchpad and gaming ecosystem. Participate in the initial token offering to get early access.</p>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-400">Starts in</p>
                    <p className="text-2xl font-bold">2 days 14 hours</p>
                  </div>
                  <Button className="bg-crypto-purple hover:bg-crypto-purple/90">
                    Get Notified
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md bg-crypto-blue">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.filter(project => project.status === "active").map((project) => (
                <Card key={project.id} className="bg-crypto-card border-gray-800 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-crypto-purple/20 text-crypto-purple flex items-center justify-center font-bold">
                        {project.logo}
                      </div>
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4 mt-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span>{project.percentageComplete}%</span>
                        </div>
                        <Progress value={project.percentageComplete} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Raised Amount</p>
                          <p className="font-medium">${project.raisedAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Target Amount</p>
                          <p className="font-medium">${project.targetAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Ends On</p>
                            <p className="text-sm">{formatDate(project.endDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Participants</p>
                            <p className="text-sm">{project.participants.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-crypto-purple hover:bg-crypto-purple/90"
                      onClick={() => handleParticipate(project.name)}
                    >
                      Participate Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.filter(project => project.status === "upcoming").map((project) => (
                <Card key={project.id} className="bg-crypto-card border-gray-800 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-crypto-purple/20 text-crypto-purple flex items-center justify-center font-bold">
                        {project.logo}
                      </div>
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Target Amount</p>
                        <p className="font-medium">${project.targetAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Start Date</p>
                        <p className="font-medium">{formatDate(project.startDate)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-700" 
                      onClick={() => toast({
                        title: "Notification Set",
                        description: `You will be notified when ${project.name} starts.`,
                      })}
                    >
                      Get Notified
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.filter(project => project.status === "completed").map((project) => (
                <Card key={project.id} className="bg-crypto-card border-gray-800 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-gray-700 text-gray-300 flex items-center justify-center font-bold">
                        {project.logo}
                      </div>
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4 mt-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span>{project.percentageComplete}%</span>
                        </div>
                        <Progress value={project.percentageComplete} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Raised Amount</p>
                          <p className="font-medium">${project.raisedAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Target Amount</p>
                          <p className="font-medium">${project.targetAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Ended On</p>
                            <p className="text-sm">{formatDate(project.endDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Participants</p>
                            <p className="text-sm">{project.participants.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-700"
                      onClick={() => toast({
                        title: "Project Details",
                        description: `${project.name} token distribution is now complete.`,
                      })}
                    >
                      View Details <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <Card className="bg-crypto-card border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <InfoIcon className="h-5 w-5 mr-2 text-crypto-purple" />
              Launchpad Guide
            </CardTitle>
            <CardDescription>How to participate in token sales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-crypto-blue/50 rounded-lg p-4">
                <div className="h-10 w-10 rounded-full bg-crypto-purple/20 text-crypto-purple flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-medium mb-1">Connect Wallet</h3>
                <p className="text-sm text-gray-400">Connect your cryptocurrency wallet to get started.</p>
              </div>
              
              <div className="bg-crypto-blue/50 rounded-lg p-4">
                <div className="h-10 w-10 rounded-full bg-crypto-purple/20 text-crypto-purple flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-medium mb-1">Choose Project</h3>
                <p className="text-sm text-gray-400">Browse and select a project that interests you.</p>
              </div>
              
              <div className="bg-crypto-blue/50 rounded-lg p-4">
                <div className="h-10 w-10 rounded-full bg-crypto-purple/20 text-crypto-purple flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-medium mb-1">Participate</h3>
                <p className="text-sm text-gray-400">Commit funds and receive tokens when the sale ends.</p>
              </div>
            </div>
            
            <Button 
              variant="link" 
              className="text-crypto-purple p-0 h-auto"
            >
              View Complete Guide <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Launchpad;
