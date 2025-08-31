import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { profile, loading, error } = useUserProfile(user?.id);

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Profile</h1>
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-48 mt-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return <div className="container mx-auto text-center text-red-500">Error loading profile.</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Profile</h1>
      <Card className="w-full max-w-lg mx-auto bg-crypto-card border-gray-800">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
            <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{profile.username || 'Anonymous User'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
            <span className="font-medium">Points</span>
            <span className="text-lg font-bold text-crypto-purple">{profile.points.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
            <span className="font-medium">Total Trades</span>
            <span className="text-lg font-bold">{profile.total_trades.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
            <span className="font-medium">Total Volume</span>
            <span className="text-lg font-bold">${profile.total_volume_usd.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
