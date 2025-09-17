import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, HelpCircle, FileText, Calculator, CheckCircle, Clock } from 'lucide-react';

interface MSPSchemesProps {
  currentLanguage: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'scheme-info' | 'calculation' | 'application-help';
}

const MSPSchemes = ({ currentLanguage }: MSPSchemesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      title: 'Crop Recommendation System',
      subtitle: 'Get AI-powered crop recommendations based on your location, soil type, weather conditions, and market trends',
      placeholder: 'Ask about crop recommendations, soil analysis, weather patterns, market prices...',
      send: 'Send',
      typing: 'Assistant is typing...',
      welcomeMessage: 'Hello! I\'m your Crop Recommendation Assistant. I can help you choose the best crops for your farm based on soil conditions, weather patterns, market demand, and profitability analysis. What would you like to know?',
      quickActions: 'Quick Actions',
      checkEligibility: 'Soil Analysis',
      calculateBenefits: 'Profit Calculator',
      applicationHelp: 'Crop Guide',
      viewSchemes: 'View Recommendations',
      popularTopics: 'Popular Topics',
      wheatMSP: 'Wheat Cultivation',
      riceMSP: 'Rice Farming',
      cottonMSP: 'Cotton Growing',
      sugarcaneMSP: 'Sugarcane Farming',
      howToApply: 'Best Practices',
      requiredDocuments: 'Soil Requirements',
      processingTime: 'Growing Season',
      contactSupport: 'Contact Support'
    },
    hi: {
      title: 'फसल सिफारिश प्रणाली',
      subtitle: 'अपने स्थान, मिट्टी के प्रकार, मौसम की स्थिति और बाजार के रुझान के आधार पर AI-संचालित फसल सिफारिशें प्राप्त करें',
      placeholder: 'फसल सिफारिशों, मिट्टी विश्लेषण, मौसम पैटर्न, बाजार की कीमतों के बारे में पूछें...',
      send: 'भेजें',
      typing: 'सहायक टाइप कर रहा है...',
      welcomeMessage: 'नमस्ते! मैं आपका फसल सिफारिश सहायक हूं। मैं मिट्टी की स्थिति, मौसम पैटर्न, बाजार की मांग और लाभप्रदता विश्लेषण के आधार पर आपके खेत के लिए सबसे अच्छी फसलों को चुनने में आपकी मदद कर सकता हूं। आप क्या जानना चाहते हैं?',
      quickActions: 'त्वरित कार्य',
      checkEligibility: 'मिट्टी विश्लेषण',
      calculateBenefits: 'लाभ कैलकुलेटर',
      applicationHelp: 'फसल गाइड',
      viewSchemes: 'सिफारिशें देखें',
      popularTopics: 'लोकप्रिय विषय',
      wheatMSP: 'गेहूं की खेती',
      riceMSP: 'चावल की खेती',
      cottonMSP: 'कपास की खेती',
      sugarcaneMSP: 'गन्ने की खेती',
      howToApply: 'सर्वोत्तम प्रथाएं',
      requiredDocuments: 'मिट्टी की आवश्यकताएं',
      processingTime: 'बढ़ते मौसम',
      contactSupport: 'सहायता से संपर्क करें'
    },
    te: {
      title: 'పంట సిఫార్సు వ్యవస్థ',
      subtitle: 'మీ స్థానం, మట్టి రకం, వాతావరణ పరిస్థితులు మరియు మార్కెట్ ట్రెండ్‌ల ఆధారంగా AI-ఆధారిత పంట సిఫార్సులను పొందండి',
      placeholder: 'పంట సిఫార్సులు, మట్టి విశ్లేషణ, వాతావరణ నమూనాలు, మార్కెట్ ధరల గురించి అడగండి...',
      send: 'పంపండి',
      typing: 'సహాయకుడు టైప్ చేస్తున్నాడు...',
      welcomeMessage: 'హలో! నేను మీ పంట సిఫార్సు సహాయకుడిని. మట్టి పరిస్థితులు, వాతావరణ నమూనాలు, మార్కెట్ డిమాండ్ మరియు లాభదాయకత విశ్లేషణ ఆధారంగా మీ వ్యవసాయ క్షేత్రానికి ఉత్తమ పంటలను ఎంచుకోవడంలో మీకు సహాయం చేయగలను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?',
      quickActions: 'త్వరిత చర్యలు',
      checkEligibility: 'మట్టి విశ్లేషణ',
      calculateBenefits: 'లాభం కాలిక్యులేటర్',
      applicationHelp: 'పంట గైడ్',
      viewSchemes: 'సిఫార్సులు చూడండి',
      popularTopics: 'ప్రసిద్ధ అంశాలు',
      wheatMSP: 'గోధుమ సాగు',
      riceMSP: 'వరి వ్యవసాయం',
      cottonMSP: 'పత్తి పెంపకం',
      sugarcaneMSP: 'చెరకు వ్యవసాయం',
      howToApply: 'ఉత్తమ పద్ధతులు',
      requiredDocuments: 'మట్టి అవసరాలు',
      processingTime: 'పెరుగుతున్న సీజన్',
      contactSupport: 'మద్దతును సంప్రదించండి'
    },
    ta: {
      title: 'பயிர் பரிந்துரை அமைப்பு',
      subtitle: 'உங்கள் இடம், மண் வகை, வானிலை நிலைமைகள் மற்றும் சந்தை போக்குகளின் அடிப்படையில் AI-இயங்கும் பயிர் பரிந்துரைகளைப் பெறுங்கள்',
      placeholder: 'பயிர் பரிந்துரைகள், மண் பகுப்பாய்வு, வானிலை முறைகள், சந்தை விலைகள் பற்றி கேளுங்கள்...',
      send: 'அனுப்பு',
      typing: 'உதவியாளர் தட்டச்சு செய்கிறார்...',
      welcomeMessage: 'வணக்கம்! நான் உங்கள் பயிர் பரிந்துரை உதவியாளர். மண் நிலைமைகள், வானிலை முறைகள், சந்தை தேவை மற்றும் லாபகரமான பகுப்பாய்வின் அடிப்படையில் உங்கள் பண்ணைக்கு சிறந்த பயிர்களைத் தேர்ந்தெடுக்க உங்களுக்கு உதவ முடியும். நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?',
      quickActions: 'விரைவு செயல்கள்',
      checkEligibility: 'மண் பகுப்பாய்வு',
      calculateBenefits: 'லாப கால்குலேட்டர்',
      applicationHelp: 'பயிர் வழிகாட்டி',
      viewSchemes: 'பரிந்துரைகளைப் பார்க்கவும்',
      popularTopics: 'பிரபலமான தலைப்புகள்',
      wheatMSP: 'கோதுமை சாகுபடி',
      riceMSP: 'அரிசி விவசாயம்',
      cottonMSP: 'பருத்தி வளர்ப்பு',
      sugarcaneMSP: 'கரும்பு விவசாயம்',
      howToApply: 'சிறந்த நடைமுறைகள்',
      requiredDocuments: 'மண் தேவைகள்',
      processingTime: 'வளரும் பருவம்',
      contactSupport: 'ஆதரவைத் தொடர்பு கொள்ளுங்கள்'
    },
    ml: {
      title: 'വിള ശുപാർശ സിസ്റ്റം',
      subtitle: 'നിങ്ങളുടെ സ്ഥാനം, മണ്ണിന്റെ തരം, കാലാവസ്ഥാ സാഹചര്യങ്ങൾ, മാർക്കറ്റ് ട്രെൻഡുകൾ എന്നിവയെ അടിസ്ഥാനമാക്കി AI-പ്രവർത്തിത വിള ശുപാർശകൾ നേടുക',
      placeholder: 'വിള ശുപാർശകൾ, മണ്ണ് വിശകലനം, കാലാവസ്ഥാ പാറ്റേണുകൾ, മാർക്കറ്റ് വിലകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
      send: 'അയയ്ക്കുക',
      typing: 'സഹായി ടൈപ്പ് ചെയ്യുന്നു...',
      welcomeMessage: 'ഹലോ! ഞാൻ നിങ്ങളുടെ വിള ശുപാർശ സഹായിയാണ്. മണ്ണിന്റെ അവസ്ഥ, കാലാവസ്ഥാ പാറ്റേണുകൾ, മാർക്കറ്റ് ഡിമാൻഡ്, ലാഭകരമായ വിശകലനം എന്നിവയെ അടിസ്ഥാനമാക്കി നിങ്ങളുടെ കൃഷിയിടത്തിന് ഏറ്റവും മികച്ച വിളകൾ തിരഞ്ഞെടുക്കാൻ നിങ്ങളെ സഹായിക്കാൻ എനിക്ക് കഴിയും. നിങ്ങൾ എന്താണ് അറിയാൻ ആഗ്രഹിക്കുന്നത്?',
      quickActions: 'പെട്ടെന്നുള്ള പ്രവർത്തനങ്ങൾ',
      checkEligibility: 'മണ്ണ് വിശകലനം',
      calculateBenefits: 'ലാഭം കാൽക്കുലേറ്റർ',
      applicationHelp: 'വിള ഗൈഡ്',
      viewSchemes: 'ശുപാർശകൾ കാണുക',
      popularTopics: 'ജനപ്രിയ വിഷയങ്ങൾ',
      wheatMSP: 'ഗോതമ്പ് കൃഷി',
      riceMSP: 'അരി കൃഷി',
      cottonMSP: 'പരുത്തി കൃഷി',
      sugarcaneMSP: 'കരിമ്പ് കൃഷി',
      howToApply: 'മികച്ച രീതികൾ',
      requiredDocuments: 'മണ്ണിന്റെ ആവശ്യകതകൾ',
      processingTime: 'വളരുന്ന സീസൺ',
      contactSupport: 'സപ്പോർട്ടുമായി ബന്ധപ്പെടുക'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const quickActionButtons = [
    { icon: CheckCircle, text: t.checkEligibility, action: 'eligibility' },
    { icon: Calculator, text: t.calculateBenefits, action: 'calculate' },
    { icon: FileText, text: t.applicationHelp, action: 'application' },
    { icon: MessageSquare, text: t.viewSchemes, action: 'schemes' }
  ];

  const popularTopics = [
    { icon: '🌾', text: t.wheatMSP, query: 'wheat MSP rates information' },
    { icon: '🍚', text: t.riceMSP, query: 'rice MSP rates details' },
    { icon: '🌿', text: t.cottonMSP, query: 'cotton MSP scheme' },
    { icon: '🎋', text: t.sugarcaneMSP, query: 'sugarcane MSP program' }
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


  // Call FastAPI backend for real crop recommendation
  const fetchBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/v1/crop/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          query: userMessage
        })
      });
      const data = await response.json();
      return data.response_text || data.result || 'Sorry, no recommendation found.';
    } catch (error) {
      return 'Sorry, there was an error connecting to the recommendation system.';
    }
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

    // Call backend for real bot response
    const botText = await fetchBotResponse(inputMessage);
    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: botText,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'eligibility':
        message = 'I want to check my eligibility for MSP schemes';
        break;
      case 'calculate':
        message = 'Help me calculate MSP benefits';
        break;
      case 'application':
        message = 'How do I apply for MSP schemes?';
        break;
      case 'schemes':
        message = 'Show me all available MSP schemes';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5" id="schemes">
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
                    <CardTitle className="text-lg">Crop Recommendation System</CardTitle>
                    <CardDescription>AI-powered crop recommendations and farming guidance</CardDescription>
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

export default MSPSchemes;