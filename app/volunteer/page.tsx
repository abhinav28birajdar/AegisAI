'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  MapPin, 
  Users, 
  Plus, 
  Clock,
  Award,
  Star,
  Calendar,
  Hand,
  Target,
  TrendingUp,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  location: string;
  event_date: string;
  max_participants: number;
  current_participants: number;
  category: string;
  skills_required: string[];
  time_commitment: string;
  impact_area: string;
  status: string;
  created_at: string;
  organizer?: {
    full_name: string;
    avatar_url: string;
  };
  is_volunteer?: boolean;
}

interface VolunteerRecord {
  id: string;
  opportunity_id: string;
  user_id: string;
  status: string;
  hours_completed: number;
  feedback_rating: number;
  feedback_comment: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  total_volunteer_hours: number;
  volunteer_rating: number;
}

export default function VolunteerPage() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [volunteerRecords, setVolunteerRecords] = useState<VolunteerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [applyingToOpportunity, setApplyingToOpportunity] = useState<string | null>(null);

  // Create opportunity form state
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    max_participants: 10,
    category: '',
    skills_required: '',
    time_commitment: '',
    impact_area: ''
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user profile with volunteer stats
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          // Calculate volunteer stats from records
          const { data: records } = await supabase
            .from('event_participants')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          const totalHours = records?.reduce((sum, record) => sum + (record.hours_completed || 2), 0) || 0;
          const avgRating = records?.length ? 
            records.reduce((sum, record) => sum + (record.feedback_rating || 5), 0) / records.length : 5;

          setUserProfile({
            ...profile,
            total_volunteer_hours: totalHours,
            volunteer_rating: avgRating
          });
        }

        // Fetch volunteer records
        const { data: records } = await supabase
          .from('event_participants')
          .select('*')
          .eq('user_id', user.id);
        
        setVolunteerRecords(records || []);
      }

      // Fetch volunteer opportunities (community events with volunteer category)
      const { data: opportunitiesData } = await supabase
        .from('community_events')
        .select(`
          *,
          organizer:organizer_id (
            full_name,
            avatar_url
          )
        `)
        .or('category.eq.Volunteer,category.eq.Environment,category.eq.Community')
        .order('event_date', { ascending: true });

      // Add volunteer status for each opportunity
      const opportunitiesWithStatus = opportunitiesData?.map(opp => ({
        ...opp,
        skills_required: ['Community Service', 'Teamwork'], // Mock data
        time_commitment: '2-4 hours',
        impact_area: opp.category,
        is_volunteer: volunteerRecords.some(record => record.opportunity_id === opp.id)
      })) || [];

      setOpportunities(opportunitiesWithStatus);
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
      toast.error('Failed to load volunteer data');
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be signed in to create opportunities');
        return;
      }

      if (!newOpportunity.title || !newOpportunity.description || !newOpportunity.location || !newOpportunity.event_date) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('community_events')
        .insert({
          title: newOpportunity.title,
          description: newOpportunity.description,
          organizer_id: user.id,
          location: newOpportunity.location,
          event_date: newOpportunity.event_date,
          max_participants: newOpportunity.max_participants,
          category: 'Volunteer',
          status: 'upcoming'
        });

      if (error) throw error;

      toast.success('Volunteer opportunity created successfully!');
      setIsCreateDialogOpen(false);
      setNewOpportunity({
        title: '',
        description: '',
        location: '',
        event_date: '',
        max_participants: 10,
        category: '',
        skills_required: '',
        time_commitment: '',
        impact_area: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to create opportunity');
    }
  };

  const applyToOpportunity = async (opportunityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be signed in to volunteer');
        return;
      }

      setApplyingToOpportunity(opportunityId);

      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: opportunityId,
          user_id: user.id,
          status: 'registered'
        });

      if (error) throw error;

      // Update current participants count
      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (opportunity) {
        await supabase
          .from('community_events')
          .update({ current_participants: opportunity.current_participants + 1 })
          .eq('id', opportunityId);
      }

      toast.success('Successfully applied to volunteer!');
      fetchData();
    } catch (error) {
      console.error('Error applying to opportunity:', error);
      toast.error('Failed to apply');
    } finally {
      setApplyingToOpportunity(null);
    }
  };

  const getOpportunityStatus = (opportunity: VolunteerOpportunity) => {
    const now = new Date();
    const eventDate = new Date(opportunity.event_date);
    
    if (opportunity.status === 'cancelled') return 'cancelled';
    if (now > eventDate) return 'completed';
    if (opportunity.current_participants >= opportunity.max_participants) return 'full';
    return 'open';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'full': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesCategory = filterCategory === 'all' || opp.category === filterCategory;
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['Volunteer', 'Environment', 'Community', 'Education', 'Health', 'Safety'];

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
            Volunteer Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Make a difference in your community through volunteer opportunities
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Volunteer Opportunity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newOpportunity.title}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter opportunity title"
                />
              </div>
              
              <div>
                <Textarea
                  id="description"
                  label="Description"
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the volunteer opportunity"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newOpportunity.location}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Volunteer location"
                />
              </div>
              
              <div>
                <Label htmlFor="event_date">Date & Time</Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={newOpportunity.event_date}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, event_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="max_participants">Volunteers Needed</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={newOpportunity.max_participants}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  min="1"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={createOpportunity} className="flex-1">
                  Create Opportunity
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
            <CardTitle className="text-sm font-medium">Available Opportunities</CardTitle>
            <Hand className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(o => getOpportunityStatus(o) === 'open').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Volunteer Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile?.total_volunteer_hours || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userProfile?.volunteer_rating?.toFixed(1) || '5.0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(userProfile?.total_volunteer_hours || 0) > 50 ? 'High' : 
               (userProfile?.total_volunteer_hours || 0) > 20 ? 'Medium' : 'Growing'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Progress Card */}
      {userProfile && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Volunteer Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={userProfile.avatar_url} />
                    <AvatarFallback>{userProfile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{userProfile.full_name}</h3>
                    <p className="text-sm text-gray-500">Community Volunteer</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Progress to next level</p>
                <Progress value={((userProfile.total_volunteer_hours % 25) / 25) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {userProfile.total_volunteer_hours % 25}/25 hours to next badge
                </p>
              </div>
              
              <div className="flex gap-2">
                {userProfile.total_volunteer_hours >= 10 && (
                  <Badge className="bg-bronze-500 text-white">Bronze Volunteer</Badge>
                )}
                {userProfile.total_volunteer_hours >= 25 && (
                  <Badge className="bg-gray-400 text-white">Silver Volunteer</Badge>
                )}
                {userProfile.total_volunteer_hours >= 50 && (
                  <Badge className="bg-yellow-500 text-white">Gold Volunteer</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search volunteer opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">All Opportunities</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="my-volunteer">My Volunteer Work</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => {
              const status = getOpportunityStatus(opportunity);
              const isVolunteer = opportunity.is_volunteer;

              return (
                <Card key={opportunity.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`${getStatusColor(status)} text-white`}>
                        {status.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">{opportunity.category}</Badge>
                    </div>
                    
                    <CardTitle className="text-lg line-clamp-2">{opportunity.title}</CardTitle>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={opportunity.organizer?.avatar_url} />
                        <AvatarFallback>
                          {opportunity.organizer?.full_name?.charAt(0) || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{opportunity.organizer?.full_name || 'Organization'}</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {opportunity.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(opportunity.event_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {opportunity.current_participants}/{opportunity.max_participants} volunteers
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {opportunity.time_commitment || '2-4 hours'}
                      </div>
                    </div>

                    {/* Skills Required */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {opportunity.skills_required?.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    {status === 'open' && userProfile && (
                      <div className="flex gap-2">
                        {isVolunteer ? (
                          <Button
                            disabled
                            size="sm"
                            className="flex-1 bg-green-100 text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Applied
                          </Button>
                        ) : (
                          <Button
                            onClick={() => applyToOpportunity(opportunity.id)}
                            disabled={applyingToOpportunity === opportunity.id}
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Volunteer
                          </Button>
                        )}
                      </div>
                    )}

                    {isVolunteer && (
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-400 text-center">
                          ✓ You're volunteering for this opportunity
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="open" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities
              .filter(o => getOpportunityStatus(o) === 'open')
              .map((opportunity) => (
                <Card key={opportunity.id} className="border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-green-500 text-white">OPEN</Badge>
                      <Badge variant="secondary">{opportunity.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {opportunity.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(opportunity.event_date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="my-volunteer" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities
              .filter(o => o.is_volunteer)
              .map((opportunity) => {
                const status = getOpportunityStatus(opportunity);
                
                return (
                  <Card key={opportunity.id} className="border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={`${getStatusColor(status)} text-white`}>
                          {status.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary">{opportunity.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {opportunity.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(opportunity.event_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {opportunity.location}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {volunteerRecords
              .filter(record => record.status === 'completed')
              .map((record) => {
                const opportunity = opportunities.find(o => o.id === record.opportunity_id);
                if (!opportunity) return null;

                return (
                  <Card key={record.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{opportunity.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {opportunity.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(opportunity.event_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {record.hours_completed || 2} hours
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {record.feedback_rating || 5}/5
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-blue-500 text-white">COMPLETED</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
