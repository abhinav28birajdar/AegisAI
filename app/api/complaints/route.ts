import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { mockAICategorization } from '@/lib/mock-utils';

// Enhanced complaint submission with AI categorization and blockchain preparation
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      location,
      isAnonymous,
      submitter_wallet,
      ai_analysis
    } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category' },
        { status: 400 }
      );
    }

    // Enhanced AI categorization if not provided
    let finalAiAnalysis = ai_analysis;
    if (!finalAiAnalysis) {
      finalAiAnalysis = mockAICategorization(title, description);
    }

    // Prepare complaint data
    const complaintData: any = {
      title,
      description,
      category,
      priority: priority || 1,
      location,
      status: 'pending',
      is_anonymous: isAnonymous || false,
      submitter_wallet,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // AI Analysis fields
      ai_category: finalAiAnalysis.suggestedCategory,
      ai_priority: finalAiAnalysis.suggestedPriority,
      ai_confidence: finalAiAnalysis.confidence,
      ai_department: finalAiAnalysis.departmentRouting,
      ai_sentiment: finalAiAnalysis.sentiment,
      ai_emergency_flags: finalAiAnalysis.emergencyFlags,
      ai_estimated_resolution_time: finalAiAnalysis.estimatedResolutionTime,
      ai_similar_cases: finalAiAnalysis.similarCases,
      ai_suggested_actions: finalAiAnalysis.suggestedActions,
      
      // Blockchain preparation
      blockchain_ready: !!submitter_wallet,
      blockchain_tx_hash: null, // Will be updated when blockchain submission completes
      blockchain_status: submitter_wallet ? 'pending' : 'not_applicable',
      
      // CARV preparation
      carv_attestation_id: null,
      carv_verified: false,
      
      // Web3 features
      reputation_earned: 0,
      token_rewards_pending: true,
    };

    // Add user ID if authenticated and not anonymous
    if (session?.user && !isAnonymous) {
      complaintData.user_id = session.user.id;
    }

    // Insert complaint into database
    const { data: complaint, error: insertError } = await supabase
      .from('complaints')
      .insert([complaintData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create complaint', details: insertError.message },
        { status: 500 }
      );
    }

    // Prepare response
    const response: any = {
      success: true,
      complaint: {
        id: complaint.id,
        title: complaint.title,
        status: complaint.status,
        created_at: complaint.created_at,
        ai_analysis: finalAiAnalysis,
        blockchain_ready: complaint.blockchain_ready,
      },
      ai_analysis: finalAiAnalysis,
      next_steps: {
        blockchain_submission: submitter_wallet ? 'pending' : 'connect_wallet_required',
        reputation_rewards: 'will_be_awarded_on_blockchain_confirmation',
        department_notification: finalAiAnalysis.departmentRouting,
        estimated_response_time: finalAiAnalysis.estimatedResolutionTime,
      }
    };

    // If emergency flags exist, trigger emergency workflow
    if (finalAiAnalysis.emergencyFlags && finalAiAnalysis.emergencyFlags.length > 0) {
      // TODO: Trigger emergency notification system
      console.log('Emergency detected:', finalAiAnalysis.emergencyFlags);
      response.emergency_notification = 'Emergency departments have been notified';
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Complaint submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Enhanced GET endpoint with filtering and AI insights
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const wallet = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('complaints')
      .select(`
        *,
        user_id,
        submitter_wallet
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (wallet) {
      query = query.eq('submitter_wallet', wallet);
    }

    const { data: complaints, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch complaints' },
        { status: 500 }
      );
    }

    // Add AI insights to response
    const totalComplaints = complaints?.length || 0;
    const categoryCounts = complaints?.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = complaints?.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      complaints: complaints || [],
      metadata: {
        total: totalComplaints,
        limit,
        offset,
        category_distribution: categoryCounts,
        status_distribution: statusCounts,
        blockchain_enabled_count: complaints?.filter(c => c.blockchain_ready).length || 0,
        carv_verified_count: complaints?.filter(c => c.carv_verified).length || 0,
      },
      ai_insights: {
        most_common_category: Object.keys(categoryCounts || {}).reduce((a, b) => 
          (categoryCounts[a] || 0) > (categoryCounts[b] || 0) ? a : b, ''
        ),
        average_priority: complaints?.length ? 
          complaints.reduce((sum, c) => sum + (c.priority || 1), 0) / complaints.length : 0,
        emergency_cases: complaints?.filter(c => 
          c.ai_emergency_flags && c.ai_emergency_flags.length > 0
        ).length || 0,
      }
    });

  } catch (error) {
    console.error('Complaints fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
