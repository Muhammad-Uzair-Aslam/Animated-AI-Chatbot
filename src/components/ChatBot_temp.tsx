'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, PaperAirplaneIcon, UserCircleIcon} from '@heroicons/react/24/solid';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

interface Message {
  id: number;
  text: string;
  isAi: boolean;
  timestamp: string;
}

const dummyResponses = [
  "I understand your point. Could you elaborate further?",
  "That's an interesting perspective. Let me share my thoughts...",
  "I appreciate you sharing that. Here's what I think...",
  "Based on what you're saying, I would suggest...",
  "Let me process that for a moment and provide a thoughtful response...",
];

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}
const VoiceWaveAnimation = ({ intensity }: { intensity: number }) => {
  const waves = [0, 1, 2];
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {waves.map((wave) => (
        <motion.div
          key={wave}
          className="absolute rounded-full border border-indigo-400/50"
          style={{
            width: `${40 + wave * 20}px`,
            height: `${40 + wave * 20}px`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.5 - (wave * 0.15), 0],
            scale: [0.8, 1 + (wave * 0.15) + (intensity * 0.3)],
          }}
          transition={{
            duration: 1.5 + wave * 0.3,
            repeat: Infinity,
            repeatDelay: wave * 0.15,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};


const STATE_MACHINE = "State Machine 1";
const INPUT_NAME = "Listening";

const RiveAvatar = ({ isActive }: { isActive: boolean }) => {
  const { rive, RiveComponent } = useRive({
    src: '/ai_reactive_glow.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });
  const listeningInput = useStateMachineInput(rive, STATE_MACHINE, INPUT_NAME);

  useEffect(() => {
    if (listeningInput) {
      listeningInput.value = isActive;
    }
  }, [isActive, listeningInput]);

  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500/30 blur-xl"
        style={{ 
          width: '140px', 
          height: '140px',
          filter: isActive ? 'blur(15px)' : 'blur(0px)',
          opacity: isActive ? 0.6 : 0,
        }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        } : {
          scale: 1,
          opacity: 0,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <RiveComponent 
        style={{ 
          width: 140, 
          height: 140,
          filter: isActive ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))' : 'none',
        }} 
      />
    </div>
  );
};

const WaveRippleAnimation = ({ isActive = false }) => {
  const waves = [1, 2, 3, 4];
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Base glow shadow */}
      <motion.div
        className="absolute rounded-full bg-blue-500/20 blur-md"
        style={{ width: '45px', height: '45px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isActive ? {
          scale: [0, 1, 1.25, 1],
          opacity: [0, 0.3, 0.5, 0.3],
        } : {
          scale: 0,
          opacity: 0,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      />
      
      {/* Expanding wave rings */}
      {waves.map((wave) => (
        <motion.div
          key={wave}
          className="absolute rounded-full border-2"
          style={{
            width: `${30 + wave * 8}px`,
            height: `${30 + wave * 8}px`,
            borderColor: `rgb(59 130 246 / ${0.4 - wave * 0.08})`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive ? {
            scale: [0, 0.8, 1.2 + wave * 0.15, 1.5 + wave * 0.1],
            opacity: [0, 0.6 - wave * 0.1, 0.4 - wave * 0.08, 0],
          } : {
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 2.5 + wave * 0.3,
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: isActive ? wave * 0.2 : 0,
          }}
        />
      ))}
      
      {/* Inner pulsing glow */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-sm"
        style={{ width: '25px', height: '25px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isActive ? {
          scale: [0, 1, 1.08, 1],
          opacity: [0, 0.5, 0.8, 0.5],
        } : {
          scale: 0,
          opacity: 0,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      />
      
      {/* Outer expanding shadow */}
      <motion.div
        className="absolute rounded-full bg-blue-500/10 blur-lg"
        style={{ width: '45px', height: '45px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isActive ? {
          scale: [0, 1, 1.4, 1.8],
          opacity: [0, 0.2, 0.1, 0],
        } : {
          scale: 0,
          opacity: 0,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: [0.68, -0.55, 0.265, 1.55],
          delay: 0.5,
        }}
      />
    </div>
  );
};
const ProgressCircle = ({ progress }: { progress: number }) => {
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const outerCircumference = 2 * Math.PI * 23;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center select-none" style={{ background: 'transparent' }}>
      <motion.svg
        className="absolute"
        width={74} height={74} viewBox="0 0 74 74"
        style={{ zIndex: 6, background: 'transparent' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ opacity: { duration: 0.5, ease: "easeIn" } }}
      >
        <motion.circle
          cx="37"
          cy="37"
          r="30"
          stroke="#06b6d4"
          strokeWidth="6"
          fill="none"
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerCircumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: outerCircumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            strokeDashoffset: {
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        />
      </motion.svg>

   <div className="relative w-10 h-10 flex items-center justify-center mx-2 mb-3 mr-3">
                      <div className="relative z-10">
                        <RiveAvatar isActive={true} />
                      </div>
                    </div>
    </div>
  );
};
export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 👋 I'm your AI assistant. How can I help you today?",
      isAi: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const isMounted = useRef(false);

  const { rive, RiveComponent } = useRive({
    src: '/ai_reactive_glow.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });
  const listeningInput = useStateMachineInput(rive, STATE_MACHINE, INPUT_NAME);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cleanupAudioResources(true);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (listeningInput) {
      listeningInput.value = isRecording;
    }
  }, [isRecording, listeningInput]);

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedIntensity = Math.min(average / 128, 1);
    
    setVoiceIntensity(normalizedIntensity);
    
    if (isRecording && isMounted.current) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  const setupAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      analyzeAudio();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  const cleanupAudioResources = (shouldAbort = false, resetIntensity = true) => {
    try {
      recognitionRef.current?.[shouldAbort ? 'abort' : 'stop']?.();
      recognitionRef.current = null;

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;

      analyserRef.current?.disconnect();
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;

      audioContextRef.current?.close().catch(console.error);
      audioContextRef.current = null;

      analyserRef.current = null;
      setIsRecording(false);
      if (resetIntensity) setVoiceIntensity(0);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try using Chrome.');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      if (['not-allowed', 'audio-capture'].includes(event.error)) {
        alert('Microphone access denied or unavailable.');
        cleanupAudioResources(false);
      }
    };

    recognition.onend = () => {
      if (isRecording && isMounted.current) {
        try {
          recognition.start();
        } catch (e) {
          console.warn("Speech restart failed:", e);
        }
      } else {
        cleanupAudioResources(false);
      }
    };

    recognitionRef.current = recognition;
    return true;
  };

  const startListening = async () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert('Speech recognition is not supported. Try using Chrome.');
      return;
    }

    try {
      cleanupAudioResources(true);
      if (!initializeSpeechRecognition()) return;

      setInputText('');
      setIsRecording(true);
      recognitionRef.current?.start();
      await setupAudioAnalysis();
    } catch (error) {
      console.error('Error starting mic:', error);
      setIsRecording(false);
      cleanupAudioResources(false);
    }
  };

  const stopListening = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    cleanupAudioResources(false);
    if (inputText.trim()) {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setIsSending(true);
    setSendingProgress(0);

    const progressInterval = setInterval(() => {
      setSendingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now(),
        text: inputText,
        isAi: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setIsSending(false);
      setIsProcessing(false);
      setSendingProgress(0);
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now() + 1,
          text: dummyResponses[Math.floor(Math.random() * dummyResponses.length)],
          isAi: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 border-b border-gray-800">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          AI Assistant
        </h2>
        <p className="text-gray-400 text-sm mt-1">Online and ready to assist</p>
      </div>

      <div className="h-[500px] overflow-y-auto p-6 bg-gray-900 custom-scrollbar">
        <AnimatePresence>
          {messages.map((message, idx) => {
            const isLast = idx === messages.length - 1 && message.isAi;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.isAi ? 'justify-start' : 'justify-end'} mb-6`}
              >
                <div className={`flex ${message.isAi ? 'flex-row' : 'flex-row-reverse'} gap-3 items-start`}>
                  {message.isAi ? (
                    <div className="relative w-10 h-10 flex items-center justify-center mx-3 pt-2">
                      {isLast && isRecording && <WaveRippleAnimation isActive={true} />}
                      <div className="relative z-10">
                        <RiveAvatar isActive={isLast && isRecording} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center mx-3 pt-2">
                      <UserCircleIcon className="h-8 w-8 text-indigo-400" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className={`p-4 rounded-2xl ${message.isAi ? 'bg-gray-800 text-gray-100' : 'bg-indigo-600 text-white'} shadow-lg border border-gray-700 max-w-md`}>
                      {message.text}
                    </div>
                    <span className="text-xs text-gray-500 mt-2 px-2">{message.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-gray-400 text-sm"
          >
            <ProgressCircle progress={sendingProgress} />
            <span>AI is typing...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
   
      <div className="p-6 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-4 items-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {isRecording && <VoiceWaveAnimation intensity={voiceIntensity} />}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isRecording ? stopListening : startListening}
              className={`relative z-10 p-3 rounded-full transition-all duration-300 ${
                isRecording
                  ? 'bg-red-600 text-white'
                  : isTyping || isSending
                  ? 'bg-transparent'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              
                <MicrophoneIcon className={`h-6 w-6 ${isRecording ? 'text-white' : 'text-gray-300'}`} />
              
            </motion.button>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isRecording ? "Listening..." : "Type your message here..."}
              className="flex-1 p-4 bg-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-gray-400"
            />
            {!isTyping && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isSending}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  inputText.trim() && !isSending
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
