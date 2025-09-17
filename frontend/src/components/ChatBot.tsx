import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';

interface ChatBotProps {
  currentLanguage: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = ({ currentLanguage }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      chatTitle: 'MSP Schemes Assistant',
      chatSubtitle: 'Ask me about MSP rates, schemes, and eligibility',
      placeholder: 'Ask about MSP schemes, rates, eligibility...',
      send: 'Send',
      typing: 'Assistant is typing...',
      welcomeMessage: 'Hello! I\'m here to help you with MSP schemes and rates. You can ask me about current MSP prices, eligibility criteria, application processes, or any other scheme-related questions.',
      minimize: 'Minimize',
      maximize: 'Maximize',
      close: 'Close'
    },
    hi: {
      chatTitle: 'MSP योजना सहायक',
      chatSubtitle: 'MSP दरों, योजनाओं और पात्रता के बारे में पूछें',
      placeholder: 'MSP योजनाओं, दरों, पात्रता के बारे में पूछें...',
      send: 'भेजें',
      typing: 'सहायक टाइप कर रहा है...',
      welcomeMessage: 'नमस्ते! मैं MSP योजनाओं और दरों के साथ आपकी सहायता के लिए यहाँ हूँ। आप मुझसे वर्तमान MSP कीमतों, पात्रता मानदंड, आवेदन प्रक्रियाओं, या किसी अन्य योजना-संबंधी प्रश्नों के बारे में पूछ सकते हैं।',
      minimize: 'छोटा करें',
      maximize: 'बड़ा करें',
      close: 'बंद करें'
    },
    te: {
      chatTitle: 'MSP పథకాల సహాయకుడు',
      chatSubtitle: 'MSP రేట్లు, పథకాలు మరియు అర్హత గురించి అడగండి',
      placeholder: 'MSP పథకాలు, రేట్లు, అర్హత గురించి అడగండి...',
      send: 'పంపండి',
      typing: 'సహాయకుడు టైప్ చేస్తున్నాడు...',
      welcomeMessage: 'హలో! MSP పథకాలు మరియు రేట్లతో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. మీరు ప్రస్తుత MSP ధరలు, అర్హత ప్రమాణాలు, దరఖాస్తు ప్రక్రియలు లేదా ఇతర పథకాల సంబంధిత ప్రశ్నల గురించి నన్ను అడగవచ్చు.',
      minimize: 'చిన్నదిగా చేయండి',
      maximize: 'పెద్దదిగా చేయండి',
      close: 'మూసివేయండి'
    },
    ta: {
      chatTitle: 'MSP திட்ட உதவியாளர்',
      chatSubtitle: 'MSP விகிதங்கள், திட்டங்கள் மற்றும் தகுதி பற்றி கேளுங்கள்',
      placeholder: 'MSP திட்டங்கள், விகிதங்கள், தகுதி பற்றி கேளுங்கள்...',
      send: 'அனுப்பு',
      typing: 'உதவியாளர் தட்டச்சு செய்கிறார்...',
      welcomeMessage: 'வணக்கம்! MSP திட்டங்கள் மற்றும் விகிதங்களில் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். தற்போதைய MSP விலைகள், தகுதி அளவுகோல்கள், விண்ணப்ப செயல்முறைகள் அல்லது வேறு எந்த திட்ட தொடர்பான கேள்விகளையும் என்னிடம் கேட்கலாம்.',
      minimize: 'சிறிதாக்கு',
      maximize: 'பெரிதாக்கு',
      close: 'மூடு'
    },
    ml: {
      chatTitle: 'MSP പദ്ധതി സഹായി',
      chatSubtitle: 'MSP നിരക്കുകൾ, പദ്ധതികൾ, യോഗ്യത എന്നിവയെക്കുറിച്ച് ചോദിക്കുക',
      placeholder: 'MSP പദ്ധതികൾ, നിരക്കുകൾ, യോഗ്യത എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
      send: 'അയയ്ക്കുക',
      typing: 'സഹായി ടൈപ്പ് ചെയ്യുന്നു...',
      welcomeMessage: 'ഹലോ! MSP പദ്ധതികളും നിരക്കുകളും സംബന്ധിച്ച് നിങ്ങളെ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. നിലവിലെ MSP വിലകൾ, യോഗ്യതാ മാനദണ്ഡങ്ങൾ, അപേക്ഷാ പ്രക്രിയകൾ അല്ലെങ്കിൽ മറ്റേതെങ്കിലും പദ്ധതി സംബന്ധിയായ ചോദ്യങ്ങൾ എന്നിവയെക്കുറിച്ച് നിങ്ങൾക്ക് എന്നോട് ചോദിക്കാം.',
      minimize: 'ചെറുതാക്കുക',
      maximize: 'വലുതാക്കുക',
      close: 'അടയ്ക്കുക'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  // Mock responses for different queries
  const getMockResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('wheat') || message.includes('गेहूं') || message.includes('గోధుమ') || message.includes('கோதுமை') || message.includes('ഗോതമ്പ്')) {
      return currentLanguage === 'hi' 
        ? 'गेहूं का वर्तमान MSP ₹2,275 प्रति क्विंटल है (रबी 2024-25)। यह केंद्र सरकार द्वारा निर्धारित किया गया है। आप अपने नजदीकी खरीद केंद्र पर अपनी फसल बेच सकते हैं।'
        : currentLanguage === 'te'
        ? 'గోధుమ ప్రస్తుత MSP ₹2,275 ప్రति క్వింటల్ (రబీ 2024-25). ఇది కేంద్ర ప్రభుత్వంచే నిర్ణయించబడింది. మీరు మీ సమీప కొనుగోలు కేంద్రంలో మీ పంటను అమ్మవచ్చు.'
        : currentLanguage === 'ta'
        ? 'கோதுமையின் தற்போதைய MSP ₹2,275 ஒரு குவிண்டலுக்கு (ரபி 2024-25). இது மத்திய அரசால் நிர்ணயிக்கப்பட்டது. உங்கள் அருகிலுள்ள கொள்முதல் மையத்தில் உங்கள் பயிரை விற்கலாம்.'
        : currentLanguage === 'ml'
        ? 'ഗോതമ്പിന്റെ നിലവിലെ MSP ₹2,275 ഒരു ക്വിന്റലിന് (രബി 2024-25). ഇത് കേന്ദ്ര സർക്കാർ നിശ്ചയിച്ചതാണ്. നിങ്ങളുടെ അടുത്തുള്ള വാങ്ങൽ കേന്ദ്രത്തിൽ നിങ്ങളുടെ വിള വിൽക്കാം.'
        : 'The current MSP for wheat is ₹2,275 per quintal (Rabi 2024-25). This is set by the central government. You can sell your crop at the nearest procurement center.';
    }
    
    if (message.includes('rice') || message.includes('चावल') || message.includes('వరి') || message.includes('அரிசி') || message.includes('അരി')) {
      return currentLanguage === 'hi'
        ? 'सामान्य चावल का वर्तमान MSP ₹2,300 प्रति क्विंटल है (खरीफ 2024)। ग्रेड A चावल के लिए यह ₹2,320 प्रति क्विंटल है।'
        : currentLanguage === 'te'
        ? 'సాధారణ వరి ప్రస్తుత MSP ₹2,300 ప్రति క్వింటల్ (ఖరీఫ్ 2024). గ్రేడ్ A వరికి ఇది ₹2,320 ప్రति క్వింటల్.'
        : currentLanguage === 'ta'
        ? 'பொதுவான அரிசியின் தற்போதைய MSP ₹2,300 ஒரு குவிண்டலுக்கு (கரீப் 2024). கிரேட் A அரிசிக்கு இது ₹2,320 ஒரு குவிண்டலுக்கு.'
        : currentLanguage === 'ml'
        ? 'സാധാരണ അരിയുടെ നിലവിലെ MSP ₹2,300 ഒരു ക്വിന്റലിന് (ഖരീഫ് 2024). ഗ്രേഡ് A അരിക്ക് ഇത് ₹2,320 ഒരു ക്വിന്റലിന്.'
        : 'The current MSP for common rice is ₹2,300 per quintal (Kharif 2024). For Grade A rice, it is ₹2,320 per quintal.';
    }
    
    if (message.includes('eligibility') || message.includes('पात्रता') || message.includes('అర్హత') || message.includes('தகுதி') || message.includes('യോഗ്യത')) {
      return currentLanguage === 'hi'
        ? 'MSP योजना के लिए पात्रता: 1) भूमि स्वामी किसान 2) पट्टेदार किसान 3) मौखिक पट्टेदार। आपके पास वैध भूमि दस्तावेज या पट्टा समझौता होना चाहिए।'
        : currentLanguage === 'te'
        ? 'MSP పథకానికి అర్హత: 1) భూమి యజమాని రైతులు 2) లీజుదారు రైతులు 3) మౌఖిక లీజుదారులు. మీ వద్ద చెల్లుబాటు అయ్యే భూమి పత్రాలు లేదా లీజు ఒప్పందం ఉండాలి.'
        : currentLanguage === 'ta'
        ? 'MSP திட்டத்திற்கான தகுதி: 1) நில உரிமையாளர் விவசாயிகள் 2) குத்தகைதார விவசாயிகள் 3) வாய்மொழி குத்தகைதாரர்கள். உங்களிடம் செல்லுபடியாகும் நில ஆவணங்கள் அல்லது குத்தகை ஒப்பந்தம் இருக்க வேண்டும்.'
        : currentLanguage === 'ml'
        ? 'MSP പദ്ധതിക്കുള്ള യോഗ്യത: 1) ഭൂമി ഉടമസ്ഥ കർഷകർ 2) പാട്ടക്കാർ കർഷകർ 3) വാക്കാലുള്ള പാട്ടക്കാർ. നിങ്ങളുടെ പക്കൽ സാധുവായ ഭൂമി രേഖകൾ അല്ലെങ്കിൽ പാട്ട കരാർ ഉണ്ടായിരിക്കണം.'
        : 'Eligibility for MSP scheme: 1) Landowner farmers 2) Tenant farmers 3) Oral lessees. You must have valid land documents or lease agreement.';
    }
    
    if (message.includes('apply') || message.includes('आवेदन') || message.includes('దరఖాస్తు') || message.includes('விண்ணப்பம்') || message.includes('അപേക്ഷ')) {
      return currentLanguage === 'hi'
        ? 'MSP के तहत बेचने के लिए: 1) अपने नजदीकी खरीद केंद्र पर जाएं 2) आधार कार्ड और भूमि दस्तावेज लेकर जाएं 3) फसल की गुणवत्ता जांच कराएं 4) भुगतान 72 घंटों में मिलेगा।'
        : currentLanguage === 'te'
        ? 'MSP కింద అమ్మడానికి: 1) మీ సమీప కొనుగోలు కేంద్రానికి వెళ్లండి 2) ఆధార్ కార్డ్ మరియు భూమి పత్రాలను తీసుకెళ్లండి 3) పంట నాణ్యత తనిఖీ చేయించండి 4) చెల్లింపు 72 గంటల్లో వస్తుంది.'
        : currentLanguage === 'ta'
        ? 'MSP கீழ் விற்க: 1) உங்கள் அருகிலுள்ள கொள்முதல் மையத்திற்கு செல்லுங்கள் 2) ஆதார் அட்டை மற்றும் நில ஆவணங்களை எடுத்துச் செல்லுங்கள் 3) பயிர் தர சோதனை செய்யுங்கள் 4) பணம் 72 மணி நேரத்தில் கிடைக்கும்.'
        : currentLanguage === 'ml'
        ? 'MSP കീഴിൽ വിൽക്കാൻ: 1) നിങ്ങളുടെ അടുത്തുള്ള വാങ്ങൽ കേന്ദ്രത്തിൽ പോകുക 2) ആധാർ കാർഡും ഭൂമി രേഖകളും കൊണ്ടുപോകുക 3) വിള ഗുണനിലവാര പരിശോധന നടത്തുക 4) പണം 72 മണിക്കൂറിനുള്ളിൽ കിട്ടും.'
        : 'To sell under MSP: 1) Visit your nearest procurement center 2) Bring Aadhaar card and land documents 3) Get crop quality checked 4) Payment within 72 hours.';
    }
    
    // Default response
    return currentLanguage === 'hi'
      ? 'मैं MSP योजनाओं के बारे में जानकारी प्रदान कर सकता हूं। आप मुझसे MSP दरों, पात्रता, आवेदन प्रक्रिया, या खरीद केंद्रों के बारे में पूछ सकते हैं।'
      : currentLanguage === 'te'
      ? 'నేను MSP పథకాల గురించి సమాచారం అందించగలను. MSP రేట్లు, అర్హత, దరఖాస్తు ప్రక్రియ లేదా కొనుగోలు కేంద్రాల గురించి మీరు నన్ను అడగవచ్చు.'
      : currentLanguage === 'ta'
      ? 'நான் MSP திட்டங்கள் பற்றிய தகவல்களை வழங்க முடியும். MSP விகிதங்கள், தகுதி, விண்ணப்ப செயல்முறை அல்லது கொள்முதல் மையங்கள் பற்றி என்னிடம் கேட்கலாம்.'
      : currentLanguage === 'ml'
      ? 'എനിക്ക് MSP പദ്ധതികളെക്കുറിച്ചുള്ള വിവരങ്ങൾ നൽകാൻ കഴിയും. MSP നിരക്കുകൾ, യോഗ്യത, അപേക്ഷാ പ്രക്രിയ അല്ലെങ്കിൽ വാങ്ങൽ കേന്ദ്രങ്ങളെക്കുറിച്ച് നിങ്ങൾക്ക് എന്നോട് ചോദിക്കാം.'
      : 'I can provide information about MSP schemes. You can ask me about MSP rates, eligibility, application process, or procurement centers.';
  };

  useEffect(() => {
    // Add welcome message when component mounts
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: t.welcomeMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [t.welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getMockResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    } shadow-xl border-primary/20`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">{t.chatTitle}</CardTitle>
              {!isMinimized && (
                <p className="text-xs text-muted-foreground">{t.chatSubtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="w-3 h-3" />
              ) : (
                <Minimize2 className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === 'bot' && (
                        <Bot className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      )}
                      {message.sender === 'user' && (
                        <User className="w-4 h-4 mt-0.5 text-primary-foreground flex-shrink-0" />
                      )}
                      <div className="text-sm leading-relaxed">{message.text}</div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <div className="text-sm text-muted-foreground">{t.typing}</div>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
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
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ChatBot;