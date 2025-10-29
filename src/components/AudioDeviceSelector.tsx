import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Speaker } from "lucide-react";

interface AudioDeviceSelectorProps {
  onDeviceChange: (deviceId: string) => void;
}

const AudioDeviceSelector = ({ onDeviceChange }: AudioDeviceSelectorProps) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = allDevices.filter(
          device => device.kind === 'audiooutput' && device.deviceId !== ''
        );
        setDevices(audioOutputs);
        if (audioOutputs.length > 0 && !selectedDevice) {
          setSelectedDevice(audioOutputs[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting audio devices:', error);
      }
    };

    getDevices();
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    onDeviceChange(deviceId);
  };

  if (devices.length === 0 || !selectedDevice) return null;

  return (
    <Card className="shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-elevated)] transition-all">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Speaker className="h-5 w-5 text-primary" />
          </div>
          <Label className="text-base font-medium">Audio Output Device</Label>
        </div>
        <Select value={selectedDevice} onValueChange={handleDeviceChange}>
          <SelectTrigger className="h-11 bg-background">
            <SelectValue placeholder="Select audio device" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Device ${device.deviceId.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default AudioDeviceSelector;
