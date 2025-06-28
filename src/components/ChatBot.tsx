'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/solid';
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

const STATE_MACHINE = "State Machine 1";
const INPUT_NAME = "voice start"; 

const RiveAvatar = ({ isRecording }: { isRecording: boolean }) => {
  const { rive, RiveComponent } = useRive({
    src: '/ai_reactive_glow.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const listeningInput = useStateMachineInput(rive, STATE_MACHINE, INPUT_NAME);

  useEffect(() => {
    if (listeningInput) {
      listeningInput.value = isRecording;
      console.log('RiveAvatar - Listening Input:', listeningInput.value);
    }
  }, [isRecording, listeningInput]);

  useEffect(() => {
    return () => {
      if (rive) {
        rive.stop();
        console.log('RiveAvatar - Rive stopped');
      }
    };
  }, [rive]);

  return (
    <div className="relative w-[140px] h-[140px]">
      <div className="relative z-10">
        <RiveComponent
          style={{
            width: '140px',
            height: '140px',
          }}
        />
      </div>
    </div>
  );
};

const RiveAvatarVoice = ({ isRecording, showGlow }: { isRecording: boolean, showGlow: boolean }) => {
  const { rive, RiveComponent } = useRive({
    src: '/trailmate_voice_final2.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const startVoiceInput = useStateMachineInput(rive, STATE_MACHINE, 'start voice ');
  const voiceControlInput = useStateMachineInput(rive, STATE_MACHINE, 'voice control');
  const glowInput = useStateMachineInput(rive, STATE_MACHINE, 'glow');
  const glowRotateInput = useStateMachineInput(rive, STATE_MACHINE, 'glow rotate');

  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    
    if (isRecording) {
      if (startVoiceInput && !hasTriggeredRef.current) {
        startVoiceInput.value = true;
        hasTriggeredRef.current = true;
        console.log('RiveAvatarVoice - start voice set to:', startVoiceInput.value);
      }
      if (voiceControlInput) {
        voiceControlInput.value = 20;
        console.log('RiveAvatarVoice - voice control set to:', voiceControlInput.value);
      }
      if (glowInput) {
        glowInput.value = false;
      }
      if (glowRotateInput) {
        glowRotateInput.value = false;
      }

    } else {
      if (startVoiceInput) {
        startVoiceInput.value = false;
      }
      if (voiceControlInput) {
        voiceControlInput.value = 0;
      }
      if (glowInput) {
        glowInput.value = showGlow;
        console.log('RiveAvatarVoice - glow set to:', glowInput.value);
      }
      if (glowRotateInput) {
        glowRotateInput.value = showGlow;
        console.log('RiveAvatarVoice - glow rotate set to:', glowRotateInput.value);
      }
      hasTriggeredRef.current = false;
    }
  }, [isRecording, showGlow, startVoiceInput, voiceControlInput, glowInput, glowRotateInput, rive]);

  useEffect(() => {
    if (rive && rive.stateMachineInputs) {
      const inputs = rive.stateMachineInputs(STATE_MACHINE) || [];
      console.log(
        '🧪 Available Inputs:',
        inputs.map((input) => input.name)
      );
    }
  }, [rive]);

  useEffect(() => {
    return () => {
      if (rive) {
        rive.stop();
        console.log('RiveAvatarVoice - rive stopped');
      }
    };
  }, [rive]);

  return (
    <div className="relative w-[140px] h-[140px]">
      <div className="relative z-10">
        <RiveComponent
          style={{
            width: '140px',
            height: '140px',
          }}
        />
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
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const isMounted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    isMounted.current = true;
    scrollToBottom();
    console.log('ChatBot - Component mounted');
    return () => {
      isMounted.current = false;
      cleanupAudioResources(true);
      console.log('ChatBot - Component unmounted');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
    console.log('ChatBot - Messages updated, isRecording:', isRecording);
  }, [messages, isRecording]);

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
      console.log('ChatBot - Audio analysis setup completed');
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  const cleanupAudioResources = (shouldAbort = false, resetIntensity = true) => {
    try {
      recognitionRef.current?.[shouldAbort ? 'abort' : 'stop']?.();
      recognitionRef.current = null;
      console.log('ChatBot - Speech recognition stopped/aborted');

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
      console.log('ChatBot - Audio resources cleaned up');
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
      console.log('ChatBot - Speech recognized:', transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      if (['not-allowed', 'audio-capture'].includes(event.error)) {
        alert('Microphone access denied or unavailable.');
        cleanupAudioResources(false);
      } else if (event.error === 'no-speech') {
        console.log('ChatBot - No speech detected, keeping recording active');
      }
    };

    recognition.onend = () => {
      if (isRecording && isMounted.current) {
        try {
          recognition.start();
          console.log('ChatBot - Speech recognition restarted');
        } catch (e) {
          console.warn("Speech restart failed:", e);
        }
      } else {
        cleanupAudioResources(false);
        console.log('ChatBot - Speech recognition ended');
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
      console.log('ChatBot - Starting listening');
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
    console.log('ChatBot - Stopping listening');
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

    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now(),
        text: inputText,
        isAi: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputText('');
      setIsSending(false);
      setIsProcessing(false);
      setIsTyping(true);
      setShowGlow(true);

      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now() + 1,
          text: dummyResponses[Math.floor(Math.random() * dummyResponses.length)],
          isAi: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
        setShowGlow(false);
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
          {messages.map((message) => (
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
                    <div className="relative z-10">
                      {isRecording ? (
                        <RiveAvatarVoice isRecording={isRecording} showGlow={false} />
                      ) : showGlow && isTyping ? (
                        <RiveAvatarVoice isRecording={false} showGlow={true} />
                      ) : (
                        <RiveAvatar isRecording={false} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center mx-3 pt-2">
                    <UserCircleIcon className="h-8 w-8 text-indigo-400" />
                  </div>
                )}
                <div className="flex flex-col">
                  <div
                    className={`p-4 rounded-2xl ${
                      message.isAi ? 'bg-gray-800 text-gray-100' : 'bg-indigo-600 text-white'
                    } shadow-lg border border-gray-700 max-w-md`}
                  >
                    {message.text}
                  </div>
                  <span className="text-xs text-gray-500 mt-2 px-2">{message.timestamp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-4 items-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isRecording ? stopListening : startListening}
              className={`relative z-10 p-3 rounded-full transition-all duration-300 ${
                isRecording
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
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
              placeholder={isRecording ? 'Listening...' : 'Type your message here...'}
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