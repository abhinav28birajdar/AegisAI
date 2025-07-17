'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useWeb3 } from '@/lib/web3-context';
import { useReputationToken, useUserComplaints } from '@/lib/blockchain-hooks';
import { MainLayout } from '@/components/layout/main-layout';
import { 
  Wallet, 
  Shield, 
  Coins, 
  TrendingUp, 
  Star, 
  FileText,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Trophy,
  Users,
  Target
} from 'lucide-react';

interface DashboardStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  reputationRank: string;
  weeklyActivity: number;
}

export default function Web3Dashboard() {
  const { 
    isConnected, 
    address, 
    connect, 
    reputation, 
    complaintCount, 
    isVerified,
    carvDID 
  } = useWeb3();
  
  const { 
    balance, 
    reputation: tokenReputation, 
    tier, 
    isLoading: tokenLoading 
  } = useReputationToken();
  
  const { complaintIds, isLoading: complaintsLoading } = useUserComplaints();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    reputationRank: 'Newcomer',
    weeklyActivity: 0
  });

  const [achievements, setAchievements] = useState([
    { id: 1, title: 'First Complaint', description: 'Submitted your first complaint', unlocked: true, icon: FileText },
    { id: 2, title: 'Verified Citizen', description: 'Completed CARV verification', unlocked: isVerified, icon: Shield },
    { id: 3, title: 'Community Champion', description: 'Earned 100+ reputation points', unlocked: Number(tokenReputation) >= 100, icon: Trophy },
    { id: 4, title: 'Problem Solver', description: 'Had 5 complaints resolved', unlocked: false, icon: Target },
  ]);

  useEffect(() => {
    // Load dashboard data
    loadDashboardStats();
  }, [isConnected, address]);

  const loadDashboardStats = async () => {
    if (!isConnected) return;

    try {
      // Mock data for now - in real app, fetch from blockchain/database
      setStats({
        totalComplaints: complaintCount,
        resolvedComplaints: Math.floor(complaintCount * 0.6),
        pendingComplaints: Math.floor(complaintCount * 0.4),
        reputationRank: getReputationRank(Number(tokenReputation)),
        weeklyActivity: 3
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const getReputationRank = (reputation: number): string => {
    if (reputation >= 10000) return 'Diamond Citizen';
    if (reputation >= 5000) return 'Platinum Citizen';
    if (reputation >= 1000) return 'Gold Citizen';
    if (reputation >= 500) return 'Silver Citizen';
    if (reputation >= 100) return 'Bronze Citizen';
    return 'Newcomer';
  };

  const getTierProgress = (currentTier: number): number => {
    const thresholds = [100, 500, 1000, 5000, 10000];
    const currentThreshold = thresholds[currentTier] || 0;
    const nextThreshold = thresholds[currentTier + 1] || 10000;
    const reputationValue = typeof tokenReputation === 'number' ? tokenReputation : parseInt(tokenReputation as string) || 0;
    const progress = ((reputationValue - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (!isConnected) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <Wallet className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to access your AegisAI dashboard and track your civic engagement.
              </p>
              <Button onClick={connect} className="w-full">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-400" />
              AegisAI Dashboard
            </h1>
            <p className="text-xl text-slate-300">
              Your decentralized civic engagement hub
            </p>
          </div>

          {/* Wallet Info */}
          <Card className="mb-6 border-blue-500 bg-blue-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Wallet className="w-6 h-6 text-blue-400 mr-3" />
                  <div>
                    <h3 className="font-bold text-lg">Wallet Connected</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {address?.slice(0, 8)}...{address?.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-bold">{balance} MATIC</p>
                </div>
              </div>
              
              {carvDID && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge variant={isVerified ? "default" : "secondary"}>
                      {isVerified ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      {isVerified ? 'CARV Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">DID: {carvDID}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Reputation Score */}
            <Card className="border-purple-500 bg-purple-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Star className="w-4 h-4 mr-2 text-purple-400" />
                  Reputation Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tokenLoading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <>
                    <p className="text-2xl font-bold">{tokenReputation}</p>
                    <p className="text-xs text-muted-foreground">{stats.reputationRank}</p>
                    <div className="mt-2">
                      <Progress value={getTierProgress(typeof tier === 'number' ? tier : 0)} className="h-2" />
                      <p className="text-xs mt-1">Tier {(typeof tier === 'number' ? tier : 0) + 1}/6</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Complaints */}
            <Card className="border-green-500 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-400" />
                  Total Complaints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalComplaints}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.resolvedComplaints} resolved
                </p>
              </CardContent>
            </Card>

            {/* Token Balance */}
            <Card className="border-yellow-500 bg-yellow-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Coins className="w-4 h-4 mr-2 text-yellow-400" />
                  ART Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{balance}</p>
                <p className="text-xs text-muted-foreground">
                  Reputation tokens earned
                </p>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="border-blue-500 bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.weeklyActivity}</p>
                <p className="text-xs text-muted-foreground">
                  Actions this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>
                Unlock achievements by participating in civic governance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center p-3 rounded-lg border ${
                        achievement.unlocked
                          ? 'border-green-500 bg-green-500/5'
                          : 'border-slate-600 bg-slate-800/20'
                      }`}
                    >
                      <IconComponent 
                        className={`w-8 h-8 mr-3 ${
                          achievement.unlocked ? 'text-green-400' : 'text-slate-500'
                        }`} 
                      />
                      <div>
                        <h4 className={`font-medium ${
                          achievement.unlocked ? 'text-white' : 'text-slate-400'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest civic engagement actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complaintsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (Array.isArray(complaintIds) && complaintIds.length > 0) ? (
                <div className="space-y-3">
                  {complaintIds.slice(0, 5).map((id: any, index: number) => (
                    <div key={id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-400 mr-3" />
                        <div>
                          <p className="font-medium">Complaint #{id}</p>
                          <p className="text-sm text-muted-foreground">
                            Submitted to blockchain
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity yet</p>
                  <p className="text-sm text-muted-foreground">
                    Submit your first complaint to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
