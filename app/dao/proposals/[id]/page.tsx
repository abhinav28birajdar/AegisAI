'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import {
  Vote,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share,
  Clock,
  Users,
  Calendar,
  FileText,
  Send,
  Eye
} from 'lucide-react'

interface ProposalDetails {
  id: string
  title: string
  description: string
  full_description: string
  category: string
  proposer: string
  proposer_avatar: string
  created_at: string
  voting_deadline: string
  current_votes: number
  required_votes: number
  votes_for: number
  votes_against: number
  support_percentage: number
  status: string
  user_vote?: 'for' | 'against' | null
  discussion_count: number
  budget_required?: number
  implementation_timeline?: string
  impact_areas: string[]
}

interface Comment {
  id: string
  user_name: string
  user_avatar: string
  content: string
  created_at: string
  vote_type?: 'for' | 'against'
}

export default function ProposalDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const proposalId = params.id as string
  
  const [proposal, setProposal] = useState<ProposalDetails | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (proposalId) {
      fetchProposalDetails()
      fetchComments()
    }
  }, [proposalId])

  const fetchProposalDetails = async () => {
    try {
      setLoading(true)
      
      // Mock proposal details (in real app, fetch from Supabase)
      const mockProposal: ProposalDetails = {
        id: proposalId,
        title: 'Improve Public Transportation Infrastructure',
        description: 'Comprehensive proposal to enhance public transportation system citywide.',
        full_description: `
This proposal outlines a comprehensive plan to improve our city's public transportation infrastructure. The initiative includes:

**Key Components:**
1. **Bus Route Expansion**: Add 15 new bus routes to underserved areas
2. **Real-time Tracking**: Implement GPS tracking and mobile app for real-time bus locations
3. **Accessibility Improvements**: Upgrade all bus stops with wheelchair accessibility
4. **Electric Fleet**: Transition 40% of the bus fleet to electric vehicles
5. **Payment System**: Introduce contactless payment options and mobile ticketing

**Expected Benefits:**
- Reduced traffic congestion by 25%
- Improved air quality through electric vehicle adoption
- Better accessibility for disabled community members
- Increased ridership by an estimated 35%
- Annual savings of $2.3M in fuel costs

**Implementation Timeline:**
- Phase 1 (Months 1-6): Route planning and infrastructure assessment
- Phase 2 (Months 7-18): Construction of new bus stops and route implementation
- Phase 3 (Months 19-24): Technology integration and electric fleet deployment

**Budget Breakdown:**
- Infrastructure: $12.5M
- Technology Systems: $3.2M
- Electric Vehicles: $8.7M
- Maintenance & Operations: $2.1M annually

This investment will significantly improve quality of life for all residents while supporting our environmental sustainability goals.
        `,
        category: 'infrastructure',
        proposer: 'Transportation Committee',
        proposer_avatar: '/avatars/committee.jpg',
        created_at: '2024-07-15',
        voting_deadline: '2024-07-25',
        current_votes: 1247,
        required_votes: 2000,
        votes_for: 973,
        votes_against: 274,
        support_percentage: 78,
        status: 'active',
        user_vote: null,
        discussion_count: 89,
        budget_required: 26500000,
        implementation_timeline: '24 months',
        impact_areas: ['Transportation', 'Environment', 'Accessibility', 'Economy']
      }
      
      setProposal(mockProposal)
    } catch (error) {
      console.error('Error fetching proposal details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      // Mock comments (in real app, fetch from Supabase)
      const mockComments: Comment[] = [
        {
          id: '1',
          user_name: 'Sarah Johnson',
          user_avatar: '/avatars/sarah.jpg',
          content: 'This is exactly what our city needs! The current bus system is outdated and unreliable. I support this proposal wholeheartedly.',
          created_at: '2024-07-16T10:30:00Z',
          vote_type: 'for'
        },
        {
          id: '2',
          user_name: 'Mike Chen',
          user_avatar: '/avatars/mike.jpg',
          content: 'While I appreciate the goals, the budget seems quite high. Have we considered phasing this implementation to spread costs over more years?',
          created_at: '2024-07-16T14:15:00Z'
        },
        {
          id: '3',
          user_name: 'Emily Rodriguez',
          user_avatar: '/avatars/emily.jpg',
          content: 'The accessibility improvements are crucial. As someone who uses a wheelchair, the current bus stops are a major barrier. This gets my vote.',
          created_at: '2024-07-17T09:45:00Z',
          vote_type: 'for'
        },
        {
          id: '4',
          user_name: 'David Thompson',
          user_avatar: '/avatars/david.jpg',
          content: 'I have concerns about the environmental impact during construction. Has an environmental impact assessment been conducted?',
          created_at: '2024-07-17T16:20:00Z'
        }
      ]
      
      setComments(mockComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const castVote = async (voteType: 'for' | 'against') => {
    if (!proposal) return
    
    try {
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

      setProposal({
        ...proposal,
        votes_for: newVotesFor,
        votes_against: newVotesAgainst,
        current_votes: newCurrentVotes,
        support_percentage: newSupportPercentage,
        user_vote: voteType
      })

      console.log(`Voted ${voteType} on proposal ${proposalId}`)
    } catch (error) {
      console.error('Error casting vote:', error)
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || !user) return
    
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
        user_avatar: user.user_metadata?.avatar_url || '/avatars/default.jpg',
        content: newComment,
        created_at: new Date().toISOString()
      }
      
      setComments(prev => [comment, ...prev])
      setNewComment('')
      
      if (proposal) {
        setProposal({
          ...proposal,
          discussion_count: proposal.discussion_count + 1
        })
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return time.toLocaleDateString()
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!proposal) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Proposal Not Found</h1>
          <p className="text-gray-600 mb-4">The proposal you're looking for doesn't exist.</p>
          <Link href="/dao/proposals">
            <Button>Back to Proposals</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <Vote className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In to Participate</h2>
              <p className="text-gray-600 mb-4">Please sign in to vote and participate in discussions.</p>
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dao/proposals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Proposals
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Watch
            </Button>
          </div>
        </div>

        {/* Proposal Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex gap-2 mb-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {proposal.category}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {proposal.status}
                </Badge>
                {proposal.user_vote && (
                  <Badge className={proposal.user_vote === 'for' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    You voted {proposal.user_vote === 'for' ? 'For' : 'Against'}
                  </Badge>
                )}
              </div>
            </div>
            
            <CardTitle className="text-2xl">{proposal.title}</CardTitle>
            <CardDescription className="text-base">{proposal.description}</CardDescription>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={proposal.proposer_avatar} />
                  <AvatarFallback>{proposal.proposer.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span>By {proposal.proposer}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(proposal.created_at).toLocaleDateString()}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Deadline {new Date(proposal.voting_deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Voting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="w-5 h-5" />
              Voting Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{proposal.current_votes} votes of {proposal.required_votes} required</span>
                <span>{proposal.support_percentage}% support</span>
              </div>
              
              <Progress 
                value={(proposal.current_votes / proposal.required_votes) * 100} 
                className="h-3"
              />
              
              <div className="flex justify-between text-sm">
                <span className="text-green-600">For: {proposal.votes_for}</span>
                <span className="text-red-600">Against: {proposal.votes_against}</span>
              </div>

              {proposal.status === 'active' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant={proposal.user_vote === 'for' ? 'default' : 'outline'}
                    onClick={() => castVote('for')}
                    className="flex-1"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Vote For
                  </Button>
                  <Button
                    variant={proposal.user_vote === 'against' ? 'destructive' : 'outline'}
                    onClick={() => castVote('against')}
                    className="flex-1"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Vote Against
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Proposal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Proposal Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {proposal.full_description}
              </div>
            </div>
            
            {/* Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
              {proposal.budget_required && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Budget Required</h4>
                  <p className="text-lg font-medium">${(proposal.budget_required / 1000000).toFixed(1)}M</p>
                </div>
              )}
              
              {proposal.implementation_timeline && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Implementation Timeline</h4>
                  <p className="text-lg font-medium">{proposal.implementation_timeline}</p>
                </div>
              )}
              
              <div className="md:col-span-2">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Impact Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {proposal.impact_areas.map((area, index) => (
                    <Badge key={index} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discussion Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Discussion ({proposal.discussion_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            <div className="space-y-4 mb-6">
              <Textarea
                              placeholder="Share your thoughts on this proposal..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={3} id={''}              />
              <Button 
                onClick={submitComment}
                disabled={!newComment.trim()}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={comment.user_avatar} />
                      <AvatarFallback>{comment.user_name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user_name}</span>
                        {comment.vote_type && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${comment.vote_type === 'for' ? 'text-green-600' : 'text-red-600'}`}
                          >
                            Voted {comment.vote_type === 'for' ? 'For' : 'Against'}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
