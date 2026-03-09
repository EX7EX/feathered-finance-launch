import { useAuth } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, isLoading, error } = useUserProfile();

  if (isLoading) {
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
    return (
      <div className="container mx-auto text-center text-destructive">
        <p>Error loading profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Profile</h1>
      <Card className="w-full max-w-lg mx-auto bg-card border-border">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
            <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{profile.username || 'Anonymous User'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-medium">Email</span>
            <span className="text-muted-foreground">{user?.email || 'Not set'}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-medium">Full Name</span>
            <span className="text-muted-foreground">{profile.full_name || 'Not set'}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-medium">KYC Status</span>
            <span className={`font-bold ${profile.kyc_verified ? 'text-accent' : 'text-muted-foreground'}`}>
              {profile.kyc_verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
