'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Vote, 
  Plus, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface Proposal {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  category: string;
  voting_power_required: number;
  votes_for: number;
  votes_against: number;
  total_votes: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  creator?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Vote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_type: string;
  voting_power: number;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  reputation_score: number;
}

export default function DAOPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('proposals');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [votingOnProposal, setVotingOnProposal] = useState<string | null>(null);

  // Create proposal form state
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: '',
    voting_power_required: 1000,
    end_date: ''
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, full_name, reputation_score')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile);

        // Fetch user votes
        const { data: votes } = await supabase
          .from('dao_votes')
          .select('*')
          .eq('user_id', user.id);
        
        setUserVotes(votes || []);
      }

      // Fetch proposals with creator info
      const { data: proposalsData } = await supabase
        .from('dao_proposals')
        .select(`
          *,
          creator:creator_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      setProposals(proposalsData || []);
    } catch (error) {
      console.error('Error fetching DAO data:', error);
      toast.error('Failed to load DAO data');
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be signed in to create proposals');
        return;
      }

      if (!newProposal.title || !newProposal.description || !newProposal.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('dao_proposals')
        .insert({
          title: newProposal.title,
          description: newProposal.description,
          creator_id: user.id,
          category: newProposal.category,
          voting_power_required: newProposal.voting_power_required,
          end_date: newProposal.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast.success('Proposal created successfully!');
      setIsCreateDialogOpen(false);
      setNewProposal({
        title: '',
        description: '',
        category: '',
        voting_power_required: 1000,
        end_date: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Failed to create proposal');
    }
  };

  const castVote = async (proposalId: string, voteType: 'for' | 'against' | 'abstain') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be signed in to vote');
        return;
      }

      setVotingOnProposal(proposalId);

      // Check if user already voted
      const existingVote = userVotes.find(v => v.proposal_id === proposalId);
      
      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('dao_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('dao_votes')
          .insert({
            proposal_id: proposalId,
            user_id: user.id,
            vote_type: voteType,
            voting_power: Math.floor((userProfile?.reputation_score || 0) / 100) + 1
          });

        if (error) throw error;
      }

      toast.success(`Vote cast: ${voteType}`);
      fetchData();
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote');
    } finally {
      setVotingOnProposal(null);
    }
  };

  const getProposalStatus = (proposal: Proposal) => {
    const now = new Date();
    const endDate = new Date(proposal.end_date);
    
    if (proposal.status === 'passed') return 'passed';
    if (proposal.status === 'rejected') return 'rejected';
    if (now > endDate) return 'expired';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'passed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getVotingProgress = (proposal: Proposal) => {
    const totalVotes = proposal.votes_for + proposal.votes_against;
    if (totalVotes === 0) return 0;
    return (proposal.votes_for / totalVotes) * 100;
  };

  const getUserVoteForProposal = (proposalId: string) => {
    return userVotes.find(v => v.proposal_id === proposalId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Civic DAO
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Participate in community governance and decision-making
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter proposal title"
                />
              </div>
              
              <div>
                <Textarea
                  id="description"
                  label="Description"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your proposal in detail"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newProposal.category} 
                  onValueChange={(value) => setNewProposal(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Environment">Environment</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Budget">Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="voting_power">Minimum Voting Power Required</Label>
                <Input
                  id="voting_power"
                  type="number"
                  value={newProposal.voting_power_required}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, voting_power_required: parseInt(e.target.value) }))}
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">Voting End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={newProposal.end_date}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={createProposal} className="flex-1">
                  Create Proposal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Votes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => getProposalStatus(p) === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Voting Power</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((userProfile?.reputation_score || 0) / 100) + 1}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.length > 0 ? Math.round((userVotes.length / proposals.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="proposals">All Proposals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="my-votes">My Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="mt-6">
          <div className="space-y-6">
            {proposals.map((proposal) => {
              const status = getProposalStatus(proposal);
              const userVote = getUserVoteForProposal(proposal.id);
              const votingProgress = getVotingProgress(proposal);

              return (
                <Card key={proposal.id} className="border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(status)} text-white`}>
                            {status.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary">{proposal.category}</Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {proposal.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {proposal.creator?.full_name || 'Anonymous'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Ends: {new Date(proposal.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Voting Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>For: {proposal.votes_for}</span>
                        <span>Against: {proposal.votes_against}</span>
                      </div>
                      <Progress value={votingProgress} className="h-2" />
                    </div>

                    {/* Voting Buttons */}
                    {status === 'active' && userProfile && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => castVote(proposal.id, 'for')}
                          disabled={votingOnProposal === proposal.id}
                          variant={userVote?.vote_type === 'for' ? 'primary' : 'outline'}
                          size="sm"
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Vote For
                        </Button>
                        <Button
                          onClick={() => castVote(proposal.id, 'against')}
                          disabled={votingOnProposal === proposal.id}
                          variant={userVote?.vote_type === 'against' ? 'danger' : 'outline'}
                          size="sm"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Vote Against
                        </Button>
                        <Button
                          onClick={() => castVote(proposal.id, 'abstain')}
                          disabled={votingOnProposal === proposal.id}
                          variant={userVote?.vote_type === 'abstain' ? 'secondary' : 'outline'}
                          size="sm"
                          className="flex-1"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Abstain
                        </Button>
                      </div>
                    )}

                    {userVote && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          You voted: <strong>{userVote.vote_type.toUpperCase()}</strong> 
                          {userVote.voting_power > 1 && ` (${userVote.voting_power} voting power)`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-6">
            {proposals
              .filter(p => getProposalStatus(p) === 'active')
              .map((proposal) => (
                <Card key={proposal.id} className="border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-500 text-white">ACTIVE</Badge>
                          <Badge variant="secondary">{proposal.category}</Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {proposal.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="passed" className="mt-6">
          <div className="space-y-6">
            {proposals
              .filter(p => getProposalStatus(p) === 'passed')
              .map((proposal) => (
                <Card key={proposal.id} className="border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-500 text-white">PASSED</Badge>
                          <Badge variant="secondary">{proposal.category}</Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {proposal.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="my-votes" className="mt-6">
          <div className="space-y-6">
            {proposals
              .filter(p => getUserVoteForProposal(p.id))
              .map((proposal) => {
                const userVote = getUserVoteForProposal(proposal.id);
                const status = getProposalStatus(proposal);

                return (
                  <Card key={proposal.id} className="border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getStatusColor(status)} text-white`}>
                              {status.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary">{proposal.category}</Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Your vote: {userVote?.vote_type.toUpperCase()}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {proposal.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
