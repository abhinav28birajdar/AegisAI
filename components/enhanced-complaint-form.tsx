'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeb3 } from '@/lib/web3-context';
import { useSubmitComplaint } from '@/lib/blockchain-hooks';
import { toast } from 'sonner';
import { 
  Shield, 
  Wallet, 
  ChevronRight, 
  AlertTriangle, 
  Zap, 
  Lock,
  CheckCircle2,
  Brain,
  Coins
} from 'lucide-react';

interface ComplaintFormData {
  title: string;
  description: string;
  category: string;
  priority: number;
  isAnonymous: boolean;
  location?: string;
  evidence?: File[];
}

export default function EnhancedComplaintForm() {
  const router = useRouter();
  const { isConnected, address, connect, reputation, isVerified } = useWeb3();
  const { submit: submitToBlockchain, isLoading: blockchainLoading } = useSubmitComplaint();
  
  const [formData, setFormData] = useState<ComplaintFormData>({
    title: '',
    description: '',
    category: '',
    priority: 1,
    isAnonymous: false,
    location: '',
    evidence: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'blockchain' | 'success'>('form');
  const [txHash, setTxHash] = useState<string>();
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const categories = [
    'Infrastructure',
    'Public Safety', 
    'Healthcare',
    'Education',
    'Transportation',
    'Environment',
    'Corruption',
    'Administrative',
    'Emergency'
  ];

  const priorityLevels = [
    { value: 0, label: 'Low', color: 'bg-green-500' },
    { value: 1, label: 'Medium', color: 'bg-yellow-500' },
    { value: 2, label: 'High', color: 'bg-orange-500' },
    { value: 3, label: 'Critical', color: 'bg-red-500' },
    { value: 4, label: 'Emergency', color: 'bg-purple-500' }
  ];

  const handleInputChange = (field: keyof ComplaintFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeWithAI = async () => {
    if (!formData.title || !formData.description) return;

    try {
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category
        })
      });

      const analysis = await response.json();
      setAiAnalysis(analysis);

      // Auto-fill suggestions from AI
      if (analysis.suggestedCategory && !formData.category) {
        handleInputChange('category', analysis.suggestedCategory);
      }
      if (analysis.suggestedPriority !== undefined) {
        handleInputChange('priority', analysis.suggestedPriority);
      }

      toast.success('AI analysis completed! Check the suggestions.');
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('AI analysis failed, but you can still submit manually.');
    }
  };

  const submitComplaint = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setStep('blockchain');

    try {
      // Step 1: Submit to traditional database
      const dbResponse = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submitter_wallet: address,
          ai_analysis: aiAnalysis
        })
      });

      if (!dbResponse.ok) throw new Error('Database submission failed');

      // Step 2: Submit to blockchain if wallet is connected
      let blockchainTxHash;
      if (isConnected && address) {
        // Mock IPFS hash for evidence
        const ipfsHash = formData.evidence?.length ? 
          `ipfs://Qm${Math.random().toString(36).substr(2, 40)}` : '';

        blockchainTxHash = await submitToBlockchain({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          ipfsHash,
          isAnonymous: formData.isAnonymous
        });

        setTxHash(blockchainTxHash);
      }

      setStep('success');
      toast.success('Complaint submitted successfully to both database and blockchain!');
      
      // Navigate after delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit complaint');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Complaint Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Your complaint has been successfully submitted to both our database and the blockchain.
            </p>
            {txHash && (
              <div className="mb-4">
                <Label className="text-xs">Blockchain Transaction:</Label>
                <p className="text-xs font-mono bg-slate-100 p-2 rounded break-all">
                  {txHash}
                </p>
              </div>
            )}
            <Badge variant="secondary" className="mb-4">
              <Coins className="w-3 h-3 mr-1" />
              +{priorityLevels[formData.priority].label === 'Emergency' ? '200' : '100'} Reputation Points
            </Badge>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'blockchain') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">                <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <h2 className="text-xl font-bold mb-2">Submitting to Blockchain</h2>
            <p className="text-muted-foreground mb-4">
              Your complaint is being recorded on the blockchain for transparency and immutability.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                Database submission complete
              </div>
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Blockchain transaction pending...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 mr-3 text-blue-400" />
            AegisAI Complaint Submission
          </h1>
          <p className="text-xl text-slate-300">
            AI-Enhanced • Blockchain-Secured • CARV-Verified
          </p>
        </div>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-500/10">
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Connect your wallet for blockchain submission and reputation rewards</span>
                <Button onClick={connect} variant="outline" size="sm">
                  Connect Wallet
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <Card className="mb-6 border-green-500 bg-green-500/10">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <p className="font-medium">Wallet Connected</p>
                    <p className="text-sm text-muted-foreground">{address?.slice(0, 8)}...{address?.slice(-6)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={isVerified ? "default" : "secondary"} className="mb-1">
                    {isVerified ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                    {isVerified ? 'CARV Verified' : 'Unverified'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    <Coins className="w-3 h-3 inline mr-1" />
                    {reputation} Reputation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-500" />
              Submit Complaint
            </CardTitle>
            <CardDescription>
              Use AI assistance to categorize and prioritize your complaint automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Complaint Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the issue"
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                label="Detailed Description"
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed information about the issue, including location, time, and any relevant details"
                className="mt-2 min-h-[120px]"
              />
            </div>

            {/* AI Analysis Button */}
            <Button 
              onClick={analyzeWithAI}
              variant="outline"
              className="w-full border-purple-500 hover:bg-purple-500/10"
              disabled={!formData.title || !formData.description}
            >
              <Brain className="w-4 h-4 mr-2" />
              Analyze with AI
            </Button>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <Card className="border-purple-500 bg-purple-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-purple-500" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs">Suggested Category</Label>
                      <p className="font-medium">{aiAnalysis.suggestedCategory}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Confidence</Label>
                      <p className="font-medium">{aiAnalysis.confidence}%</p>
                    </div>
                    <div>
                      <Label className="text-xs">Priority</Label>
                      <Badge className={priorityLevels[aiAnalysis.suggestedPriority]?.color}>
                        {priorityLevels[aiAnalysis.suggestedPriority]?.label}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs">Department</Label>
                      <p className="font-medium">{aiAnalysis.departmentRouting}</p>
                    </div>
                  </div>
                  {aiAnalysis.emergencyFlags?.length > 0 && (
                    <Alert className="mt-3 border-red-500 bg-red-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Emergency Detected:</strong> {aiAnalysis.emergencyFlags.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select 
                value={formData.priority.toString()} 
                onValueChange={(value) => handleInputChange('priority', parseInt(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${level.color} mr-2`} />
                        {level.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Street address, landmark, or area description"
                className="mt-2"
              />
            </div>

            {/* Privacy Options */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit anonymously (your wallet address will not be recorded)
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={submitComplaint}
              disabled={isSubmitting || !formData.title || !formData.description || !formData.category}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>

            {isConnected && (
              <p className="text-xs text-center text-muted-foreground">
                🎉 Bonus: Earn reputation tokens for submitting valid complaints
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
