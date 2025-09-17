import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Gift, 
  Calculator,
  FileText,
  HelpCircle,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubsidiesProps {
  currentLanguage: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'subsidy-info' | 'calculation' | 'application-help';
}

interface SubsidyInfo {
  name: string;
  amount: string;
  eligibility: string[];
  documents: string[];
  deadline?: string;
}

const Subsidies = ({ currentLanguage }: SubsidiesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Subsidies Assistant',
      subtitle: 'Get instant help with government subsidies, eligibility, and applications',
      placeholder: 'Ask about subsidies, eligibility, application process...',
      send: 'Send',
      typing: 'Assistant is typing...',
      welcomeMessage: 'Hello! I\'m your Subsidies Assistant. I can help you with information about government subsidies, check your eligibility, calculate potential benefits, and guide you through the application process. What would you like to know?',
      quickActions: 'Quick Actions',
      checkEligibility: 'Check Eligibility',
      calculateBenefits: 'Calculate Benefits',
      applicationHelp: 'Application Help',
      viewSchemes: 'View All Schemes',
      recentQueries: 'Recent Queries',
      popularTopics: 'Popular Topics',
      pesticidesSubsidy: 'Pesticides Subsidy',
      fertilizerSubsidy: 'Fertilizer Subsidy',
      seedsSubsidy: 'Seeds Subsidy',
      equipmentSubsidy: 'Equipment Subsidy',
      howToApply: 'How to Apply',
      requiredDocuments: 'Required Documents',
      processingTime: 'Processing Time',
      contactSupport: 'Contact Support'
    },
    hi: {
      title: 'सब्सिडी सहायक',
      subtitle: 'सरकारी सब्सिडी, पात्रता और आवेदनों के साथ तत्काल सहायता प्राप्त करें',
      placeholder: 'सब्सिडी, पात्रता, आवेदन प्रक्रिया के बारे में पूछें...',
      send: 'भेजें',
      typing: 'सहायक टाइप कर रहा है...',
      welcomeMessage: 'नमस्ते! मैं आपका सब्सिडी सहायक हूं। मैं सरकारी सब्सिडी की जानकारी, आपकी पात्रता की जांच, संभावित लाभों की गणना और आवेदन प्रक्रिया में आपकी मदद कर सकता हूं। आप क्या जानना चाहते हैं?',
      quickActions: 'त्वरित कार्य',
      checkEligibility: 'पात्रता जांचें',
      calculateBenefits: 'लाभों की गणना करें',
      applicationHelp: 'आवेदन सहायता',
      viewSchemes: 'सभी योजनाएं देखें',
      recentQueries: 'हाल की पूछताछ',
      popularTopics: 'लोकप्रिय विषय',
      pesticidesSubsidy: 'कीटनाशक सब्सिडी',
      fertilizerSubsidy: 'उर्वरक सब्सिडी',
      seedsSubsidy: 'बीज सब्सिडी',
      equipmentSubsidy: 'उपकरण सब्सिडी',
      howToApply: 'आवेदन कैसे करें',
      requiredDocuments: 'आवश्यक दस्तावेज',
      processingTime: 'प्रसंस्करण समय',
      contactSupport: 'सहायता से संपर्क करें'
    },
    te: {
      title: 'సబ్సిడీ సహాయకుడు',
      subtitle: 'ప్రభుత్వ సబ్సిడీలు, అర్హత మరియు దరఖాస్తులతో తక్షణ సహాయం పొందండి',
      placeholder: 'సబ్సిడీలు, అర్హత, దరఖాస్తు ప్రక్రియ గురించి అడగండి...',
      send: 'పంపండి',
      typing: 'సహాయకుడు టైప్ చేస్తున్నాడు...',
      welcomeMessage: 'హలో! నేను మీ సబ్సిడీ సహాయకుడిని. ప్రభుత్వ సబ్సిడీల సమాచారం, మీ అర్హత తనిఖీ, సంభావ్య ప్రయోజనాల లెక్కింపు మరియు దరఖాస్తు ప్రక్రియలో మీకు సహాయం చేయగలను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?',
      quickActions: 'త్వరిత చర్యలు',
      checkEligibility: 'అర్హత తనిఖీ చేయండి',
      calculateBenefits: 'ప్రయోజనాలను లెక్కించండి',
      applicationHelp: 'దరఖాస్తు సహాయం',
      viewSchemes: 'అన్ని పథకాలు చూడండి',
      recentQueries: 'ఇటీవలి ప్రశ్నలు',
      popularTopics: 'ప్రసిద్ధ అంశాలు',
      pesticidesSubsidy: 'పురుగుమందుల సబ్సిడీ',
      fertilizerSubsidy: 'ఎరువుల సబ్సిడీ',
      seedsSubsidy: 'విత్తనాల సబ్సిడీ',
      equipmentSubsidy: 'పరికరాల సబ్సిడీ',
      howToApply: 'ఎలా దరఖాస్తు చేసుకోవాలి',
      requiredDocuments: 'అవసరమైన పత్రాలు',
      processingTime: 'ప్రాసెసింగ్ సమయం',
      contactSupport: 'మద్దతును సంప్రదించండి'
    },
    ta: {
      title: 'மானிய உதவியாளர்',
      subtitle: 'அரசு மானியங்கள், தகுதி மற்றும் விண்ணப்பங்களுடன் உடனடி உதவி பெறுங்கள்',
      placeholder: 'மானியங்கள், தகுதி, விண்ணப்ப செயல்முறை பற்றி கேளுங்கள்...',
      send: 'அனுப்பு',
      typing: 'உதவியாளர் தட்டச்சு செய்கிறார்...',
      welcomeMessage: 'வணக்கம்! நான் உங்கள் மானிய உதவியாளர். அரசு மானியங்கள் பற்றிய தகவல்கள், உங்கள் தகுதியை சரிபார்த்தல், சாத்தியமான பலன்களைக் கணக்கிடுதல் மற்றும் விண்ணப்ப செயல்முறையில் உங்களுக்கு உதவ முடியும். நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?',
      quickActions: 'விரைவு செயல்கள்',
      checkEligibility: 'தகுதியை சரிபார்க்கவும்',
      calculateBenefits: 'பலன்களைக் கணக்கிடுங்கள்',
      applicationHelp: 'விண்ணப்ப உதவி',
      viewSchemes: 'அனைத்து திட்டங்களையும் பார்க்கவும்',
      recentQueries: 'சமீபத்திய கேள்விகள்',
      popularTopics: 'பிரபலமான தலைப்புகள்',
      pesticidesSubsidy: 'பூச்சிக்கொல்லி மானியம்',
      fertilizerSubsidy: 'உர மானியம்',
      seedsSubsidy: 'விதை மானியம்',
      equipmentSubsidy: 'உபகரண மானியம்',
      howToApply: 'எப்படி விண்ணப்பிக்க வேண்டும்',
      requiredDocuments: 'தேவையான ஆவணங்கள்',
      processingTime: 'செயலாக்க நேரம்',
      contactSupport: 'ஆதரவைத் தொடர்பு கொள்ளுங்கள்'
    },
    ml: {
      title: 'സബ്സിഡി സഹായി',
      subtitle: 'സർക്കാർ സബ്സിഡികൾ, യോഗ്യത, അപേക്ഷകൾ എന്നിവയിൽ തൽക്ഷണ സഹായം നേടുക',
      placeholder: 'സബ്സിഡികൾ, യോഗ്യത, അപേക്ഷാ പ്രക്രിയ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
      send: 'അയയ്ക്കുക',
      typing: 'സഹായി ടൈപ്പ് ചെയ്യുന്നു...',
      welcomeMessage: 'ഹലോ! ഞാൻ നിങ്ങളുടെ സബ്സിഡി സഹായിയാണ്. സർക്കാർ സബ്സിഡികളെക്കുറിച്ചുള്ള വിവരങ്ങൾ, നിങ്ങളുടെ യോഗ്യത പരിശോധിക്കൽ, സാധ്യതയുള്ള നേട്ടങ്ങൾ കണക്കാക്കൽ, അപേക്ഷാ പ്രക്രിയയിൽ നിങ്ങളെ സഹായിക്കാൻ എനിക്ക് കഴിയും. നിങ്ങൾ എന്താണ് അറിയാൻ ആഗ്രഹിക്കുന്നത്?',
      quickActions: 'പെട്ടെന്നുള്ള പ്രവർത്തനങ്ങൾ',
      checkEligibility: 'യോഗ്യത പരിശോധിക്കുക',
      calculateBenefits: 'നേട്ടങ്ങൾ കണക്കാക്കുക',
      applicationHelp: 'അപേക്ഷാ സഹായം',
      viewSchemes: 'എല്ലാ പദ്ധതികളും കാണുക',
      recentQueries: 'സമീപകാല ചോദ്യങ്ങൾ',
      popularTopics: 'ജനപ്രിയ വിഷയങ്ങൾ',
      pesticidesSubsidy: 'കീടനാശിനി സബ്സിഡി',
      fertilizerSubsidy: 'വള സബ്സിഡി',
      seedsSubsidy: 'വിത്ത് സബ്സിഡി',
      equipmentSubsidy: 'ഉപകരണ സബ്സിഡി',
      howToApply: 'എങ്ങനെ അപേക്ഷിക്കാം',
      requiredDocuments: 'ആവശ്യമായ രേഖകൾ',
      processingTime: 'പ്രോസസ്സിംഗ് സമയം',
      contactSupport: 'സപ്പോർട്ടുമായി ബന്ധപ്പെടുക'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  // Mock subsidy data for responses
  const subsidyData: { [key: string]: SubsidyInfo } = {
    pesticide: {
      name: 'Pesticide Subsidy Scheme',
      amount: '50% subsidy up to ₹10,000',
      eligibility: ['Small & Marginal farmers', 'Certified organic farmers', 'FPO members'],
      documents: ['Aadhaar Card', 'Land Records', 'Bank Details', 'Previous purchase bills'],
      deadline: '2024-12-31'
    },
    fertilizer: {
      name: 'Organic Fertilizer Promotion',
      amount: '75% subsidy up to ₹15,000',
      eligibility: ['All category farmers', 'Organic certification holders'],
      documents: ['Farmer ID', 'Soil health card', 'Purchase receipts']
    },
    seeds: {
      name: 'Quality Seed Distribution',
      amount: '85% subsidy up to ₹5,000',
      eligibility: ['BPL farmers', 'Women farmers', 'SC/ST farmers'],
      documents: ['BPL Card', 'Caste certificate (if applicable)', 'Land documents']
    },
    equipment: {
      name: 'Farm Equipment Subsidy',
      amount: '40% subsidy up to ₹50,000',
      eligibility: ['Farmers with >1 acre land', 'Valid land ownership'],
      documents: ['Land records', 'Income certificate', 'Technical approval']
    }
  };

  const quickActionButtons = [
    { icon: CheckCircle, text: t.checkEligibility, action: 'eligibility' },
    { icon: Calculator, text: t.calculateBenefits, action: 'calculate' },
    { icon: FileText, text: t.applicationHelp, action: 'application' },
    { icon: Gift, text: t.viewSchemes, action: 'schemes' }
  ];

  const popularTopics = [
    { icon: '🌿', text: t.pesticidesSubsidy, query: 'pesticide subsidy information' },
    { icon: '🧪', text: t.fertilizerSubsidy, query: 'fertilizer subsidy details' },
    { icon: '🌱', text: t.seedsSubsidy, query: 'seeds subsidy scheme' },
    { icon: '🚜', text: t.equipmentSubsidy, query: 'equipment subsidy program' }
  ];

  useEffect(() => {
    // Add welcome message when component mounts
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        text: t.welcomeMessage,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [t.welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('pesticide') || message.includes('कीटनाशक') || message.includes('పురుగుమందు')) {
      const info = subsidyData.pesticide;
      return `${info.name}: ${info.amount}. Eligibility: ${info.eligibility.join(', ')}. Required documents: ${info.documents.join(', ')}.${info.deadline ? ` Deadline: ${info.deadline}` : ''}`;
    }
    
    if (message.includes('fertilizer') || message.includes('उर्वरक') || message.includes('ఎరువు')) {
      const info = subsidyData.fertilizer;
      return `${info.name}: ${info.amount}. Eligibility: ${info.eligibility.join(', ')}. Required documents: ${info.documents.join(', ')}.`;
    }
    
    if (message.includes('seed') || message.includes('बीज') || message.includes('విత్తన')) {
      const info = subsidyData.seeds;
      return `${info.name}: ${info.amount}. Eligibility: ${info.eligibility.join(', ')}. Required documents: ${info.documents.join(', ')}.`;
    }
    
    if (message.includes('equipment') || message.includes('उपकरण') || message.includes('పరికరం')) {
      const info = subsidyData.equipment;
      return `${info.name}: ${info.amount}. Eligibility: ${info.eligibility.join(', ')}. Required documents: ${info.documents.join(', ')}.`;
    }
    
    if (message.includes('eligibility') || message.includes('पात्रता') || message.includes('అర్హత')) {
      return 'To check your eligibility for subsidies, I need to know: 1) Your farmer category (Small/Marginal/Large), 2) Land ownership details, 3) Type of subsidy you\'re interested in. Please provide these details.';
    }
    
    if (message.includes('apply') || message.includes('आवेदन') || message.includes('దరఖాస్తు')) {
      return 'To apply for subsidies: 1) Visit your nearest agriculture office or apply online, 2) Submit required documents, 3) Fill the application form, 4) Wait for verification, 5) Receive approval and benefits. Processing time is usually 15-30 days.';
    }
    
    if (message.includes('calculate') || message.includes('गणना') || message.includes('లెక్కింపు')) {
      return 'To calculate your subsidy benefits, please tell me: 1) Type of subsidy (pesticide/fertilizer/seeds/equipment), 2) Your investment amount, 3) Your farmer category. I\'ll calculate the exact subsidy amount you\'re eligible for.';
    }
    
    // Default response
    return 'I can help you with information about government subsidies including pesticide, fertilizer, seeds, and equipment subsidies. You can ask about eligibility criteria, application process, required documents, or calculate potential benefits. What specific information do you need?';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'eligibility':
        message = 'I want to check my eligibility for subsidies';
        break;
      case 'calculate':
        message = 'Help me calculate subsidy benefits';
        break;
      case 'application':
        message = 'How do I apply for subsidies?';
        break;
      case 'schemes':
        message = 'Show me all available subsidy schemes';
        break;
    }
    setInputMessage(message);
  };

  const handlePopularTopic = (query: string) => {
    setInputMessage(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5" id="subsidies">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">{t.title}</h1>
                <p className="text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              {quickActionButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(button.action)}
                  className="flex items-center gap-2 bg-background/80 hover:bg-primary/10"
                >
                  <button.icon className="w-4 h-4" />
                  {button.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Popular Topics */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {t.popularTopics}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularTopics.map((topic, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePopularTopic(topic.query)}
                    className="w-full justify-start text-left h-auto p-3 hover:bg-primary/5"
                  >
                    <span className="text-lg mr-2">{topic.icon}</span>
                    <span className="text-sm">{topic.text}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Help Topics */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-accent" />
                  Help Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: FileText, text: t.howToApply },
                  { icon: CheckCircle, text: t.requiredDocuments },
                  { icon: Clock, text: t.processingTime },
                  { icon: MessageSquare, text: t.contactSupport }
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePopularTopic(item.text)}
                    className="w-full justify-start text-left h-auto p-3 hover:bg-accent/5"
                  >
                    <item.icon className="w-4 h-4 mr-2 text-accent" />
                    <span className="text-sm">{item.text}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Subsidies Assistant</CardTitle>
                    <CardDescription>AI-powered subsidy information and guidance</CardDescription>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      Online
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted border'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {message.sender === 'bot' && (
                              <Bot className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                            )}
                            {message.sender === 'user' && (
                              <User className="w-5 h-5 mt-0.5 text-primary-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.text}
                              </div>
                              <div className="text-xs opacity-70 mt-2">
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted border p-4 rounded-lg max-w-[80%]">
                          <div className="flex items-center gap-3">
                            <Bot className="w-5 h-5 text-primary" />
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-muted-foreground">{t.typing}</div>
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.placeholder}
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="sm"
                    className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send • AI-powered responses
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subsidies;