export class AudioQueue {
  private queue: string[] = [];
  private isPlaying = false;
  private isMuted = false;
  private audioElement: HTMLAudioElement | null = null;
  private currentDeviceId: string | null = null;

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  setAudioDevice(deviceId: string) {
    this.currentDeviceId = deviceId;
    if (this.audioElement && 'setSinkId' in this.audioElement) {
      (this.audioElement as any).setSinkId(deviceId).catch((err: Error) => {
        console.error('Failed to set audio output device:', err);
      });
    }
  }

  async addToQueue(base64Audio: string) {
    this.queue.push(base64Audio);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const base64Audio = this.queue.shift()!;

    if (this.isMuted) {
      // Skip playback but continue processing queue
      this.playNext();
      return;
    }

    try {
      // Decode base64 to binary
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and play
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      this.audioElement = new Audio(url);
      
      // Set audio output device if available
      if (this.currentDeviceId && 'setSinkId' in this.audioElement) {
        await (this.audioElement as any).setSinkId(this.currentDeviceId);
      }

      this.audioElement.onended = () => {
        URL.revokeObjectURL(url);
        this.playNext();
      };

      this.audioElement.onerror = () => {
        console.error('Error playing audio');
        URL.revokeObjectURL(url);
        this.playNext();
      };

      await this.audioElement.play();
    } catch (error) {
      console.error('Error processing audio:', error);
      this.playNext();
    }
  }

  clear() {
    this.queue = [];
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    this.isPlaying = false;
  }
}
