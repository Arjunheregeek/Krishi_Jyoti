import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Calendar, Users, Target, ArrowRight, CheckCircle, Search, Filter, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubsidiesProps {
  currentLanguage: string;
}

interface SubsidyScheme {
  name: string;
  description: string;
  subsidyPercent: number;
  maxAmount: string;
  eligibility: string[];
  documents: string[];
  deadline?: string;
  beneficiaries: number;
  category: 'pesticide' | 'fertilizer' | 'seeds' | 'equipment' | 'irrigation';
  status: 'active' | 'closing-soon' | 'upcoming';
}

const subsidySchemes: SubsidyScheme[] = [
  {
    name: 'Pesticide Subsidy Scheme',
    description: 'Financial assistance for purchasing organic and bio-pesticides to promote sustainable farming',
    subsidyPercent: 50,
    maxAmount: '₹10,000',
    eligibility: ['Small & Marginal farmers', 'Certified organic farmers', 'FPO members'],
    documents: ['Aadhaar Card', 'Land Records', 'Bank Details', 'Previous purchase bills'],
    deadline: '2024-12-31',
    beneficiaries: 2456,
    category: 'pesticide',
    status: 'active'
  },
  {
    name: 'Organic Fertilizer Promotion',
    description: 'Subsidy on vermicompost, organic fertilizers, and bio-fertilizers',
    subsidyPercent: 75,
    maxAmount: '₹15,000',
    eligibility: ['All category farmers', 'Organic certification holders'],
    documents: ['Farmer ID', 'Soil health card', 'Purchase receipts'],
    deadline: '2025-01-15',
    beneficiaries: 3241,
    category: 'fertilizer',
    status: 'active'
  },
  {
    name: 'Quality Seed Distribution',
    description: 'Subsidized high-yielding variety seeds and hybrid seeds for better productivity',
    subsidyPercent: 85,
    maxAmount: '₹5,000',
    eligibility: ['BPL farmers', 'Women farmers', 'SC/ST farmers'],
    documents: ['BPL Card', 'Caste certificate (if applicable)', 'Land documents'],
    beneficiaries: 5678,
    category: 'seeds',
    status: 'closing-soon'
  },
  {
    name: 'Drip Irrigation Subsidy',
    description: 'Financial support for installing micro-irrigation systems to promote water conservation',
    subsidyPercent: 55,
    maxAmount: '₹50,000',
    eligibility: ['Farmers with >1 acre land', 'Water availability certificate'],
    documents: ['Land records', 'Water source proof', 'Technical approval'],
    deadline: '2024-11-30',
    beneficiaries: 1892,
    category: 'irrigation',
    status: 'closing-soon'
  }
];

const categoryIcons = {
  pesticide: '🌿',
  fertilizer: '🧪', 
  seeds: '🌱',
  equipment: '🚜',
  irrigation: '💧'
};

const categoryColors = {
  pesticide: 'bg-primary/10 text-primary',
  fertilizer: 'bg-secondary/10 text-secondary',
  seeds: 'bg-success/10 text-success',
  equipment: 'bg-accent/10 text-accent',
  irrigation: 'bg-primary/10 text-primary'
};

const statusColors = {
  active: 'bg-success/10 text-success',
  'closing-soon': 'bg-warning/10 text-warning',
  upcoming: 'bg-accent/10 text-accent'
};

const Subsidies = ({ currentLanguage }: SubsidiesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [budget, setBudget] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Government Subsidies',
      description: 'Access financial assistance for pesticides, fertilizers, seeds, and farming equipment',
      search: 'Search subsidies by name or description...',
      category: 'Category',
      status: 'Status',
      calculator: 'Calculator',
      subsidyCalculator: 'Subsidy Calculator',
      calculateBenefits: 'Calculate potential benefits for your investment',
      investmentAmount: 'Investment Amount (₹)',
      potentialBenefits: 'Potential Benefits:',
      activeSchemes: 'Active Schemes',
      totalBeneficiaries: 'Total Beneficiaries',
      avgSubsidy: 'Avg Subsidy',
      amountDisbursed: 'Amount Disbursed',
      subsidyRate: 'Subsidy Rate',
      maxAmount: 'Max Amount',
      beneficiaries: 'Beneficiaries',
      applicationDeadline: 'Application Deadline',
      eligibilityCriteria: 'Eligibility Criteria',
      viewDetails: 'View Details',
      applyNow: 'Apply Now',
      comingSoon: 'Coming Soon',
      getApplicationHelp: 'Get Application Help',
      downloadForms: 'Download Forms',
      needHelp: 'Need Help with Applications?',
      fieldOfficersHelp: 'Our field officers are available to assist you with subsidy applications and documentation'
    },
    hi: {
      title: 'सरकारी सब्सिडी',
      description: 'कीटनाशक, उर्वरक, बीज और कृषि उपकरणों के लिए वित्तीय सहायता प्राप्त करें',
      search: 'नाम या विवरण के द्वारा सब्सिडी खोजें...',
      category: 'श्रेणी',
      status: 'स्थिति',
      calculator: 'कैलकुलेटर',
      subsidyCalculator: 'सब्सिडी कैलकुलेटर',
      calculateBenefits: 'अपने निवेश के लिए संभावित लाभों की गणना करें',
      investmentAmount: 'निवेश राशि (₹)',
      potentialBenefits: 'संभावित लाभ:',
      activeSchemes: 'सक्रिय योजनाएं',
      totalBeneficiaries: 'कुल लाभार्थी',
      avgSubsidy: 'औसत सब्सिडी',
      amountDisbursed: 'वितरित राशि',
      subsidyRate: 'सब्सिडी दर',
      maxAmount: 'अधिकतम राशि',
      beneficiaries: 'लाभार्थी',
      applicationDeadline: 'आवेदन की अंतिम तारीख',
      eligibilityCriteria: 'पात्रता मानदंड',
      viewDetails: 'विवरण देखें',
      applyNow: 'अब आवेदन करें',
      comingSoon: 'जल्द आ रहा है',
      getApplicationHelp: 'आवेदन सहायता पाएं',
      downloadForms: 'फॉर्म डाउनलोड करें',
      needHelp: 'आवेदन में सहायता चाहिए?',
      fieldOfficersHelp: 'हमारे फील्ड ऑफिसर सब्सिडी आवेदन और दस्तावेजों में आपकी सहायता के लिए उपलब्ध हैं'
    },
    te: {
      title: 'ప్రభుత్వ రాజసహాయం',
      description: 'పురుగుమందులు, ఎరువులు, విత్తనాలు మరియు వ్యవసాయ పరికరాలకు ఆర్థిక సహాయం పొందండి',
      search: 'పేరు లేదా వివరణ ద్వారా రాజసహాయాలను వెతకండి...',
      category: 'వర్గం',
      status: 'స్థితి',
      calculator: 'కాలిక్యులేటర్',
      subsidyCalculator: 'రాజసహాయ కాలిక్యులేటర్',
      calculateBenefits: 'మీ పెట్టుబడికి సంభావ్య ప్రయోజనాలను లెక్కించండి',
      investmentAmount: 'పెట్టుబడి మొత్తం (₹)',
      potentialBenefits: 'సంభావ్య ప్రయోజనాలు:',
      activeSchemes: 'సక్రియ పథకాలు',
      totalBeneficiaries: 'మొత్తం లబ్ధిదారులు',
      avgSubsidy: 'సగటు రాజసహాయం',
      amountDisbursed: 'పంపిణీ చేసిన మొత్తం',
      subsidyRate: 'రాజసహాయ రేటు',
      maxAmount: 'గరిష్ట మొత్తం',
      beneficiaries: 'లబ్ధిదారులు',
      applicationDeadline: 'దరఖాస్తు గడువు',
      eligibilityCriteria: 'అర్హత ప్రమాణాలు',
      viewDetails: 'వివరాలు చూడండి',
      applyNow: 'ఇప్పుడు దరఖాస్తు చేసుకోండి',
      comingSoon: 'త్వరలో వస్తుంది',
      getApplicationHelp: 'దరఖాస్తు సహాయం పొందండి',
      downloadForms: 'ఫారమ్‌లను డౌన్‌లోడ్ చేయండి',
      needHelp: 'దరఖాస్తులతో సహాయం కావాలా?',
      fieldOfficersHelp: 'మా క్షేత్ర అధికారులు రాజసహాయ దరఖాస్తులు మరియు పత్రాలతో మీకు సహాయం చేయడానికి అందుబాటులో ఉన్నారు'
    },
    ta: {
      title: 'அரசு மானியங்கள்',
      description: 'பூச்சிக்கொல்லிகள், உரங்கள், விதைகள் மற்றும் விவசாய உபகரணங்களுக்கு நிதி உதவி பெறுங்கள்',
      search: 'பெயர் அல்லது விளக்கத்தின் மூலம் மானியங்களைத் தேடுங்கள்...',
      category: 'வகை',
      status: 'நிலை',
      calculator: 'கால்குலேட்டர்',
      subsidyCalculator: 'மானிய கால்குலேட்டர்',
      calculateBenefits: 'உங்கள் முதலீட்டிற்கான சாத்தியமான பலன்களைக் கணக்கிடுங்கள்',
      investmentAmount: 'முதலீட்டு தொகை (₹)',
      potentialBenefits: 'சாத்தியமான பலன்கள்:',
      activeSchemes: 'செயலில் உள்ள திட்டங்கள்',
      totalBeneficiaries: 'மொத்த பயனாளிகள்',
      avgSubsidy: 'சராசரி மானியம்',
      amountDisbursed: 'வழங்கப்பட்ட தொகை',
      subsidyRate: 'மானிய விகிதம்',
      maxAmount: 'அதிகபட்ச தொகை',
      beneficiaries: 'பயனாளிகள்',
      applicationDeadline: 'விண்ணப்ப கடைசி நாள்',
      eligibilityCriteria: 'தகுதி அளவுகோல்கள்',
      viewDetails: 'விவரங்களைப் பார்க்கவும்',
      applyNow: 'இப்போது விண்ணப்பிக்கவும்',
      comingSoon: 'விரைவில் வரும்',
      getApplicationHelp: 'விண்ணப்ப உதவி பெறுங்கள்',
      downloadForms: 'படிவங்களைப் பதிவிறக்கவும்',
      needHelp: 'விண்ணப்பங்களில் உதவி தேவையா?',
      fieldOfficersHelp: 'எங்கள் கள அதிகாரிகள் மானிய விண்ணப்பங்கள் மற்றும் ஆவணங்களில் உங்களுக்கு உதவ கிடைக்கின்றனர்'
    },
    ml: {
      title: 'സർക്കാർ സബ്സിഡികൾ',
      description: 'കീടനാശിനികൾ, വളങ്ങൾ, വിത്തുകൾ, കാർഷിക ഉപകരണങ്ങൾ എന്നിവയ്ക്കായി സാമ്പത്തിക സഹായം നേടുക',
      search: 'പേര് അല്ലെങ്കിൽ വിവരണം ഉപയോഗിച്ച് സബ്സിഡികൾ തിരയുക...',
      category: 'വിഭാഗം',
      status: 'സ്ഥിതി',
      calculator: 'കാൽക്കുലേറ്റർ',
      subsidyCalculator: 'സബ്സിഡി കാൽക്കുലേറ്റർ',
      calculateBenefits: 'നിങ്ങളുടെ നിക്ഷേപത്തിനുള്ള സാധ്യതയുള്ള നേട്ടങ്ങൾ കണക്കാക്കുക',
      investmentAmount: 'നിക്ഷേപ തുക (₹)',
      potentialBenefits: 'സാധ്യതയുള്ള നേട്ടങ്ങൾ:',
      activeSchemes: 'സജീവ പദ്ധതികൾ',
      totalBeneficiaries: 'മൊത്തം ഗുണഭോക്താക്കൾ',
      avgSubsidy: 'ശരാശരി സബ്സിഡി',
      amountDisbursed: 'വിതരണം ചെയ്ത തുക',
      subsidyRate: 'സബ്സിഡി നിരക്ക്',
      maxAmount: 'പരമാവധി തുക',
      beneficiaries: 'ഗുണഭോക്താക്കൾ',
      applicationDeadline: 'അപേക്ഷാ അവസാന തീയതി',
      eligibilityCriteria: 'യോഗ്യതാ മാനദണ്ഡങ്ങൾ',
      viewDetails: 'വിവരങ്ങൾ കാണുക',
      applyNow: 'ഇപ്പോൾ അപേക്ഷിക്കുക',
      comingSoon: 'ഉടൻ വരുന്നു',
      getApplicationHelp: 'അപേക്ഷാ സഹായം നേടുക',
      downloadForms: 'ഫോമുകൾ ഡൗൺലോഡ് ചെയ്യുക',
      needHelp: 'അപേക്ഷകളിൽ സഹായം വേണോ?',
      fieldOfficersHelp: 'ഞങ്ങളുടെ ഫീൽഡ് ഓഫീസർമാർ സബ്സിഡി അപേക്ഷകളിലും ഡോക്യുമെന്റേഷനിലും നിങ്ങളെ സഹായിക്കാൻ ലഭ്യമാണ്'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const calculateDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredSchemes = subsidySchemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || scheme.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const calculateBenefit = (scheme: SubsidyScheme, amount: number) => {
    const maxAmountNum = parseInt(scheme.maxAmount.replace(/[₹,]/g, ''));
    const benefit = Math.min((amount * scheme.subsidyPercent) / 100, maxAmountNum);
    return benefit;
  };

  const handleApplySubsidy = (schemeName: string) => {
    toast({
      title: "Application Started",
      description: `Redirecting to application form for ${schemeName}`,
    });
  };

  return (
    <div className="space-y-6" id="subsidies">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-primary">{t.title}</h2>
        <p className="text-muted-foreground">
          {t.description}
        </p>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pesticide">Pesticides</SelectItem>
              <SelectItem value="fertilizer">Fertilizers</SelectItem>
              <SelectItem value="seeds">Seeds</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="irrigation">Irrigation</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder={t.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closing-soon">Closing Soon</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => setShowCalculator(!showCalculator)}
            className="w-full md:w-auto"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {t.calculator}
          </Button>
        </div>

        {/* Budget Calculator */}
        {showCalculator && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Subsidy Calculator</CardTitle>
              <CardDescription>Calculate potential benefits for your investment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Investment Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              {budget && filteredSchemes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Potential Benefits:</h4>
                  {filteredSchemes.slice(0, 3).map((scheme, idx) => {
                    const benefit = calculateBenefit(scheme, parseInt(budget) || 0);
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{scheme.name}:</span>
                        <span className="font-bold text-primary">₹{benefit.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Schemes', value: '12', color: 'text-success' },
          { label: 'Total Beneficiaries', value: '13.2K', color: 'text-primary' },
          { label: 'Avg Subsidy', value: '60%', color: 'text-accent' },
          { label: 'Amount Disbursed', value: '₹2.4Cr', color: 'text-secondary' }
        ].map((stat, index) => (
          <Card key={index} className="text-center p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchemes.length > 0 ? filteredSchemes.map((scheme, index) => {
          const daysLeft = calculateDaysLeft(scheme.deadline);
          
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{categoryIcons[scheme.category]}</span>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {scheme.name}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={categoryColors[scheme.category]} variant="secondary">
                        {scheme.category}
                      </Badge>
                      <Badge className={statusColors[scheme.status]} variant="secondary">
                        {scheme.status === 'closing-soon' ? 'Closing Soon' : scheme.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="leading-relaxed">
                  {scheme.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Subsidy Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{scheme.subsidyPercent}%</div>
                    <div className="text-sm text-muted-foreground">Subsidy Rate</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/5 rounded-lg">
                    <div className="text-lg font-bold text-secondary">{scheme.maxAmount}</div>
                    <div className="text-sm text-muted-foreground">Max Amount</div>
                  </div>
                </div>

                {/* Progress and Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Beneficiaries
                    </span>
                    <span className="text-sm font-bold">{scheme.beneficiaries.toLocaleString()}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                {/* Deadline */}
                {scheme.deadline && (
                  <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-warning" />
                      <span className="font-medium">Application Deadline</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-warning">
                        {daysLeft && daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(scheme.deadline).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Eligibility */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    Eligibility Criteria
                  </h4>
                  <ul className="space-y-1">
                    {scheme.eligibility.slice(0, 2).map((criteria, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                    {scheme.eligibility.length > 2 && (
                      <li className="text-sm text-accent">
                        +{scheme.eligibility.length - 2} more criteria
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
                    disabled={scheme.status === 'upcoming'}
                    onClick={() => handleApplySubsidy(scheme.name)}
                  >
                    {scheme.status === 'upcoming' ? 'Coming Soon' : 'Apply Now'}
                    {scheme.status !== 'upcoming' && <ArrowRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No subsidies found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4 p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
        <h3 className="text-xl font-bold">Need Help with Applications?</h3>
        <p className="text-muted-foreground">
          Our field officers are available to assist you with subsidy applications and documentation
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="hero" size="lg">
            <Gift className="w-4 h-4 mr-2" />
            Get Application Help
          </Button>
          <Button variant="outline" size="lg">
            Download Forms
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subsidies;