import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, Percent, Clock, CheckCircle, ArrowRight, Calculator, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoanSchemesProps {
  currentLanguage: string;
}

interface LoanScheme {
  name: string;
  description: string;
  maxAmount: string;
  interestRate: string;
  tenure: string;
  eligibility: string[];
  status: 'available' | 'limited' | 'seasonal';
  category: 'crop' | 'equipment' | 'infrastructure' | 'emergency';
}

const loanSchemes: LoanScheme[] = [
  {
    name: 'Kisan Credit Card (KCC)',
    description: 'Flexible credit facility for crop production and allied activities',
    maxAmount: '₹3 Lakh',
    interestRate: '7% (Subsidized)',
    tenure: '5 Years',
    eligibility: ['Landowner farmers', 'Tenant farmers', 'Oral lessees'],
    status: 'available',
    category: 'crop'
  },
  {
    name: 'PM-KISAN Tractor Loan',
    description: 'Subsidized loans for purchasing agricultural machinery and equipment',
    maxAmount: '₹10 Lakh',
    interestRate: '8.5%',
    tenure: '7 Years',
    eligibility: ['Small & Marginal farmers', 'Valid land documents required'],
    status: 'available',
    category: 'equipment'
  },
  {
    name: 'Crop Insurance Loan',
    description: 'Emergency financial support for crop loss due to natural calamities',
    maxAmount: '₹5 Lakh',
    interestRate: '6% (Emergency)',
    tenure: '3 Years',
    eligibility: ['Insured crop farmers', 'Documented crop loss'],
    status: 'seasonal',
    category: 'emergency'
  },
  {
    name: 'Warehouse Infrastructure Loan',
    description: 'Funding for building storage and post-harvest infrastructure',
    maxAmount: '₹25 Lakh',
    interestRate: '9%',
    tenure: '10 Years',
    eligibility: ['FPOs', 'Individual farmers with >5 acres'],
    status: 'limited',
    category: 'infrastructure'
  }
];

const categoryColors = {
  crop: 'bg-primary/10 text-primary',
  equipment: 'bg-secondary/10 text-secondary',
  infrastructure: 'bg-accent/10 text-accent',
  emergency: 'bg-destructive/10 text-destructive'
};

const statusColors = {
  available: 'bg-success/10 text-success',
  limited: 'bg-warning/10 text-warning',
  seasonal: 'bg-accent/10 text-accent'
};

const LoanSchemes = ({ currentLanguage }: LoanSchemesProps) => {
  const [selectedLoan, setSelectedLoan] = useState<LoanScheme | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Government Loan Schemes',
      description: 'Access affordable credit facilities for farming operations and infrastructure development',
      emiCalculator: 'EMI Calculator',
      applicationStatus: 'Application Status',
      calculateEMI: 'Calculate your monthly installments',
      loanAmount: 'Loan Amount (₹)',
      interestRate: 'Interest Rate (%)',
      tenure: 'Tenure (Years)',
      monthlyEMI: 'Monthly EMI',
      maxAmount: 'Max Amount',
      eligibility: 'Eligibility',
      learnMore: 'Learn More',
      applyNow: 'Apply Now'
    },
    hi: {
      title: 'सरकारी ऋण योजनाएं',
      description: 'कृषि संचालन और बुनियादी ढांचे के विकास के लिए किफायती ऋण सुविधाओं का उपयोग करें',
      emiCalculator: 'EMI कैलकुलेटर',
      applicationStatus: 'आवेदन स्थिति',
      calculateEMI: 'अपनी मासिक किस्तों की गणना करें',
      loanAmount: 'ऋण राशि (₹)',
      interestRate: 'ब्याज दर (%)',
      tenure: 'अवधि (वर्ष)',
      monthlyEMI: 'मासिक EMI',
      maxAmount: 'अधिकतम राशि',
      eligibility: 'पात्रता',
      learnMore: 'और जानें',
      applyNow: 'अब आवेदन करें'
    },
    te: {
      title: 'ప్రభుత్వ రుణ పథకాలు',
      description: 'వ్యవసాయ కార్యకలాపాలు మరియు మౌలిక సదుపాయాల అభివృద్ధికి సరసమైన రుణ సదుపాయాలను పొందండి',
      emiCalculator: 'EMI కాలిక్యులేటర్',
      applicationStatus: 'దరఖాస్తు స్థితి',
      calculateEMI: 'మీ నెలవారీ వాయిదాలను లెక్కించండి',
      loanAmount: 'రుణ మొత్తం (₹)',
      interestRate: 'వడ్డీ రేటు (%)',
      tenure: 'వ్యవధి (సంవత్సరాలు)',
      monthlyEMI: 'నెలవారీ EMI',
      maxAmount: 'గరిష్ట మొత్తం',
      eligibility: 'అర్హత',
      learnMore: 'మరింత తెలుసుకోండి',
      applyNow: 'ఇప్పుడు దరఖాస్తు చేసుకోండి'
    },
    ta: {
      title: 'அரசு கடன் திட்டங்கள்',
      description: 'விவசாய செயல்பாடுகள் மற்றும் உள்கட்டமைப்பு மேம்பாட்டிற்கான மலிவு கடன் வசதிகளை அணுகவும்',
      emiCalculator: 'EMI கால்குலேட்டர்',
      applicationStatus: 'விண்ணப்ப நிலை',
      calculateEMI: 'உங்கள் மாதாந்திர தவணைகளைக் கணக்கிடுங்கள்',
      loanAmount: 'கடன் தொகை (₹)',
      interestRate: 'வட்டி விகிதம் (%)',
      tenure: 'காலம் (ஆண்டுகள்)',
      monthlyEMI: 'மாதாந்திர EMI',
      maxAmount: 'அதிகபட்ச தொகை',
      eligibility: 'தகுதி',
      learnMore: 'மேலும் அறிக',
      applyNow: 'இப்போது விண்ணப்பிக்கவும்'
    },
    ml: {
      title: 'സർക്കാർ വായ്പാ പദ്ധതികൾ',
      description: 'കാർഷിക പ്രവർത്തനങ്ങൾക്കും അടിസ്ഥാന സൗകര്യ വികസനത്തിനും താങ്ങാവുന്ന വായ്പാ സൗകര്യങ്ങൾ ലഭിക്കുക',
      emiCalculator: 'EMI കാൽക്കുലേറ്റർ',
      applicationStatus: 'അപേക്ഷാ നില',
      calculateEMI: 'നിങ്ങളുടെ പ്രതിമാസ ഇൻസ്റ്റാൾമെന്റുകൾ കണക്കാക്കുക',
      loanAmount: 'വായ്പാ തുക (₹)',
      interestRate: 'പലിശ നിരക്ക് (%)',
      tenure: 'കാലാവധി (വർഷങ്ങൾ)',
      monthlyEMI: 'പ്രതിമാസ EMI',
      maxAmount: 'പരമാവധി തുക',
      eligibility: 'യോഗ്യത',
      learnMore: 'കൂടുതൽ അറിയുക',
      applyNow: 'ഇപ്പോൾ അപേക്ഷിക്കുക'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    const months = tenure * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    return emi;
  };

  const handleApplyLoan = (loan: LoanScheme) => {
    setSelectedLoan(loan);
    toast({
      title: "Application Process Started",
      description: `Proceeding with ${loan.name} application`,
    });
  };
  return (
    <div className="space-y-6" id="loans">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-primary">{t.title}</h2>
        <p className="text-muted-foreground">
          {t.description}
        </p>
        
        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowEMICalculator(!showEMICalculator)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {t.emiCalculator}
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            {t.applicationStatus}
          </Button>
        </div>

        {/* EMI Calculator */}
        {showEMICalculator && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">{t.emiCalculator}</CardTitle>
              <CardDescription>{t.calculateEMI}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">{t.loanAmount}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 500000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">{t.interestRate}</Label>
                  <Input type="number" placeholder="7" defaultValue="7" />
                </div>
                <div>
                  <Label className="text-sm">{t.tenure}</Label>
                  <Input type="number" placeholder="5" defaultValue="5" />
                </div>
                <div>
                  <Label className="text-sm">{t.monthlyEMI}</Label>
                  <div className="text-lg font-bold text-primary">
                    {loanAmount ? `₹${calculateEMI(parseInt(loanAmount), 7, 5).toLocaleString('en-IN', {maximumFractionDigits: 0})}` : '₹0'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loanSchemes.map((loan, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {loan.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={categoryColors[loan.category]} variant="secondary">
                      {loan.category}
                    </Badge>
                    <Badge className={statusColors[loan.status]} variant="secondary">
                      {loan.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="leading-relaxed">
                {loan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary" />
                      <span className="font-medium">{t.maxAmount}</span>
                    </div>
                    <span className="font-bold text-primary">{loan.maxAmount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-secondary" />
                      <span className="font-medium">{t.interestRate}</span>
                    </div>
                    <span className="font-bold text-secondary">{loan.interestRate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="font-medium">{t.tenure}</span>
                    </div>
                    <span className="font-bold text-accent">{loan.tenure}</span>
                  </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  {t.eligibility}
                </h4>
                <ul className="space-y-1">
                  {loan.eligibility.map((criteria, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">
                  {t.learnMore}
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
                  onClick={() => handleApplyLoan(loan)}
                >
                  {t.applyNow}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LoanSchemes;