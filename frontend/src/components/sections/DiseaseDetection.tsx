import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Camera, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiseaseDetectionProps {
  currentLanguage: string;
}

interface DetectionResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string[];
  preventiveMeasures: string[];
}

const mockResults: DetectionResult[] = [
  {
    disease: 'Late Blight (Tomato)',
    confidence: 87,
    severity: 'high',
    treatment: [
      'Apply copper-based fungicide immediately',
      'Remove affected leaves and dispose properly',
      'Improve air circulation around plants',
      'Reduce watering frequency'
    ],
    preventiveMeasures: [
      'Use resistant varieties',
      'Maintain proper plant spacing',
      'Avoid overhead watering',
      'Apply preventive fungicide spray'
    ]
  }
];

const DiseaseDetection = ({ currentLanguage }: DiseaseDetectionProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Plant Disease Detection',
      description: 'Upload a photo of your plant to get instant disease diagnosis and treatment recommendations',
      uploadImage: 'Upload Plant Image',
      uploadDescription: 'Take a clear photo of the affected plant parts (leaves, stems, fruits)',
      dropImage: 'Drop your image here',
      browseFiles: 'or click to browse files',
      chooseImage: 'Choose Image',
      analyzeDisease: 'Analyze Disease',
      analyzing: 'Analyzing...',
      progress: 'AI Analysis Progress',
      processing: 'Processing...',
      aiAnalysis: 'Using advanced AI models to identify plant diseases...',
      detectionResults: 'Detection Results',
      aiDiagnosis: 'AI-powered diagnosis with treatment recommendations',
      severity: 'severity',
      confidenceLevel: 'Confidence Level',
      immediateTreatment: 'Immediate Treatment',
      preventionTips: 'Prevention Tips',
      detailedPlan: 'Get Detailed Treatment Plan',
      uploadPrompt: 'Upload an image to start disease detection',
      aiPrompt: 'Our AI will analyze the image and provide detailed diagnosis'
    },
    hi: {
      title: 'पौधों के रोग की पहचान',
      description: 'तत्काल रोग निदान और उपचार सिफारिशों के लिए अपने पौधे की तस्वीर अपलोड करें',
      uploadImage: 'पौधे की तस्वीर अपलोड करें',
      uploadDescription: 'प्रभावित पौधे के हिस्सों (पत्ते, तना, फल) की स्पष्ट तस्वीर लें',
      dropImage: 'अपनी तस्वीर यहाँ छोड़ें',
      browseFiles: 'या फाइलें ब्राउज़ करने के लिए क्लिक करें',
      chooseImage: 'तस्वीर चुनें',
      analyzeDisease: 'रोग का विश्लेषण करें',
      analyzing: 'विश्लेषण कर रहे हैं...',
      progress: 'AI विश्लेषण प्रगति',
      processing: 'प्रसंस्करण...',
      aiAnalysis: 'पौधों के रोगों की पहचान के लिए उन्नत AI मॉडल का उपयोग कर रहे हैं...',
      detectionResults: 'पहचान के परिणाम',
      aiDiagnosis: 'उपचार सिफारिशों के साथ AI-संचालित निदान',
      severity: 'गंभीरता',
      confidenceLevel: 'विश्वास स्तर',
      immediateTreatment: 'तत्काल उपचार',
      preventionTips: 'रोकथाम के सुझाव',
      detailedPlan: 'विस्तृत उपचार योजना प्राप्त करें',
      uploadPrompt: 'रोग की पहचान शुरू करने के लिए एक तस्वीर अपलोड करें',
      aiPrompt: 'हमारा AI तस्वीर का विश्लेषण करेगा और विस्तृत निदान प्रदान करेगा'
    },
    te: {
      title: 'మొక్కల వ్యాధి గుర్తింపు',
      description: 'తక్షణ వ్యాధి నిర్ధారణ మరియు చికిత్స సిఫార్సుల కోసం మీ మొక్క యొక్క ఫోటోను అప్‌లోడ్ చేయండి',
      uploadImage: 'మొక్క చిత్రాన్ని అప్‌లోడ్ చేయండి',
      uploadDescription: 'ప్రభావిత మొక్క భాగాల (ఆకులు, కాండలు, పండ్లు) స్పష్టమైన ఫోటో తీయండి',
      dropImage: 'మీ చిత్రాన్ని ఇక్కడ వదలండి',
      browseFiles: 'లేదా ఫైళ్లను బ్రౌజ్ చేయడానికి క్లిక్ చేయండి',
      chooseImage: 'చిత్రాన్ని ఎంచుకోండి',
      analyzeDisease: 'వ్యాధిని విశ్లేషించండి',
      analyzing: 'విశ్లేషిస్తోంది...',
      progress: 'AI విశ్లేషణ పురోగతి',
      processing: 'ప్రాసెసింగ్...',
      aiAnalysis: 'మొక్కల వ్యాధులను గుర్తించడానికి అధునాతన AI మోడల్‌లను ఉపయోగిస్తోంది...',
      detectionResults: 'గుర్తింపు ఫలితాలు',
      aiDiagnosis: 'చికిత్స సిఫార్సులతో AI-ఆధారిత నిర్ధారణ',
      severity: 'తీవ్రత',
      confidenceLevel: 'విశ్వాస స్థాయి',
      immediateTreatment: 'తక్షణ చికిత్స',
      preventionTips: 'నివారణ చిట్కాలు',
      detailedPlan: 'వివరణాత్మక చికిత్స ప్రణాళికను పొందండి',
      uploadPrompt: 'వ్యాధి గుర్తింపు ప్రారంభించడానికి ఒక చిత్రాన్ని అప్‌లోడ్ చేయండి',
      aiPrompt: 'మా AI చిత్రాన్ని విశ్లేషించి వివరణాత్మక నిర్ధారణను అందిస్తుంది'
    },
    ta: {
      title: 'தாவர நோய் கண்டறிதல்',
      description: 'உடனடி நோய் கண்டறிதல் மற்றும் சிகிச்சை பரிந்துரைகளுக்கு உங்கள் தாவரத்தின் புகைப்படத்தை பதிவேற்றவும்',
      uploadImage: 'தாவர படத்தை பதிவேற்றவும்',
      uploadDescription: 'பாதிக்கப்பட்ட தாவரப் பகுதிகளின் (இலைகள், தண்டுகள், பழங்கள்) தெளிவான புகைப்படம் எடுக்கவும்',
      dropImage: 'உங்கள் படத்தை இங்கே விடவும்',
      browseFiles: 'அல்லது கோப்புகளை உலாவ கிளிக் செய்யவும்',
      chooseImage: 'படத்தைத் தேர்ந்தெடுக்கவும்',
      analyzeDisease: 'நோயை பகுப்பாய்வு செய்யவும்',
      analyzing: 'பகுப்பாய்வு செய்கிறது...',
      progress: 'AI பகுப்பாய்வு முன்னேற்றம்',
      processing: 'செயலாக்கம்...',
      aiAnalysis: 'தாவர நோய்களை அடையாளம் காண உன்னத AI மாதிரிகளைப் பயன்படுத்துகிறது...',
      detectionResults: 'கண்டறிதல் முடிவுகள்',
      aiDiagnosis: 'சிகிச்சை பரிந்துரைகளுடன் AI-இயங்கும் நோய் கண்டறிதல்',
      severity: 'தீவிரம்',
      confidenceLevel: 'நம்பிக்கை நிலை',
      immediateTreatment: 'உடனடி சிகிச்சை',
      preventionTips: 'தடுப்பு குறிப்புகள்',
      detailedPlan: 'விரிவான சிகிச்சை திட்டத்தைப் பெறுங்கள்',
      uploadPrompt: 'நோய் கண்டறிதலைத் தொடங்க ஒரு படத்தைப் பதிவேற்றவும்',
      aiPrompt: 'எங்கள் AI படத்தை பகுப்பாய்வு செய்து விரிவான நோய் கண்டறிதலை வழங்கும்'
    },
    ml: {
      title: 'സസ്യ രോഗ കണ്ടെത്തൽ',
      description: 'തൽക്ഷണ രോഗ നിർണ്ണയത്തിനും ചികിത്സാ നിർദ്ദേശങ്ങൾക്കുമായി നിങ്ങളുടെ ചെടിയുടെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക',
      uploadImage: 'സസ്യ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക',
      uploadDescription: 'ബാധിച്ച സസ്യ ഭാഗങ്ങളുടെ (ഇലകൾ, തണ്ടുകൾ, പഴങ്ങൾ) വ്യക്തമായ ഫോട്ടോ എടുക്കുക',
      dropImage: 'നിങ്ങളുടെ ചിത്രം ഇവിടെ ഇടുക',
      browseFiles: 'അല്ലെങ്കിൽ ഫയലുകൾ ബ്രൗസ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക',
      chooseImage: 'ചിത്രം തിരഞ്ഞെടുക്കുക',
      analyzeDisease: 'രോഗം വിശകലനം ചെയ്യുക',
      analyzing: 'വിശകലനം ചെയ്യുന്നു...',
      progress: 'AI വിശകലന പുരോഗതി',
      processing: 'പ്രോസസ്സിംഗ്...',
      aiAnalysis: 'സസ്യ രോഗങ്ങൾ തിരിച്ചറിയാൻ നൂതന AI മോഡലുകൾ ഉപയോഗിക്കുന്നു...',
      detectionResults: 'കണ്ടെത്തൽ ഫലങ്ങൾ',
      aiDiagnosis: 'ചികിത്സാ നിർദ്ദേശങ്ങളുമായി AI-പവേർഡ് രോഗനിർണ്ണയം',
      severity: 'തീവ്രത',
      confidenceLevel: 'വിശ്വാസ നില',
      immediateTreatment: 'ഉടനടി ചികിത്സ',
      preventionTips: 'പ്രതിരോധ നുറുങ്ങുകൾ',
      detailedPlan: 'വിശദമായ ചികിത്സാ പദ്ധതി നേടുക',
      uploadPrompt: 'രോഗ കണ്ടെത്തൽ ആരംഭിക്കാൻ ഒരു ചിത്രം അപ്‌ലോഡ് ചെയ്യുക',
      aiPrompt: 'ഞങ്ങളുടെ AI ചിത്രം വിശകലനം ചെയ്യുകയും വിശദമായ രോഗനിർണ്ണയം നൽകുകയും ചെയ്യും'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setResults(null); // Clear any previous results
      // Don't auto-analyze, wait for user to click analyze button
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResults(mockResults[0]);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Plant disease has been successfully identified",
      });
    }, 3000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'high': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Info className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6" id="disease-detection">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">{t.title}</h2>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              {t.uploadImage}
            </CardTitle>
            <CardDescription>
              {t.uploadDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Plant preview" 
                    className="max-w-full max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedImage?.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{t.dropImage}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.browseFiles}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {t.chooseImage}
              </Button>
              <Button 
                className="flex-1"
                onClick={analyzeImage}
                disabled={!selectedImage || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  'Analyze Disease'
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AI Analysis Progress</span>
                  <span>Processing...</span>
                </div>
                <Progress value={33} className="animate-pulse" />
                <p className="text-xs text-muted-foreground text-center">
                  Using advanced AI models to identify plant diseases...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Detection Results
            </CardTitle>
            <CardDescription>
              AI-powered diagnosis with treatment recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                {/* Disease Identification */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{results.disease}</h3>
                    <Badge className={getSeverityColor(results.severity)}>
                      {getSeverityIcon(results.severity)}
                      {results.severity} severity
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence Level</span>
                      <span className="font-medium">{results.confidence}%</span>
                    </div>
                    <Progress value={results.confidence} className="h-2" />
                  </div>
                </div>

                {/* Treatment */}
                <div className="space-y-3">
                  <h4 className="font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Immediate Treatment
                  </h4>
                  <ul className="space-y-2">
                    {results.treatment.map((step, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="space-y-3">
                  <h4 className="font-medium text-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Prevention Tips
                  </h4>
                  <ul className="space-y-2">
                    {results.preventiveMeasures.map((tip, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="hero" className="w-full">
                  Get Detailed Treatment Plan
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload an image to start disease detection</p>
                <p className="text-sm mt-2">
                  Our AI will analyze the image and provide detailed diagnosis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiseaseDetection;