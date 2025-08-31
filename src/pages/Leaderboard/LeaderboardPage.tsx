import React from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const LeaderboardPage = () => {
  const { leaderboard, loading, error } = useLeaderboard();

  const renderTrophy = (rank: number) => {
    if (rank === 0) return '🏆';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return rank + 1;
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Leaderboard</h1>
        <Card className="bg-crypto-card border-gray-800">
          <CardHeader>
            <CardTitle>Top Traders</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto text-center text-red-500">Error loading leaderboard.</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Leaderboard</h1>
      <Card className="bg-crypto-card border-gray-800">
        <CardHeader>
          <CardTitle>Top Traders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Total Volume (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((user, index) => (
                <TableRow key={user.id} className="border-gray-800">
                  <TableCell className="font-medium text-lg">{renderTrophy(index)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{user.username || 'Anonymous'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-crypto-purple">{user.points.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${user.total_volume_usd.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
