import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptItem {
  text: string;
  time: string;
  language: string;
}

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  "es-419": "🇲🇽"
};

const languageNames: Record<string, string> = {
  en: "English Translation",
  es: "Spanish Translation",
  "es-419": "Latin American Spanish Translation"
};

interface TranscriptDisplayProps {
  transcripts: TranscriptItem[];
}

const TranscriptDisplay = ({ transcripts }: TranscriptDisplayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [transcripts]);

  return (
    <Card className="shadow-md border-amber-100 bg-white/90">
      <CardContent className="p-6">
        <div className="h-[500px] overflow-y-auto pr-4" ref={scrollContainerRef}>
          {transcripts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-amber-600">
              <p className="text-lg">Waiting for translation...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {transcripts.map((item, index) => {
                  const flag = languageFlags[item.language] || "🌍";
                  const langName = languageNames[item.language] || "Translation";

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className="bg-white/90 shadow-md rounded-2xl p-4 border border-amber-100"
                    >
                      <div className="text-xs text-amber-600 font-semibold flex items-center gap-2">
                        <span>{item.time}</span>
                        <span>—</span>
                        <span>{flag} {langName}</span>
                      </div>
                      <div className="text-slate-800 text-lg font-serif mt-2 leading-relaxed border-t border-amber-200 pt-2">
                        {item.text}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptDisplay;
