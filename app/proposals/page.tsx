'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowLeft,
  Vote,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Minus,
  Plus,
  Eye,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface Proposal {
  id: string
  title: string
  description: string
  type: string
  status: string
  created_at: string
  voting_ends_at: string
  proposer_id: string
  for_votes: number
  against_votes: number
  abstain_votes: number
  total_votes: number
  user_profiles?: {
    full_name: string
    avatar_url: string
  }
}

export default function ProposalsPage() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('dao_proposals')
        .select(`
          *,
          user_profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProposals(data || [])
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProposalStatus = (proposal: Proposal) => {
    const now = new Date()
    const endDate = new Date(proposal.voting_ends_at)
    
    if (proposal.status === 'cancelled') return 'cancelled'
    if (now > endDate) return proposal.for_votes > proposal.against_votes ? 'passed' : 'failed'
    return 'active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500 text-white'
      case 'passed': return 'bg-green-500 text-white'
      case 'failed': return 'bg-red-500 text-white'
      case 'cancelled': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? (votes / total) * 100 : 0
  }

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true
    return getProposalStatus(proposal) === filter
  })

  const getDaysLeft = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Vote className="w-8 h-8 text-purple-600" />
              All Proposals
            </h1>
            <p className="text-gray-600">
              View and participate in community governance decisions
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dao">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to DAO
              </Button>
            </Link>
            {user && (
              <Link href="/dao">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Proposal
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'All Proposals', count: proposals.length },
            { key: 'active', label: 'Active', count: proposals.filter(p => getProposalStatus(p) === 'active').length },
            { key: 'passed', label: 'Passed', count: proposals.filter(p => getProposalStatus(p) === 'passed').length },
            { key: 'failed', label: 'Failed', count: proposals.filter(p => getProposalStatus(p) === 'failed').length },
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {label}
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{proposals.length}</div>
              <p className="text-sm text-gray-600">Total Proposals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {proposals.filter(p => getProposalStatus(p) === 'active').length}
              </div>
              <p className="text-sm text-gray-600">Active Voting</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {proposals.filter(p => getProposalStatus(p) === 'passed').length}
              </div>
              <p className="text-sm text-gray-600">Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">
                {proposals.reduce((sum, p) => sum + p.total_votes, 0)}
              </div>
              <p className="text-sm text-gray-600">Total Votes Cast</p>
            </CardContent>
          </Card>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Proposals Found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? 'No proposals have been created yet.' 
                  : `No ${filter} proposals found.`}
              </p>
              {user && filter === 'all' && (
                <Link href="/dao">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Proposal
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredProposals.map((proposal) => {
              const status = getProposalStatus(proposal)
              const forPercentage = getVotePercentage(proposal.for_votes, proposal.total_votes)
              const againstPercentage = getVotePercentage(proposal.against_votes, proposal.total_votes)
              const abstainPercentage = getVotePercentage(proposal.abstain_votes, proposal.total_votes)
              const daysLeft = getDaysLeft(proposal.voting_ends_at)

              return (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(status)}>
                            {status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{proposal.type}</Badge>
                          {status === 'active' && daysLeft > 0 && (
                            <Badge variant="secondary" className="text-blue-600">
                              {daysLeft} days left
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {proposal.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Proposer Info */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={proposal.user_profiles?.avatar_url} />
                        <AvatarFallback>
                          {proposal.user_profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>Proposed by {proposal.user_profiles?.full_name || 'Anonymous'}</span>
                      <span>•</span>
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Voting Results */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          For ({proposal.for_votes})
                        </span>
                        <span className="font-medium">{forPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={forPercentage} className="h-2 bg-gray-200">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${forPercentage}%` }} />
                      </Progress>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Against ({proposal.against_votes})
                        </span>
                        <span className="font-medium">{againstPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={againstPercentage} className="h-2 bg-gray-200">
                        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${againstPercentage}%` }} />
                      </Progress>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Minus className="w-4 h-4 text-gray-600" />
                          Abstain ({proposal.abstain_votes})
                        </span>
                        <span className="font-medium">{abstainPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={abstainPercentage} className="h-2 bg-gray-200">
                        <div className="h-full bg-gray-500 rounded-full transition-all" style={{ width: `${abstainPercentage}%` }} />
                      </Progress>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {proposal.total_votes} votes
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Ends {new Date(proposal.voting_ends_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/dao`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {status === 'active' && user && (
                          <Link href={`/dao`}>
                            <Button size="sm">
                              <Vote className="w-4 h-4 mr-2" />
                              Vote Now
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
