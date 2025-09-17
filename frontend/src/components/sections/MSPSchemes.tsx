import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Calendar, MapPin, DollarSign } from 'lucide-react';
import ChatBot from '@/components/ChatBot';

interface MSPSchemesProps {
  currentLanguage: string;
}

interface MSPData {
  crop: string;
  centralMSP: number;
  stateMSP?: number;
  season: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  state: string;
}

const mockMSPData: MSPData[] = [
  {
    crop: 'Wheat',
    centralMSP: 2275,
    stateMSP: 2300,
    season: 'Rabi 2024-25',
    lastUpdated: '2024-10-15',
    trend: 'up',
    state: 'Punjab'
  },
  {
    crop: 'Rice (Common)',
    centralMSP: 2300,
    stateMSP: 2350,
    season: 'Kharif 2024',
    lastUpdated: '2024-09-20',
    trend: 'up',
    state: 'Punjab'
  },
  {
    crop: 'Cotton',
    centralMSP: 7020,
    season: 'Kharif 2024',
    lastUpdated: '2024-09-15',
    trend: 'stable',
    state: 'Gujarat'
  },
  {
    crop: 'Sugarcane',
    centralMSP: 340,
    stateMSP: 380,
    season: '2024-25',
    lastUpdated: '2024-10-01',
    trend: 'up',
    state: 'Uttar Pradesh'
  }
];

const MSPSchemes = ({ currentLanguage }: MSPSchemesProps) => {
  const translations = {
    en: {
      title: 'Minimum Support Price (MSP)',
      description: 'Latest MSP rates for major crops - Central and State government support prices',
      centralMSP: 'Central MSP',
      stateMSP: 'State MSP',
      updated: 'Updated',
      viewCenters: 'View Purchase Centers',
      viewAll: 'View All MSP Rates',
      up: 'up',
      down: 'down',
      stable: 'stable'
    },
    hi: {
      title: 'न्यूनतम समर्थन मूल्य (MSP)',
      description: 'प्रमुख फसलों के लिए नवीनतम MSP दरें - केंद्र और राज्य सरकार समर्थन मूल्य',
      centralMSP: 'केंद्रीय MSP',
      stateMSP: 'राज्य MSP',
      updated: 'अपडेट किया गया',
      viewCenters: 'खरीद केंद्र देखें',
      viewAll: 'सभी MSP दरें देखें',
      up: 'वृद्धि',
      down: 'कमी',
      stable: 'स्थिर'
    },
    te: {
      title: 'కనీస మద్దతు ధర (MSP)',
      description: 'ప్రధాన పంటలకు తాజా MSP రేట్లు - కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ మద్దతు ధరలు',
      centralMSP: 'కేంద్ర MSP',
      stateMSP: 'రాష్ట్ర MSP',
      updated: 'నవీకరించబడింది',
      viewCenters: 'కొనుగోలు కేంద్రాలు చూడండి',
      viewAll: 'అన్ని MSP రేట్లు చూడండి',
      up: 'పెరుగుదల',
      down: 'తగ్గుదల',
      stable: 'స్థిరమైన'
    },
    ta: {
      title: 'குறைந்தபட்ச ஆதரவு விலை (MSP)',
      description: 'முக்கிய பயிர்களுக்கான சமீபத்திய MSP விலைகள் - மத்திய மற்றும் மாநில அரசு ஆதரவு விலைகள்',
      centralMSP: 'மத்திய MSP',
      stateMSP: 'மாநில MSP',
      updated: 'புதுப்பிக்கப்பட்டது',
      viewCenters: 'கொள்முதல் மையங்களைப் பார்க்கவும்',
      viewAll: 'அனைத்து MSP விலைகளையும் காண்க',
      up: 'அதிகரிப்பு',
      down: 'குறைவு',
      stable: 'நிலையான'
    },
    ml: {
      title: 'ഏറ്റവും കുറഞ്ഞ പിന്തുണ വില (MSP)',
      description: 'പ്രധാന വിളകൾക്കുള്ള ഏറ്റവും പുതിയ MSP നിരക്കുകൾ - കേന്ദ്ര-സംസ്ഥാന സർക്കാർ പിന്തുണ വിലകൾ',
      centralMSP: 'കേന്ദ്ര MSP',
      stateMSP: 'സംസ്ഥാന MSP',
      updated: 'അപ്ഡേറ്റ് ചെയ്തു',
      viewCenters: 'വാങ്ങൽ കേന്ദ്രങ്ങൾ കാണുക',
      viewAll: 'എല്ലാ MSP നിരക്കുകളും കാണുക',
      up: 'വർദ്ധനവ്',
      down: 'കുറവ്',
      stable: 'സ്ഥിരം'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  return (
    <div className="space-y-6 relative" id="schemes">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">{t.title}</h2>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {mockMSPData.map((msp, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{msp.crop}</CardTitle>
                <Badge variant={msp.trend === 'up' ? 'default' : msp.trend === 'down' ? 'destructive' : 'secondary'}>
                  <TrendingUp className={`w-3 h-3 mr-1 ${msp.trend === 'down' ? 'rotate-180' : ''}`} />
                  {t[msp.trend as keyof typeof t] || msp.trend}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {msp.state} • {msp.season}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-medium">{t.centralMSP}</span>
                    </div>
                    <span className="text-lg font-bold text-primary">₹{msp.centralMSP}/quintal</span>
                  </div>
                  
                  {msp.stateMSP && (
                    <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-secondary" />
                        <span className="font-medium">{t.stateMSP}</span>
                      </div>
                      <span className="text-lg font-bold text-secondary">₹{msp.stateMSP}/quintal</span>
                    </div>
                  )}
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t.updated}: {new Date(msp.lastUpdated).toLocaleDateString('en-IN')}
                </div>
              </div>

              <Button variant="outline" className="w-full">
                {t.viewCenters}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
          {t.viewAll}
        </Button>
      </div>
      
      {/* ChatBot Component */}
      <ChatBot currentLanguage={currentLanguage} />
    </div>
  );
};

export default MSPSchemes;