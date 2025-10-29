import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import MuteToggle from "@/components/MuteToggle";
import ConnectionStatus from "@/components/ConnectionStatus";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import AudioDeviceSelector from "@/components/AudioDeviceSelector";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { openTranslateSocket } from "@/utils/ws-audio-queue";
import { getBackendUrl } from "@/utils/api";
import churchLogo from "@/assets/church-logo.png";

interface TranscriptItem {
  text: string;
  time: string;
  language: string;
}

// Clean repeated words
const cleanRepeatedWords = (text: string): string => {
  return text.replace(/\b(\w+)( \1\b)+/gi, '$1').trim();
};

const Dashboard = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const wsClientRef = useRef<any>(null);
  const navigate = useNavigate();
  const backendBase = import.meta.env.VITE_BACKEND_URL || "https://noncritically-intercondyloid-lora.ngrok-free.dev";

  useEffect(() => {
    wsClientRef.current = openTranslateSocket(
      backendBase,
      null,
      selectedLanguage,
      (msg) => {
        const cleanedText = cleanRepeatedWords(msg.text);
        if (cleanedText) {
          setTranscripts((prev) => [
            ...prev,
            {
              text: cleanedText,
              time: msg.time,
              language: msg.lang,
            },
          ]);
        }
      },
      setIsConnected
    );

    return () => {
      wsClientRef.current?.close();
    };
  }, [backendBase, selectedLanguage]);

  useEffect(() => {
    if (wsClientRef.current) {
      setTranscripts([]);
      wsClientRef.current.changeLang(selectedLanguage);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (wsClientRef.current) {
      wsClientRef.current.setMute(isMuted);
    }
  }, [isMuted]);

  const handleAudioDeviceChange = (deviceId: string) => {
    console.log('Audio device changed:', deviceId);
  };

  const handleLogout = () => {
    // Stop all audio and close WebSocket
    wsClientRef.current?.close();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Church Logo */}
      <div className="h-12 w-12 absolute top-4 left-4 z-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
        <img 
          src={churchLogo} 
          alt="Church Logo" 
          className="h-10 w-10 object-contain"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6 max-w-6xl pt-24"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-semibold text-slate-800"
          >
            Live Translation
          </motion.h1>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 right-4"
          >
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 transition-all hover:shadow-md"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </motion.div>
        </div>

        {/* Control Panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
          <MuteToggle isMuted={isMuted} onToggle={setIsMuted} />
          <ConnectionStatus isConnected={isConnected} />
          <AudioDeviceSelector onDeviceChange={handleAudioDeviceChange} />
        </motion.div>

        {/* Transcript Display */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <TranscriptDisplay transcripts={transcripts} />
        </motion.div>

        {/* Footer */}
        <Footer />
      </motion.div>
    </div>
  );
};

export default Dashboard;
