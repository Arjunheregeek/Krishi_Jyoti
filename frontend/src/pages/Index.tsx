import { useState } from 'react';
import Header from '@/components/Header';
import DashboardCard from '@/components/DashboardCard';
import MSPSchemes from '@/components/sections/MSPSchemes';
import LoanSchemes from '@/components/sections/LoanSchemes';
import Subsidies from '@/components/sections/Subsidies';
import DiseaseDetection from '@/components/sections/DiseaseDetection';
import VoiceSupport from '@/components/sections/VoiceSupport';
import ClimateSupport from '@/components/sections/ClimateSupport';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Wheat,
  Banknote,
  Gift,
  CloudSun,
  Stethoscope,
  Mic,
  TrendingUp,
  Users,
  Target,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Dashboard translations
  const translations = {
    en: {
      aiPowered: '🌾 AI-Powered Agricultural Support for Indian Farmers - Empowering Indian Farmers with Krishi Jyoti',
      heroTitle: 'Empowering Indian Farmers with Krishi Jyoti',
      heroSubtitle: 'Get government scheme information, MSP rates, subsidies, climate predictions, disease detection, and voice-based support—all in one comprehensive platform designed for Indian agriculture.',
      getStarted: 'Get Started',
      farmersServed: 'Farmers Served',
      subsidiesClaimed: 'Subsidies Claimed',
      detectionAccuracy: 'Disease Detection Accuracy',
      languagesSupported: 'Languages Supported',
      completeFarming: 'Complete Farming Solutions',
      everythingYouNeed: 'Everything you need for modern, profitable farming - from government schemes to AI-powered assistance',
      mspSchemes: 'MSP Schemes',
      mspDescription: 'Check latest Minimum Support Prices for your crops from central and state governments',
      viewMSP: 'View MSP Rates',
      govLoans: 'Government Loans',
      loansDescription: 'Access affordable credit facilities for farming operations and equipment purchase',
      exploreLoans: 'Explore Loans',
      subsidies: 'Subsidies',
      subsidiesDescription: 'Get financial assistance for pesticides, fertilizers, seeds, and farming equipment',
      viewSubsidies: 'View Subsidies',
      climateSupport: 'Climate Support',
      climateDescription: 'Weather predictions and climate-based farming recommendations for better yields',
      getWeather: 'Get Weather Info',
      diseaseDetection: 'Disease Detection',
      diseaseDescription: 'Upload plant photos for instant AI-powered disease diagnosis and treatment advice',
      scanPlant: 'Scan Plant',
      voiceSupport: 'Voice Support',
      voiceSupportDescription: 'Get farming advice in Hindi, English, and regional languages through voice interaction',
      startVoice: 'Start Voice Chat',
      aboutKrishi: 'About Krishi Jyoti',
      aboutDescription: 'Krishi Jyoti is a comprehensive AI-powered platform designed specifically for Indian farmers, providing access to government schemes, market intelligence, and modern farming solutions.',
      multiLanguage: 'Multi-Language Support',
      multiLangDesc: 'Available in Hindi, English, Telugu, Tamil, Malayalam, and more regional languages',
      aiInsights: 'AI-Powered Insights',
      aiInsightsDesc: 'Advanced machine learning for disease detection and crop recommendations',
      realTimeData: 'Real-time Data',
      realTimeDesc: 'Live weather updates, MSP rates, and government scheme notifications',
      backToDashboard: '← Back to Dashboard',
      copyright: '© 2024 Krishi Jyoti - Government of India Initiative',
      empowering: 'Empowering farmers with technology and government support'
    },
    hi: {
      aiPowered: '🌾 भारतीय किसानों के लिए AI-संचालित कृषि सहायता - कृषि ज्योति के साथ भारतीय किसानों को सशक्त बनाना',
      heroTitle: 'कृषि ज्योति के साथ भारतीय किसानों को सशक्त बनाना',
      heroSubtitle: 'सरकारी योजना की जानकारी, MSP दरें, सब्सिडी, जलवायु पूर्वानुमान, रोग का पता लगाना और आवाज-आधारित सहायता प्राप्त करें—सभी एक व्यापक मंच पर जो भारतीय कृषि के लिए डिज़ाइन किया गया है।',
      getStarted: 'शुरू करें',
      farmersServed: 'सेवा किए गए किसान',
      subsidiesClaimed: 'प्राप्त सब्सिडी',
      detectionAccuracy: 'रोग पहचान सटीकता',
      languagesSupported: 'समर्थित भाषाएं',
      completeFarming: 'संपूर्ण कृषि समाधान',
      everythingYouNeed: 'आधुनिक, लाभदायक कृषि के लिए आपको जो कुछ भी चाहिए - सरकारी योजनाओं से लेकर AI-संचालित सहायता तक',
      mspSchemes: 'MSP योजनाएं',
      mspDescription: 'केंद्रीय और राज्य सरकारों से अपनी फसलों के लिए नवीनतम न्यूनतम समर्थन मूल्य देखें',
      viewMSP: 'MSP दरें देखें',
      govLoans: 'सरकारी ऋण',
      loansDescription: 'कृषि संचालन और उपकरण खरीद के लिए किफायती ऋण सुविधाओं तक पहुंच',
      exploreLoans: 'ऋण खोजें',
      subsidies: 'सब्सिडी',
      subsidiesDescription: 'कीटनाशकों, उर्वरकों, बीजों और कृषि उपकरणों के लिए वित्तीय सहायता प्राप्त करें',
      viewSubsidies: 'सब्सिडी देखें',
      climateSupport: 'जलवायु सहायता',
      climateDescription: 'बेहतर उत्पादन के लिए मौसम की भविष्यवाणी और जलवायु-आधारित कृषि सिफारिशें',
      getWeather: 'मौसम की जानकारी प्राप्त करें',
      diseaseDetection: 'रोग पहचान',
      diseaseDescription: 'तत्काल AI-संचालित रोग निदान और उपचार सलाह के लिए पौधों की तस्वीरें अपलोड करें',
      scanPlant: 'पौधे को स्कैन करें',
      voiceSupport: 'आवाज़ सहायता',
      voiceSupportDescription: 'हिंदी, अंग्रेजी और क्षेत्रीय भाषाओं में आवाज़ इंटरेक्शन के माध्यम से कृषि सलाह प्राप्त करें',
      startVoice: 'वॉयस चैट शुरू करें',
      aboutKrishi: 'कृषि ज्योति के बारे में',
      aboutDescription: 'कृषि ज्योति भारतीय किसानों के लिए विशेष रूप से डिज़ाइन किया गया एक व्यापक AI-संचालित मंच है, जो सरकारी योजनाओं, बाजार की जानकारी और आधुनिक कृषि समाधानों तक पहुंच प्रदान करता है।',
      multiLanguage: 'बहु-भाषा सहायता',
      multiLangDesc: 'हिंदी, अंग्रेजी, तेलुगु, तमिल, मलयालम और अधिक क्षेत्रीय भाषाओं में उपलब्ध',
      aiInsights: 'AI-संचालित अंतर्दृष्टि',
      aiInsightsDesc: 'रोग का पता लगाने और फसल की सिफारिशों के लिए उन्नत मशीन लर्निंग',
      realTimeData: 'रियल-टाइम डेटा',
      realTimeDesc: 'लाइव मौसम अपडेट, MSP दरें और सरकारी योजना सूचनाएं',
      backToDashboard: '← डैशबोर्ड पर वापस',
      copyright: '© 2024 कृषि ज्योति - भारत सरकार की पहल',
      empowering: 'प्रौद्योगिकी और सरकारी सहायता के साथ किसानों को सशक्त बनाना'
    },
    te: {
      aiPowered: '🌾 భారతీయ రైతుల కోసం AI-ఆధారిత వ్యవసాయ మద్దతు - కృషి జ్యోతితో భారతీయ రైతులను శక్తివంతం చేయడం',
      heroTitle: 'కృషి జ్యోతితో భారతీయ రైతులను శక్తివంతం చేయడం',
      heroSubtitle: 'ప్రభుత్వ పథకాల సమాచారం, MSP రేట్లు, సబ్సిడీలు, వాతావరణ అంచనాలు, వ్యాధి గుర్తింపు మరియు వాయిస్-ఆధారిత మద్దతును పొందండి—అన్నీ భారతీయ వ్యవసాయానికి రూపకల్పన చేయబడిన ఒక సమగ్ర వేదికలో.',
      getStarted: 'ప్రారంభించండి',
      farmersServed: 'సేవ చేయబడిన రైతులు',
      subsidiesClaimed: 'పొందిన సబ్సిడీలు',
      detectionAccuracy: 'వ్యాధి గుర్తింపు ఖచ్చితత్వం',
      languagesSupported: 'మద్దతు ఉన్న భాషలు',
      completeFarming: 'సంపూర్ణ వ్యవసాయ పరిష్కారాలు',
      everythingYouNeed: 'ఆధునిక, లాభదాయకమైన వ్యవసాయానికి మీకు అవసరమైనవన్నీ - ప్రభుత్వ పథకాల నుండి AI-ఆధారిత సహాయం వరకు',
      mspSchemes: 'MSP పథకాలు',
      mspDescription: 'కేంద్ర మరియు రాష్ట్ర ప్రభుత్వాల నుండి మీ పంటలకు తాజా కనీస మద్దతు ధరలను తనిఖీ చేయండి',
      viewMSP: 'MSP రేట్లు చూడండి',
      govLoans: 'ప్రభుత్వ రుణాలు',
      loansDescription: 'వ్యవసాయ కార్యకలాపాలు మరియు పరికరాల కొనుగోలు కోసం సరసమైన రుణ సౌకర్యాలను పొందండి',
      exploreLoans: 'రుణాలను అన్వేషించండి',
      subsidies: 'సబ్సిడీలు',
      subsidiesDescription: 'కీటనాశకాలు, ఎరువులు, విత్తనాలు మరియు వ్యవసాయ పరికరాలకు ఆర్థిక సహాయం పొందండి',
      viewSubsidies: 'సబ్సిడీలు చూడండి',
      climateSupport: 'వాతావరణ మద్దతు',
      climateDescription: 'మెరుగైన దిగుబడుల కోసం వాతావరణ అంచనాలు మరియు వాతావరణ-ఆధారిత వ్యవసాయ సిఫార్సులు',
      getWeather: 'వాతావరణ సమాచారం పొందండి',
      diseaseDetection: 'వ్యాధి గుర్తింపు',
      diseaseDescription: 'తక్షణ AI-ఆధారిత వ్యాధి నిర్ధారణ మరియు చికిత్స సలహా కోసం మొక్కల ఫోటోలను అప్‌లోడ్ చేయండి',
      scanPlant: 'మొక్కను స్కాన్ చేయండి',
      voiceSupport: 'వాయిస్ మద్దతు',
      voiceSupportDescription: 'తెలుగు, హిందీ, ఇంగ్లీష్ మరియు ప్రాంతీయ భాషలలో వాయిస్ ఇంటరాక్షన్ ద్వారా వ్యవసాయ సలహా పొందండి',
      startVoice: 'వాయిస్ చాట్ ప్రారంభించండి',
      aboutKrishi: 'కృషి జ్యోతి గురించి',
      aboutDescription: 'కృషి జ్యోతి భారతీయ రైతుల కోసం ప్రత్యేకంగా రూపొందించబడిన ఒక సమగ్ర AI-ఆధారిత వేదిక, ప్రభుత్వ పథకాలు, మార్కెట్ ఇంటెలిజెన్స్ మరియు ఆధునిక వ్యవసాయ పరిష్కారాలను అందిస్తుంది.',
      multiLanguage: 'బహుళ-భాషా మద్దతు',
      multiLangDesc: 'తెలుగు, హిందీ, ఇంగ్లీష్, తమిళం, మలయాళం మరియు మరిన్ని ప్రాంతీయ భాషలలో అందుబాటులో ఉంది',
      aiInsights: 'AI-ఆధారిత అంతర్దృష్టులు',
      aiInsightsDesc: 'వ్యాధి గుర్తింపు మరియు పంట సిఫార్సుల కోసం అధునాతన మెషిన్ లర్నింగ్',
      realTimeData: 'రియల్-టైమ్ డేటా',
      realTimeDesc: 'ప్రత్యక్ష వాతావరణ అప్‌డేట్‌లు, MSP రేట్లు మరియు ప్రభుత్వ పథక నోటిఫికేషన్‌లు',
      backToDashboard: '← డాష్‌బోర్డ్‌కు తిరిగి',
      copyright: '© 2024 కృషి జ్యోతి - భారత ప్రభుత్వ చొరవ',
      empowering: 'సాంకేతికత మరియు ప్రభుత్వ మద్దతుతో రైతులను శక్తివంతం చేయడం'
    },
    ta: {
      aiPowered: '🌾 இந்திய விவசாயிகளுக்கான AI-இயங்கும் வேளாண் ஆதரவு - கிருஷி ஜோதியுடன் இந்திய விவசாயிகளை வலுப்படுத்துதல்',
      heroTitle: 'கிருஷி ஜோதியுடன் இந்திய விவசாயிகளை வலுப்படுத்துதல்',
      heroSubtitle: 'அரசாங்க திட்ட தகவல், MSP விகிதங்கள், மானியங்கள், காலநிலை கணிப்புகள், நோய் கண்டறிதல் மற்றும் குரல்-அடிப்படையிலான ஆதரவைப் பெறுங்கள்—அனைத்தும் இந்திய விவசாயத்திற்காக வடிவமைக்கப்பட்ட ஒரு விரிவான தளத்தில்.',
      getStarted: 'தொடங்குங்கள்',
      farmersServed: 'சேவை செய்யப்பட்ட விவசாயிகள்',
      subsidiesClaimed: 'பெறப்பட்ட மானியங்கள்',
      detectionAccuracy: 'நோய் கண்டறிதல் துல்லியம்',
      languagesSupported: 'ஆதரிக்கப்படும் மொழிகள்',
      completeFarming: 'முழுமையான விவசாய தீர்வுகள்',
      everythingYouNeed: 'நவீன, லாபகரமான விவசாயத்திற்கு உங்களுக்குத் தேவையான அனைத்தும் - அரசாங்க திட்டங்கள் முதல் AI-இயங்கும் உதவி வரை',
      mspSchemes: 'MSP திட்டங்கள்',
      mspDescription: 'மத்திய மற்றும் மாநில அரசுகளிடமிருந்து உங்கள் பயிர்களுக்கான சமீபத்திய குறைந்தபட்ச ஆதரவு விலைகளைச் சரிபார்க்கவும்',
      viewMSP: 'MSP விகிதங்களைப் பார்க்கவும்',
      govLoans: 'அரசாங்க கடன்கள்',
      loansDescription: 'விவசாய செயல்பாடுகள் மற்றும் உபகரண வாங்குதலுக்கான மலிவு கடன் வசதிகளை அணுகவும்',
      exploreLoans: 'கடன்களை ஆராயுங்கள்',
      subsidies: 'மானியங்கள்',
      subsidiesDescription: 'பூச்சிக்கொல்லிகள், உரங்கள், விதைகள் மற்றும் விவசாய உபகரணங்களுக்கு நிதி உதவி பெறுங்கள்',
      viewSubsidies: 'மானியங்களைப் பார்க்கவும்',
      climateSupport: 'காலநிலை ஆதரவு',
      climateDescription: 'சிறந்த மகசூலுக்கான வானிலை கணிப்புகள் மற்றும் காலநிலை-அடிப்படையிலான விவசாய பரிந்துரைகள்',
      getWeather: 'வானிலை தகவல் பெறுங்கள்',
      diseaseDetection: 'நோய் கண்டறிதல்',
      diseaseDescription: 'உடனடி AI-இயங்கும் நோய் கண்டறிதல் மற்றும் சிகிச்சை ஆலோசனைக்கு தாவர புகைப்படங்களைப் பதிவேற்றவும்',
      scanPlant: 'தாவரத்தை ஸ்கேன் செய்யுங்கள்',
      voiceSupport: 'குரல் ஆதரவு',
      voiceSupportDescription: 'தமிழ், ஹிந்தி, ஆங்கிலம் மற்றும் பிராந்திய மொழிகளில் குரல் தொடர்பு மூலம் விவசாய ஆலோசனை பெறுங்கள்',
      startVoice: 'வாய்ஸ் சாட் தொடங்கவும்',
      aboutKrishi: 'கிருஷி ஜோதி பற்றி',
      aboutDescription: 'கிருஷி ஜோதி இந்திய விவசாயிகளுக்காக பிரத்யேகமாக வடிவமைக்கப்பட்ட ஒரு விரிவான AI-இயங்கும் தளம், அரசாங்க திட்டங்கள், சந்தை நுண்ணறிவு மற்றும் நவீன விவசாய தீர்வுகளை வழங்குகிறது.',
      multiLanguage: 'பல-மொழி ஆதரவு',
      multiLangDesc: 'தமிழ், ஹிந்தி, ஆங்கிலம், தெலுங்கு, மலையாளம் மற்றும் பிற பிராந்திய மொழிகளில் கிடைக்கிறது',
      aiInsights: 'AI-இயங்கும் நுண்ணறிவுகள்',
      aiInsightsDesc: 'நோய் கண்டறிதல் மற்றும் பயிர் பரிந்துரைகளுக்கான மேம்பட்ட இயந்திர கற்றல்',
      realTimeData: 'நேரடி தரவு',
      realTimeDesc: 'நேரடி வானிலை புதுப்பிப்புகள், MSP விகிதங்கள் மற்றும் அரசாங்க திட்ட அறிவிப்புகள்',
      backToDashboard: '← டாஷ்போர்டுக்குத் திரும்பு',
      copyright: '© 2024 கிருஷி ஜோதி - இந்திய அரசு முயற்சி',
      empowering: 'தொழில்நுட்பம் மற்றும் அரசாங்க ஆதரவுடன் விவசாயிகளை வலுப்படுத்துதல்'
    },
    ml: {
      aiPowered: '🌾 ഇന്ത്യൻ കർഷകർക്കുള്ള AI-പ്രവർത്തിത കാർഷിക പിന്തുണ',
      heroTitle: 'കൃഷി ജ്യോതിയുമായി ഇന്ത്യൻ കർഷകരെ ശാക്തീകരിക്കുന്നു',
      heroSubtitle: 'സർക്കാർ പദ്ധതി വിവരങ്ങൾ, MSP നിരക്കുകൾ, സബ്‌സിഡികൾ, കാലാവസ്ഥാ പ്രവചനങ്ങൾ, രോഗനിർണയം, വോയ്‌സ്-അടിസ്ഥാന പിന്തുണ എന്നിവ നേടൂ—എല്ലാം ഇന്ത്യൻ കൃഷിക്കായി രൂപകൽപ്പന ചെയ്ത ഒരു സമഗ്ര പ്ലാറ്റ്‌ഫോമിൽ.',
      getStarted: 'ആരംഭിക്കൂ',
      farmersServed: 'സേവനം നൽകിയ കർഷകർ',
      subsidiesClaimed: 'ലഭിച്ച സബ്‌സിഡികൾ',
      detectionAccuracy: 'രോഗനിർണയ കൃത്യത',
      languagesSupported: 'പിന്തുണയ്ക്കുന്ന ഭാഷകൾ',
      completeFarming: 'സമ്പൂർണ കാർഷിക പരിഹാരങ്ങൾ',
      everythingYouNeed: 'ആധുനികവും ലാഭകരവുമായ കൃഷിക്ക് നിങ്ങൾക്കാവശ്യമായ എല്ലാം - സർക്കാർ പദ്ധതികൾ മുതൽ AI-പ്രവർത്തിത സഹായം വരെ',
      mspSchemes: 'MSP പദ്ധതികൾ',
      mspDescription: 'കേന്ദ്ര, സംസ്ഥാന സർക്കാരുകളിൽ നിന്നുള്ള നിങ്ങളുടെ വിളകൾക്കുള്ള ഏറ്റവും പുതിയ ഏറ്റവും കുറഞ്ഞ പിന്തുണ വിലകൾ പരിശോധിക്കുക',
      viewMSP: 'MSP നിരക്കുകൾ കാണുക',
      govLoans: 'സർക്കാർ വായ്പകൾ',
      loansDescription: 'കാർഷിക പ്രവർത്തനങ്ങൾക്കും ഉപകരണ വാങ്ങലിനും താങ്ങാനാവുന്ന വായ്പാ സൗകര്യങ്ങൾ ആക്‌സസ് ചെയ്യുക',
      exploreLoans: 'വായ്പകൾ പര്യവേക്ഷണം ചെയ്യുക',
      subsidies: 'സബ്‌സിഡികൾ',
      subsidiesDescription: 'കീടനാശിനികൾ, വളങ്ങൾ, വിത്തുകൾ, കാർഷിക ഉപകരണങ്ങൾ എന്നിവയ്ക്ക് സാമ്പത്തിക സഹായം നേടുക',
      viewSubsidies: 'സബ്‌സിഡികൾ കാണുക',
      climateSupport: 'കാലാവസ്ഥാ പിന്തുണ',
      climateDescription: 'മികച്ച വിളവുകൾക്കായി കാലാവസ്ഥാ പ്രവചനങ്ങളും കാലാവസ്ഥാ അടിസ്ഥാനത്തിലുള്ള കാർഷിക ശുപാർശകളും',
      getWeather: 'കാലാവസ്ഥാ വിവരങ്ങൾ നേടുക',
      diseaseDetection: 'രോഗ കണ്ടെത്തൽ',
      diseaseDescription: 'തൽക്ഷണ AI-പ്രവർത്തിത രോഗനിർണയത്തിനും ചികിത്സാ ഉപദേശത്തിനുമായി ചെടികളുടെ ഫോറ്റോകൾ അപ്‌ലോഡ് ചെയ്യുക',
      scanPlant: 'ചെടി സ്കാൻ ചെയ്യുക',
      voiceSupport: 'വോയ്‌സ് പിന്തുണ',
      voiceSupportDescription: 'മലയാളം, ഹിന്ദി, ഇംഗ്ലീഷ്, പ്രാദേശിക ഭാഷകളിൽ വോയ്‌സ് ഇന്ററാക്ഷൻ വഴി കാർഷിക ഉപദേശം നേടുക',
      startVoice: 'വോയ്‌സ് ചാറ്റ് ആരംഭിക്കുക',
      aboutKrishi: 'കൃഷി ജ്യോതിയെക്കുറിച്ച്',
      aboutDescription: 'കൃഷി ജ്യോതി ഇന്ത്യൻ കർഷകർക്കായി പ്രത്യേകം രൂപകൽപ്പന ചെയ്ത ഒരു സമഗ്ര AI-പ്രവർത്തിത പ്ലാറ്റ്‌ഫോമാണ്, സർക്കാർ പദ്ധതികൾ, മാർക്കറ്റ് ഇന്റലിജൻസ്, ആധുനിക കാർഷിക പരിഹാരങ്ങൾ എന്നിവയിലേക്കുള്ള പ്രവേശനം നൽകുന്നു.',
      multiLanguage: 'ബഹു-ഭാഷാ പിന്തുണ',
      multiLangDesc: 'മലയാളം, ഹിന്ദി, ഇംഗ്ലീഷ്, തെലുങ്ക്, തമിഴ്, കൂടുതൽ പ്രാദേശിക ഭാഷകളിൽ ലഭ്യം',
      aiInsights: 'AI-പ്രവർത്തിത ഉൾക്കാഴ്ചകൾ',
      aiInsightsDesc: 'രോഗ കണ്ടെത്തലിനും വിള ശുപാർശകൾക്കുമുള്ള നൂതന മെഷീൻ ലേണിംഗ്',
      realTimeData: 'റിയൽ-ടൈം ഡാറ്റ',
      realTimeDesc: 'തത്സമയ കാലാവസ്ഥാ അപ്‌ഡേറ്റുകൾ, MSP നിരക്കുകൾ, സർക്കാർ പദ്ധതി അറിയിപ്പുകൾ',
      backToDashboard: '← ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക',
      copyright: '© 2024 കൃഷി ജ്യോതി - ഇന്ത്യാ ഗവൺമെന്റ് ഇനിഷ്യേറ്റീവ്',
      empowering: 'സാങ്കേതികവിദ്യയും സർക്കാർ പിന്തുണയും ഉപയോഗിച്ച് കർഷകരെ ശാക്തീകരിക്കുന്നു'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const dashboardCards = [
    {
      title: t.mspSchemes,
      description: t.mspDescription,
      icon: Wheat,
      buttonText: t.viewMSP,
      onClick: () => setActiveSection('schemes'),
      variant: 'primary' as const
    },
    {
      title: t.govLoans,
      description: t.loansDescription,
      icon: Banknote,
      buttonText: t.exploreLoans,
      onClick: () => setActiveSection('loans'),
      variant: 'secondary' as const
    },
    {
      title: t.subsidies,
      description: t.subsidiesDescription,
      icon: Gift,
      buttonText: t.viewSubsidies,
      onClick: () => setActiveSection('subsidies'),
      variant: 'accent' as const
    },
    {
      title: t.climateSupport,
      description: t.climateDescription,
      icon: CloudSun,
      buttonText: t.getWeather,
      onClick: () => setActiveSection('climate'),
      variant: 'secondary' as const
    },
    {
      title: t.diseaseDetection,
      description: t.diseaseDescription,
      icon: Stethoscope,
      buttonText: t.scanPlant,
      onClick: () => setActiveSection('disease-detection'),
      variant: 'primary' as const
    },
    {
      title: t.voiceSupport,
      description: t.voiceSupportDescription,
      icon: Mic,
      buttonText: t.startVoice,
      onClick: () => setActiveSection('support'),
      variant: 'accent' as const
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'schemes':
        return <MSPSchemes currentLanguage={currentLanguage} />;
      case 'loans':
        return <LoanSchemes currentLanguage={currentLanguage} />;
      case 'subsidies':
        return <Subsidies currentLanguage={currentLanguage} />;
      case 'climate':
        return <ClimateSupport currentLanguage={currentLanguage} />;
      case 'disease-detection':
        return <DiseaseDetection currentLanguage={currentLanguage} />;
      case 'support':
        return <VoiceSupport currentLanguage={currentLanguage} />;
      default:
        return (
          <>
            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_1px,transparent_1px)] [background-size:40px_40px] animate-pulse" />
              <div className="relative container mx-auto px-4">
                <div className="text-center space-y-8">
                  <Badge variant="secondary" className="px-6 py-2 bg-primary/10 border-primary/20 text-primary">
                    {t.aiPowered}
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight max-w-5xl mx-auto">
                    {t.heroTitle}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                    {t.heroSubtitle}
                  </p>

                  <Button 
                    size="lg" 
                    className="px-10 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                    onClick={() => setActiveSection('schemes')}
                  >
                    {t.getStarted}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                     {[
                       { icon: Users, value: '1000+', label: 'Districts Covered', color: 'text-primary' },
                       { icon: TrendingUp, value: '50+', label: 'Government Schemes', color: 'text-secondary' },
                       { icon: Target, value: '94%', label: t.detectionAccuracy, color: 'text-accent' },
                       { icon: Mic, value: '15+', label: t.languagesSupported, color: 'text-primary' }
                     ].map((stat, index) => (
                      <div key={index} className="text-center p-6 rounded-xl bg-background/80 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300">
                        <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                        <div className={`text-2xl md:text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Dashboard Cards */}
            <section className="py-20 bg-gradient-to-b from-background to-primary/5">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-primary">
                    {t.completeFarming}
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    {t.everythingYouNeed}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {dashboardCards.map((card, index) => (
                    <DashboardCard
                      key={index}
                      title={card.title}
                      description={card.description}
                      icon={card.icon}
                      buttonText={card.buttonText}
                      onClick={card.onClick}
                      variant={card.variant}
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  ))}
                </div>
              </div>
            </section>

            <Separator />

            {/* About Section */}
            <section className="py-16 bg-gradient-to-r from-muted/30 to-muted/10">
              <div className="container mx-auto px-4 text-center space-y-8">
                <h2 className="text-3xl font-bold text-primary">{t.aboutKrishi}</h2>
                <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-12">
                  {t.aboutDescription}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      title: t.multiLanguage,
                      description: t.multiLangDesc,
                      icon: '🌍'
                    },
                    {
                      title: t.aiInsights,
                      description: t.aiInsightsDesc,
                      icon: '🤖'
                    },
                    {
                      title: t.realTimeData,
                      description: t.realTimeDesc,
                      icon: '⚡'
                    }
                  ].map((feature, index) => (
                    <div key={index} className="space-y-4 p-6">
                      <div className="text-4xl">{feature.icon}</div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentLanguage={currentLanguage} 
        onLanguageChange={setCurrentLanguage}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <main className="pb-16">
        {activeSection !== 'dashboard' && (
          <div className="container mx-auto px-4 py-6">
            <Button 
              variant="ghost" 
              onClick={() => setActiveSection('dashboard')}
              className="mb-4"
            >
              {t.backToDashboard}
            </Button>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          {renderActiveSection()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t.copyright}</p>
          <p className="text-sm mt-2">{t.empowering}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
