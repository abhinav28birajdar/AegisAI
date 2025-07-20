'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import {
  Vote,
  Search,
  Filter,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share
} from 'lucide-react'

interface DAOProposal {
  id: string
  title: string
  description: string
  category: 'infrastructure' | 'environment' | 'social' | 'governance' | 'budget'
  proposer: string
  created_at: string
  voting_deadline: string
  current_votes: number
  required_votes: number
  votes_for: number
  votes_against: number
  support_percentage: number
  status: 'active' | 'passed' | 'failed' | 'pending'
  user_vote?: 'for' | 'against' | null
  discussion_count: number
}

export default function DAOProposalsPage() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<DAOProposal[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'failed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProposals()
    }
  }, [user])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      
      // Mock proposals data with real-time voting system
      const mockProposals: DAOProposal[] = [
        {
          id: '1',
          title: 'Improve Public Transportation Infrastructure',
          description: 'Proposal to expand bus routes, add new bus stops, and implement real-time tracking system for public transportation.',
          category: 'infrastructure',
          proposer: 'Transportation Committee',
          created_at: '2024-07-15',
          voting_deadline: '2024-07-25',
          current_votes: 1247,
          required_votes: 2000,
          votes_for: 973,
          votes_against: 274,
          support_percentage: 78,
          status: 'active',
          user_vote: null,
          discussion_count: 89
        },
        {
          id: '2',
          title: 'Expand Bicycle Lane Network',
          description: 'Create dedicated bicycle lanes throughout the city to promote eco-friendly transportation and improve cyclist safety.',
          category: 'environment',
          proposer: 'Green Initiative Group',
          created_at: '2024-07-10',
          voting_deadline: '2024-07-30',
          current_votes: 856,
          required_votes: 1500,
          votes_for: 556,
          votes_against: 300,
          support_percentage: 65,
          status: 'active',
          user_vote: 'for',
          discussion_count: 156
        },
        {
          id: '3',
          title: 'Community Healthcare Clinic Funding',
          description: 'Allocate budget for establishing a new community healthcare clinic in the underserved area of downtown.',
          category: 'social',
          proposer: 'Healthcare Advocacy Council',
          created_at: '2024-07-05',
          voting_deadline: '2024-07-20',
          current_votes: 2156,
          required_votes: 2000,
          votes_for: 1834,
          votes_against: 322,
          support_percentage: 85,
          status: 'passed',
          user_vote: 'for',
          discussion_count: 234
        },
        {
          id: '4',
          title: 'Smart City IoT Implementation',
          description: 'Deploy IoT sensors across the city for traffic monitoring, air quality tracking, and smart waste management.',
          category: 'infrastructure',
          proposer: 'Tech Innovation Committee',
          created_at: '2024-06-28',
          voting_deadline: '2024-07-18',
          current_votes: 1456,
          required_votes: 2000,
          votes_for: 467,
          votes_against: 989,
          support_percentage: 32,
          status: 'failed',
          user_vote: 'against',
          discussion_count: 98
        },
        {
          id: '5',
          title: 'Community Garden Development Program',
          description: 'Establish community gardens in residential areas to promote local food production and community engagement.',
          category: 'environment',
          proposer: 'Local Food Initiative',
          created_at: '2024-07-20',
          voting_deadline: '2024-08-05',
          current_votes: 234,
          required_votes: 1000,
          votes_for: 198,
          votes_against: 36,
          support_percentage: 85,
          status: 'active',
          user_vote: null,
          discussion_count: 45
        }
      ]

      setProposals(mockProposals)
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const castVote = async (proposalId: string, voteType: 'for' | 'against') => {
    try {
      setProposals(prev =>
        prev.map(proposal => {
          if (proposal.id === proposalId) {
            const currentUserVote = proposal.user_vote
            let newVotesFor = proposal.votes_for
            let newVotesAgainst = proposal.votes_against
            let newCurrentVotes = proposal.current_votes

            // Remove previous vote if exists
            if (currentUserVote === 'for') {
              newVotesFor -= 1
              newCurrentVotes -= 1
            } else if (currentUserVote === 'against') {
              newVotesAgainst -= 1
              newCurrentVotes -= 1
            }

            // Add new vote
            if (voteType === 'for') {
              newVotesFor += 1
              newCurrentVotes += 1
            } else {
              newVotesAgainst += 1
              newCurrentVotes += 1
            }

            const newSupportPercentage = Math.round((newVotesFor / (newVotesFor + newVotesAgainst)) * 100)

            return {
              ...proposal,
              votes_for: newVotesFor,
              votes_against: newVotesAgainst,
              current_votes: newCurrentVotes,
              support_percentage: newSupportPercentage,
              user_vote: voteType
            }
          }
          return proposal
        })
      )

      // In a real implementation, this would update Supabase
      console.log(`Voted ${voteType} on proposal ${proposalId}`)
    } catch (error) {
      console.error('Error casting vote:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'environment':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'social':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'governance':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'budget':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    if (filter !== 'all' && proposal.status !== filter) return false
    if (searchTerm && !proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !proposal.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const activeProposals = proposals.filter(p => p.status === 'active')
  const passedProposals = proposals.filter(p => p.status === 'passed')
  const failedProposals = proposals.filter(p => p.status === 'failed')

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <Vote className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Participate in DAO Governance</h2>
              <p className="text-gray-600 mb-4">Please sign in to view and vote on community proposals.</p>
              <Link href="/auth/signin">
                <Button>Sign In to Vote</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">DAO Proposals</h1>
              <p className="text-gray-600">Vote on important community decisions</p>
            </div>
          </div>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Proposal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Proposals</p>
                  <p className="text-2xl font-bold">{activeProposals.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{passedProposals.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{failedProposals.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Votes</p>
                  <p className="text-2xl font-bold">{proposals.filter(p => p.user_vote).length}</p>
                </div>
                <Vote className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search proposals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="passed">Passed</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Proposals List */}
        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
                <p className="text-gray-600">No proposals match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={getCategoryColor(proposal.category)}
                      >
                        {proposal.category}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </Badge>
                    </div>
                    {proposal.user_vote && (
                      <Badge className={proposal.user_vote === 'for' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        Voted {proposal.user_vote === 'for' ? 'For' : 'Against'}
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl">{proposal.title}</CardTitle>
                  <CardDescription>{proposal.description}</CardDescription>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span>By {proposal.proposer}</span>
                    <span>•</span>
                    <span>Created {new Date(proposal.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Deadline {new Date(proposal.voting_deadline).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Voting Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{proposal.current_votes} votes of {proposal.required_votes} required</span>
                      <span>{proposal.support_percentage}% support</span>
                    </div>
                    <Progress 
                      value={(proposal.current_votes / proposal.required_votes) * 100} 
                      className="h-2 mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>For: {proposal.votes_for}</span>
                      <span>Against: {proposal.votes_against}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {proposal.status === 'active' && (
                      <>
                        <Button
                          variant={proposal.user_vote === 'for' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => castVote(proposal.id, 'for')}
                          className="flex-1"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Vote For
                        </Button>
                        <Button
                          variant={proposal.user_vote === 'against' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => castVote(proposal.id, 'against')}
                          className="flex-1"
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          Vote Against
                        </Button>
                      </>
                    )}
                    
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Discuss ({proposal.discussion_count})
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}
