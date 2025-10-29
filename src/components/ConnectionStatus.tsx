import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus = ({ isConnected }: ConnectionStatusProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-elevated)] transition-all">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg transition-colors ${isConnected ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}>
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-600 dark:text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600 dark:text-red-500" />
              )}
            </div>
            <Label className="text-base font-medium">Connection Status</Label>
          </div>
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="font-medium"
          >
            {isConnected ? "Connected ✅" : "Waiting for backend..."}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConnectionStatus;
