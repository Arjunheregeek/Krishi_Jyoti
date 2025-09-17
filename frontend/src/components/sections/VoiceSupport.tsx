import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Phone, MessageSquare, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VOICE_WS_URL = (import.meta as any)?.env?.VITE_VOICE_WS_URL || 'ws://127.0.0.1:8000/ws/voice';

interface VoiceSupportProps {
  currentLanguage: string;
}

interface VoiceQuery {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  language: string;
  category: 'farming' | 'weather' | 'scheme' | 'disease' | 'general';
}

const mockQueries: VoiceQuery[] = [
  {
    id: '1',
    query: 'मेरी गेहूं की फसल में पत्ते पीले हो रहे हैं, क्या करूं?',
    response: 'पत्तों का पीला होना नाइट्रोजन की कमी या अतिरिक्त पानी का संकेत हो सकता है। तुरंत यूरिया का छिड़काव करें और पानी की मात्रा कम करें।',
    timestamp: new Date(),
    language: 'hindi',
    category: 'disease'
  },
  {
    id: '2', 
    query: 'What is the current MSP for rice?',
    response: 'The current MSP for common rice is ₹2,300 per quintal for Kharif 2024. You can sell your produce at the nearest procurement center.',
    timestamp: new Date(Date.now() - 3600000),
    language: 'english',
    category: 'scheme'
  }
];

const VoiceSupport = ({ currentLanguage }: VoiceSupportProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [voiceQueries, setVoiceQueries] = useState<VoiceQuery[]>(mockQueries);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || 'hindi');
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const { toast } = useToast();

  // Function to play audio data received from Deepgram
  const playAudioData = (audioData: Uint8Array) => {
    try {
      console.log('Received audio data length:', audioData.length);
      
      // Create audio context for playback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Deepgram Agent typically outputs PCM16 at 24kHz
      const sampleRate = 24000;
      
      // Convert Uint8Array to Int16Array (PCM16)
      const pcmData = new Int16Array(audioData.buffer);
      console.log('PCM data length:', pcmData.length);
      
      if (pcmData.length === 0) {
        console.warn('Empty audio data received');
        return;
      }
      
      // Convert PCM16 to Float32Array for Web Audio API
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768.0; // Convert to [-1, 1] range
      }

      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, floatData.length, sampleRate);
      audioBuffer.copyToChannel(floatData, 0);

      // Create source and play
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        console.log('Audio playback finished');
      };
      
      console.log('Starting audio playback...');
      source.start();

    } catch (error) {
      console.error('Error playing audio data:', error);
      
      // Fallback to browser TTS if audio playback fails
      if (aiResponse) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
        speechSynthesis.speak(utterance);
      }
    }
  };

  const translations = {
    en: {
      title: 'Voice Support System',
      description: 'Get farming advice in your local language through voice interaction',
      voiceAssistant: 'Voice Assistant',
      assistantDescription: 'Ask questions about farming, weather, schemes, or diseases in Hindi, English, or regional languages',
      recording: 'Recording...',
      stopRecordingTap: 'Tap to stop recording',
      readyToHelp: 'Ready to Help',
      startVoiceQueryTap: 'Tap to start voice query',
      stopRecordingBtn: 'Stop Recording',
      startVoiceQueryBtn: 'Start Voice Query',
      supportedLanguages: 'Supported Languages',
      callExpert: 'Call Expert',
      textChat: 'Text Chat',
      recentQueries: 'Recent Queries',
      interactionHistory: 'Your voice interactions and responses',
      stopAudio: 'Stop Audio',
      playAudio: 'Play Audio',
      stop: 'Stop',
      share: 'Share',
      noQueries: 'No voice queries yet',
      startAsking: 'Start by asking a farming question'
    },
    hi: {
      title: 'आवाज़ सहायता प्रणाली',
      description: 'आवाज़ इंटरेक्शन के माध्यम से अपनी स्थानीय भाषा में कृषि सलाह प्राप्त करें',
      voiceAssistant: 'आवाज़ सहायक',
      assistantDescription: 'हिंदी, अंग्रेजी या क्षेत्रीय भाषाओं में कृषि, मौसम, योजनाओं या बीमारियों के बारे में प्रश्न पूछें',
      recording: 'रिकॉर्डिंग...',
      stopRecordingTap: 'रिकॉर्डिंग रोकने के लिए टैप करें',
      readyToHelp: 'मदद के लिए तैयार',
      startVoiceQueryTap: 'आवाज़ प्रश्न शुरू करने के लिए टैप करें',
      stopRecordingBtn: 'रिकॉर्डिंग रोकें',
      startVoiceQueryBtn: 'आवाज़ प्रश्न शुरू करें',
      supportedLanguages: 'समर्थित भाषाएं',
      callExpert: 'विशेषज्ञ को कॉल करें',
      textChat: 'टेक्स्ट चैट',
      recentQueries: 'हाल की पूछताछ',
      interactionHistory: 'आपकी आवाज़ इंटरेक्शन और जवाब',
      stopAudio: 'ऑडियो रोकें',
      playAudio: 'ऑडियो चलाएं',
      stop: 'रोकें',
      share: 'साझा करें',
      noQueries: 'अभी तक कोई आवाज़ प्रश्न नहीं',
      startAsking: 'कृषि प्रश्न पूछकर शुरू करें'
    },
    te: {
      title: 'వాయిస్ మద్దతు వ్యవస్థ',
      description: 'వాయిస్ ఇంటరాక్షన్ ద్వారా మీ స్థానిక భాషలో వ్యవసాయ సలహా పొందండి',
      voiceAssistant: 'వాయిస్ అసిస్టెంట్',
      assistantDescription: 'తెలుగు, హిందీ, ఇంగ్లీష్ మరియు ప్రాంతీయ భాషలలో వ్యవసాయం, వాతావరణం, పథకాలు లేదా వ్యాధుల గురించి ప్రశ్నలు అడగండి',
      recording: 'రికార్డింగ్...',
      stopRecordingTap: 'రికార్డింగ్ ఆపడానికి టాప్ చేయండి',
      readyToHelp: 'సహాయానికి సిద్ధం',
      startVoiceQueryTap: 'వాయిస్ ప్రశ్న ప్రారంభించడానికి టాప్ చేయండి',
      stopRecordingBtn: 'రికార్డింగ్ ఆపండి',
      startVoiceQueryBtn: 'వాయిస్ ప్రశ్న ప్రారంభించండి',
      supportedLanguages: 'మద్దతు ఉన్న భాషలు',
      callExpert: 'నిపుణుడికి కాల్ చేయండి',
      textChat: 'టెక్స్ట్ చాట్',
      recentQueries: 'ఇటీవలి ప్రశ్నలు',
      interactionHistory: 'మీ వాయిస్ ఇంటరాక్షన్‌లు మరియు ప్రతిస్పందనలు',
      stopAudio: 'ఆడియో ఆపండి',
      playAudio: 'ఆడియో ప్లే చేయండి',
      stop: 'ఆపండి',
      share: 'షేర్ చేయండి',
      noQueries: 'ఇంకా వాయిస్ ప్రశ్నలు లేవు',
      startAsking: 'వ్యవసాయ ప్రశ్న అడిగి ప్రారంభించండి'
    },
    ta: {
      title: 'குரல் ஆதரவு அமைப்பு',
      description: 'குரல் தொடர்பு மூலம் உங்கள் உள்ளூர் மொழியில் விவசாய ஆலோசனை பெறுங்கள்',
      voiceAssistant: 'குரல் உதவியாளர்',
      assistantDescription: 'தமிழ், இந்தி, ஆங்கிலம் மற்றும் பிராந்திய மொழிகளில் விவசாயம், வானிலை, திட்டங்கள் அல்லது நோய்கள் பற்றி கேள்விகள் கேளுங்கள்',
      recording: 'பதிவு செய்கிறது...',
      stopRecordingTap: 'பதிவு நிறுத்த தட்டவும்',
      readyToHelp: 'உதவிக்கு தயார்',
      startVoiceQueryTap: 'குரல் கேள்வி தொடங்க தட்டவும்',
      stopRecordingBtn: 'பதிவு நிறுத்து',
      startVoiceQueryBtn: 'குரல் கேள்வி தொடங்கு',
      supportedLanguages: 'ஆதரிக்கப்படும் மொழிகள்',
      callExpert: 'நிபுணரை அழைக்கவும்',
      textChat: 'உரை அரட்டை',
      recentQueries: 'சமீபத்திய கேள்விகள்',
      interactionHistory: 'உங்கள் குரல் தொடர்புகள் மற்றும் பதில்கள்',
      stopAudio: 'ஆடியோ நிறுத்து',
      playAudio: 'ஆடியோ இயக்கு',
      stop: 'நிறுத்து',
      share: 'பகிர்',
      noQueries: 'இன்னும் குரல் கேள்விகள் இல்லை',
      startAsking: 'விவசாய கேள்வி கேட்டு தொடங்குங்கள்'
    },
    ml: {
      title: 'വോയ്‌സ് സപ്പോർട്ട് സിസ്റ്റം',
      description: 'വോയ്‌സ് ഇന്ററാക്ഷൻ വഴി നിങ്ങളുടെ പ്രാദേശിക ഭാഷയിൽ കൃഷി ഉപദേശം നേടുക',
      voiceAssistant: 'വോയ്‌സ് അസിസ്റ്റന്റ്',
      assistantDescription: 'മലയാളം, ഹിന്ദി, ഇംഗ്ലീഷ്, പ്രാദേശിക ഭാഷകളിൽ കൃഷി, കാലാവസ്ഥ, പദ്ധതികൾ, രോഗങ്ങൾ എന്നിവയെക്കുറിച്ച് ചോദ്യങ്ങൾ ചോദിക്കുക',
      recording: 'റെക്കോർഡിംഗ്...',
      stopRecordingTap: 'റെക്കോർഡിംഗ് നിർത്താൻ ടാപ്പ് ചെയ്യുക',
      readyToHelp: 'സഹായത്തിന് തയ്യാറാണ്',
      startVoiceQueryTap: 'വോയ്‌സ് ചോദ്യം ആരംഭിക്കാൻ ടാപ്പ് ചെയ്യുക',
      stopRecordingBtn: 'റെക്കോർഡിംഗ് നിർത്തുക',
      startVoiceQueryBtn: 'വോയ്‌സ് ചോദ്യം ആരംഭിക്കുക',
      supportedLanguages: 'പിന്തുണയുള്ള ഭാഷകൾ',
      callExpert: 'വിദഗ്ധനെ വിളിക്കുക',
      textChat: 'ടെക്സ്റ്റ് ചാറ്റ്',
      recentQueries: 'സമീപകാല ചോദ്യങ്ങൾ',
      interactionHistory: 'നിങ്ങളുടെ വോയ്‌സ് ഇന്ററാക്ഷനുകളും പ്രതികരണങ്ങളും',
      stopAudio: 'ഓഡിയോ നിർത്തുക',
      playAudio: 'ഓഡിയോ പ്ലേ ചെയ്യുക',
      stop: 'നിർത്തുക',
      share: 'പങ്കിടുക',
      noQueries: 'ഇതുവരെ വോയ്‌സ് ചോദ്യങ്ങളില്ല',
      startAsking: 'ഒരു കൃഷി ചോദ്യം ചോദിച്ച് ആരംഭിക്കുക'
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const handleStartRecording = async () => {
    setIsRecording(true);
    setCurrentQuery('');
    setAiResponse('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      audioContextRef.current = audioContext;

      const ws = new WebSocket(VOICE_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data);
        
        if (data.type === 'partial_transcript') {
          setCurrentQuery(data.text);
        } else if (data.type === 'agent_response') {
          setAiResponse(data.text);
          // Don't auto-play browser TTS here as we'll receive agent_audio
        } else if (data.type === 'agent_audio') {
          // Play the audio data received from Deepgram
          try {
            console.log('Received agent audio data:', data.audio_data.length);
            const audioArray = new Uint8Array(data.audio_data);
            playAudioData(audioArray);
          } catch (error) {
            console.error('Error playing audio:', error);
            
            // Fallback to browser TTS if agent audio fails
            if (aiResponse) {
              const utterance = new SpeechSynthesisUtterance(aiResponse);
              utterance.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
              speechSynthesis.speak(utterance);
            }
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        setIsRecording(false);
      };

      const source = audioContext.createMediaStreamSource(stream);
      
      // Create audio worklet processor
      const audioWorkletCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input && input.length > 0) {
              const inputData = input[0];
              
              // Convert float32 to int16 PCM
              const pcm16Data = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
              }
              
              // Send to main thread
              this.port.postMessage(pcm16Data.buffer);
            }
            return true;
          }
        }
        
        registerProcessor('audio-processor', AudioProcessor);
      `;

      // Create blob URL for the worklet
      const blob = new Blob([audioWorkletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);

      try {
        await audioContext.audioWorklet.addModule(workletUrl);
        
        const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
        workletNodeRef.current = workletNode;

        // Handle messages from the worklet
        workletNode.port.onmessage = (event) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };

        source.connect(workletNode);
        workletNode.connect(audioContext.destination);

        // Clean up blob URL
        URL.revokeObjectURL(workletUrl);
        
      } catch (workletError) {
        console.warn('AudioWorklet not supported, falling back to ScriptProcessorNode:', workletError);
        
        // Fallback to ScriptProcessorNode for older browsers
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (event) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = event.inputBuffer.getChannelData(0);
            
            // Convert float32 to int16 PCM
            const pcm16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcm16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
            }
            
            // Send binary audio data
            ws.send(pcm16Data.buffer);
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
        
        // Store processor reference for cleanup
        workletNodeRef.current = processor as any;
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      toast({
        title: "Microphone Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);

    // Clean up audio processing
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const handlePlayResponse = (query: VoiceQuery) => {
    // Stop any currently playing audio
    if (isPlaying) {
      handleStopAudio();
      return;
    }

    setIsPlaying(true);
    setCurrentPlayingId(query.id);
    
    // Use Web Speech API for text-to-speech if available
    if ('speechSynthesis' in window) {
      // Cancel any existing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(query.response);
      utterance.lang = query.language === 'hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        speechSynthesisRef.current = null;
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        speechSynthesisRef.current = null;
        toast({
          title: "Audio Error",
          description: "Failed to play audio response",
          variant: "destructive"
        });
      };
      
      speechSynthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      // Fallback simulation
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      }, 3000);
    }
    
    toast({
      title: "Playing Response",
      description: `Playing in ${query.language}`,
    });
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentPlayingId(null);
    speechSynthesisRef.current = null;
    
    toast({
      title: "Audio Stopped",
      description: "Voice playback has been stopped",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'farming': return 'bg-primary/10 text-primary';
      case 'weather': return 'bg-accent/10 text-accent';
      case 'scheme': return 'bg-secondary/10 text-secondary';
      case 'disease': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6" id="support">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">{t.title}</h2>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Input Section */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              {t.voiceAssistant}
            </CardTitle>
            <CardDescription>
              {t.assistantDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Interface */}
            <div className="text-center space-y-4">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-destructive/20 border-4 border-destructive animate-pulse' 
                  : 'bg-primary/20 border-4 border-primary hover:bg-primary/30'
              }`}>
                {isRecording ? (
                  <MicOff className="w-8 h-8 text-destructive" />
                ) : (
                  <Mic className="w-8 h-8 text-primary" />
                )}
              </div>
              
              <div className="space-y-2">
                {isRecording ? (
                  <>
                    <p className="text-lg font-medium text-destructive">{t.recording}</p>
                    <p className="text-sm text-muted-foreground">{t.stopRecordingTap}</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium">{t.readyToHelp}</p>
                    <p className="text-sm text-muted-foreground">{t.startVoiceQueryTap}</p>
                  </>
                )}
              </div>

              <Button
                size="lg"
                variant={isRecording ? "destructive" : "hero"}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    {t.stopRecordingBtn}
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    {t.startVoiceQueryBtn}
                  </>
                )}
              </Button>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <h4 className="font-medium">{t.supportedLanguages}</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'hindi', name: 'हिन्दी', flag: '🇮🇳' },
                  { code: 'english', name: 'English', flag: '🇬🇧' },
                  { code: 'punjabi', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
                  { code: 'telugu', name: 'తెలుగు', flag: '🇮🇳' },
                  { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
                ].map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    {lang.flag} {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                {t.callExpert}
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                {t.textChat}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Query History */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              {t.recentQueries}
            </CardTitle>
            <CardDescription>
              {t.interactionHistory}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {voiceQueries.length > 0 ? (
              voiceQueries.map((query) => (
                <div key={query.id} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(query.category)} variant="secondary">
                          {query.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {query.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{query.query}</p>
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 p-3 rounded border-l-4 border-primary">
                    <p className="text-sm">{query.response}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePlayResponse(query)}
                    >
                      {isPlaying && currentPlayingId === query.id ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          {t.stopAudio}
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 mr-1" />
                          {t.playAudio}
                        </>
                      )}
                    </Button>
                    {isPlaying && currentPlayingId === query.id && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleStopAudio}
                      >
                        <VolumeX className="w-3 h-3 mr-1" />
                        {t.stop}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      {t.share}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t.noQueries}</p>
                <p className="text-sm mt-1">{t.startAsking}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceSupport;

