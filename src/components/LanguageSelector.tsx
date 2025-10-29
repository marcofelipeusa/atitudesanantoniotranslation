import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish (Spain)" },
  { code: "es-419", name: "Spanish (Latin America)" },
];

const LanguageSelector = ({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-elevated)] transition-all">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <Label className="text-base font-medium">Translation Language</Label>
          </div>
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="h-11 bg-primary text-primary-foreground border-primary hover:bg-primary/90">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {languages.map((lang) => (
                <SelectItem 
                  key={lang.code} 
                  value={lang.code}
                  className="focus:bg-primary focus:text-primary-foreground"
                >
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LanguageSelector;
