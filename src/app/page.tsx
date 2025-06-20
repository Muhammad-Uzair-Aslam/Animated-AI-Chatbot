import ChatBot from '../components/ChatBot';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            AI Chat Assistant
          </h1>
          <p className="text-lg text-gray-400">
            Your intelligent companion for meaningful conversations
          </p>
        </div>
        <ChatBot />
      </div>
    </main>
  );
}
// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
// import { Mic, MicOff, Volume2 } from "lucide-react";
// import { motion } from "framer-motion";

// const STATE_MACHINE = "State Machine 1";
// const INPUT_NAME = "Listening";

// export default function ChatBotWithVoice() {
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "Hello! I'm your AI assistant. Click the microphone to start speaking.", timestamp: new Date() }
//   ]);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [audioLevel, setAudioLevel] = useState(0);
//   const recognitionRef = useRef<any>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
//   const animationRef = useRef<number | undefined>(undefined);

//   const { rive, RiveComponent } = useRive({
//     src: "/ai_reactive_glow.riv",
//     stateMachines: STATE_MACHINE,
//     autoplay: true,
//   });

//   const listeningInput = useStateMachineInput(rive, STATE_MACHINE, INPUT_NAME);

//   const setupAudioVisualization = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
//       analyserRef.current = audioContextRef.current.createAnalyser();
//       microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
//       analyserRef.current.fftSize = 256;
//       microphoneRef.current.connect(analyserRef.current);
//       return stream;
//     } catch (error) {
//       console.error("Error accessing microphone:", error);
//       return null;
//     }
//   };

//   const getAudioLevel = () => {
//     if (!analyserRef.current) return 0;
//     const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
//     analyserRef.current.getByteFrequencyData(dataArray);
//     const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
//     return Math.min(average / 128, 1);
//   };

//   const animateAudioLevel = () => {
//     if (isRecording) {
//       const level = getAudioLevel();
//       setAudioLevel(level);
//       animationRef.current = requestAnimationFrame(animateAudioLevel);
//     }
//   };

//   const startListening = async () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Speech Recognition not supported in this browser");
//       return;
//     }

//     const stream = await setupAudioVisualization();
//     if (!stream) return;

//     const recognition = new SpeechRecognition();
//     recognition.lang = "en-US";
//     recognition.interimResults = false;
//     recognition.maxAlternatives = 1;
//     recognition.continuous = false;

//     recognition.onstart = () => {
//       setIsRecording(true);
//       if (listeningInput) listeningInput.value = true;
//       animateAudioLevel();
//     };

//     recognition.onresult = (event: any) => {
//       const transcript = event.results[0][0].transcript;
//       setMessages(prev => [...prev, { sender: "user", text: transcript, timestamp: new Date() }]);
//       setIsProcessing(true);

//       setTimeout(() => {
//         const responses = [
//           "That's interesting! Can you tell me more about that?",
//           "I understand. How can I help you with that?",
//           "Thanks for sharing that with me. What would you like to know?",
//           "I see. Is there anything specific you'd like assistance with?",
//           "Got it! Let me help you with that."
//         ];
//         const randomResponse = responses[Math.floor(Math.random() * responses.length)];
//         setMessages(prev => [...prev, { sender: "bot", text: randomResponse, timestamp: new Date() }]);
//         setIsProcessing(false);
//       }, 1500);
//     };

//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error:", event.error);
//       setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I didn't catch that. Please try again.", timestamp: new Date() }]);
//       setIsProcessing(false);
//     };

//     recognition.onend = () => {
//       setIsRecording(false);
//       setAudioLevel(0);
//       if (listeningInput) listeningInput.value = false;
//       if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       if (audioContextRef.current) audioContextRef.current.close();
//     };

//     recognition.start();
//     recognitionRef.current = recognition;
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) recognitionRef.current.stop();
//   };

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   useEffect(() => {
//     return () => {
//       if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       if (audioContextRef.current) audioContextRef.current.close();
//     };
//   }, []);

//   return (
//     <div className="w-full max-w-lg mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
//             <Volume2 className="w-5 h-5" />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold">AI Voice Assistant</h2>
//             <p className="text-blue-100 text-sm">Speak naturally, I'm listening</p>
//           </div>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700">
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
//             <div className={`max-w-xs lg:max-w-md ${msg.sender === "user" ? "order-2" : "order-1"}`}>
//               <div
//                 className={`px-4 py-3 rounded-2xl ${
//                   msg.sender === "user"
//                     ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
//                     : "bg-gray-800 text-gray-100 border border-gray-700"
//                 }`}
//               >
//                 <p className="text-sm leading-relaxed">{msg.text}</p>
//                 <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
//                   {formatTime(msg.timestamp)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}

//         {isProcessing && (
//           <div className="flex justify-start">
//             <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl">
//               <div className="flex items-center space-x-2">
//                 <div className="flex space-x-1">
//                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
//                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                 </div>
//                 <span className="text-xs text-gray-400">AI is thinking...</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Voice Interface */}
//       {/* Voice Interface */}
// <div className="p-6 bg-gray-850 border-t border-gray-700">
//   <div className="flex flex-col items-center space-y-4">
    
//     {/* Rive Animation with Waves */}
//     <div className="relative w-36 h-36 flex items-center justify-center">
//       {/* Glowing waves around Rive circle */}
//       {isRecording && (
//         <motion.div
//           className="absolute w-full h-full rounded-full"
//           initial={{ scale: 1, opacity: 0.5 }}
//           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
//           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
//           style={{
//             boxShadow: "0 0 32px 12px rgba(59,130,246,0.3)",
//             zIndex: 1,
//           }}
//         />
//       )}

//       {/* Rive animation */}
//       <div
//         className={`relative transition-all duration-300 z-10 ${
//           isRecording ? "scale-110" : "scale-100"
//         }`}
//         style={{
//           filter: isRecording
//             ? `drop-shadow(0 0 ${20 + audioLevel * 30}px rgba(59, 130, 246, 0.8))`
//             : "none",
//         }}
//       >
//         <RiveComponent style={{ width: 140, height: 140 }} />
//       </div>
//     </div>

//     {/* Voice Button */}
//     <button
//       onClick={isRecording ? stopListening : startListening}
//       disabled={isProcessing}
//       className={`relative px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg ${
//         isRecording
//           ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25"
//           : isProcessing
//           ? "bg-gray-600 text-gray-300 cursor-not-allowed"
//           : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/25"
//       } transform hover:scale-105 active:scale-95`}
//     >
//       <div className="flex items-center space-x-3">
//         {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
//         <span>
//           {isRecording ? "Stop Recording" : isProcessing ? "Processing..." : "Start Speaking"}
//         </span>
//       </div>
//     </button>

//     {/* Status Indicator */}
//     <div
//       className={`text-sm font-medium transition-all duration-300 ${
//         isRecording
//           ? "text-red-400"
//           : isProcessing
//           ? "text-yellow-400"
//           : "text-gray-400"
//       }`}
//     >
//       {isRecording
//         ? "🔴 Listening... Speak now"
//         : isProcessing
//         ? "⏳ Processing your message..."
//         : "💬 Ready to listen"}
//     </div>
//   </div>
// </div>

//     </div>
//   );
// }
