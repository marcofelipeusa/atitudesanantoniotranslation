import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Volume2, VolumeX } from "lucide-react";

interface MuteToggleProps {
  isMuted: boolean;
  onToggle: (muted: boolean) => void;
}

const MuteToggle = ({ isMuted, onToggle }: MuteToggleProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-elevated)] transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${isMuted ? "bg-muted" : "bg-primary"}`}>
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-5 w-5 text-primary-foreground" />
                )}
              </div>
              <Label className="text-base font-medium">Audio Output</Label>
            </div>
            <Switch
              checked={!isMuted}
              onCheckedChange={(checked) => onToggle(!checked)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {isMuted ? "Audio is muted" : "Audio is playing"}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MuteToggle;
