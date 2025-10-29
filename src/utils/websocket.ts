export interface WebSocketMessage {
  text: string;
  audio_b64?: string;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private shouldReconnect = true;
  private manualDisconnect = false; // Flag to distinguish manual logout from automatic disconnection
  private currentLang: string;
  private backendUrl: string;
  private onMessageCallback: (message: WebSocketMessage) => void;
  private onConnectionChange: (connected: boolean) => void;
  private lastMessage: string | null = null;


  constructor(
    backendUrl: string,
    lang: string,
    onMessage: (message: WebSocketMessage) => void,
    onConnectionChange: (connected: boolean) => void
  ) {
    this.backendUrl = backendUrl;
    this.currentLang = lang;
    this.onMessageCallback = onMessage;
    this.onConnectionChange = onConnectionChange;
  }

  connect() {
    // Evita conectar se já há uma conexão ativa (React StrictMode-safe)
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      console.log("⚠️ WS já ativo, ignorando conexão duplicada");
      return;
    }

    this.manualDisconnect = false; // reset flag sempre que conectar

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const wsUrl = this.backendUrl.replace(/^http/, 'ws') + `/ws/translate?lang=${this.currentLang}`;
    console.log('Connecting to WebSocket:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected with language:', this.currentLang);
      this.onConnectionChange(true);
      
      // Start heartbeat to keep connection alive
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
  try {
    const message: WebSocketMessage = JSON.parse(event.data);

    // 🔎 Ignorar mensagens parciais ou curtas demais
    if (!message.text || message.text.trim().length < 3) return;

    // 🔎 Ignorar duplicatas de texto muito similares
    if (this.lastMessage && message.text.trim() === this.lastMessage.trim()) return;
    this.lastMessage = message.text.trim();

    // 🔊 Tocar apenas se áudio estiver presente e for o final
    if (message.audio_b64) {
      import("@/utils/ws-audio-queue").then(mod => mod.enqueueAudioMessage(message));
    }

    // ✅ Enviar texto limpo para o front
    this.onMessageCallback(message);

  } catch (error) {
    console.error("Erro ao processar mensagem WS:", error);
  }
};

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onConnectionChange(false);
    };

    this.ws.onclose = () => {
      console.log(this.manualDisconnect ? "🛑 WS fechado manualmente" : "⚠️ WS desconectado automaticamente");
      this.onConnectionChange(false);
      this.stopHeartbeat();

      if (!this.manualDisconnect) {
        console.log("🔁 Reconectando em 2s...");
        this.reconnectTimer = window.setTimeout(() => {
          this.connect();
        }, 2000);
      } else {
        console.log("🛑 Reconexão cancelada (logout manual).");
      }
    };
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ ping: true }));
      }
    }, 15000); // 15 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  changeLanguage(newLang: string) {
    if (this.currentLang === newLang) return;
    
    console.log('Changing language to:', newLang);
    this.currentLang = newLang;
    
    // Reconnect with new language
    this.disconnect();
    this.shouldReconnect = true;
    this.connect();
  }

  disconnect() {
    console.log("🛑 WS.disconnect() chamado — encerrando manualmente");
    this.manualDisconnect = true;
    this.shouldReconnect = false;

    // Limpa timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        console.warn("Erro ao fechar WS:", e);
      }
      this.ws = null;
    }

    // 🧹 Limpa fila de áudio (importante)
    try {
      import("@/utils/ws-audio-queue").then(mod => mod.clearAudioQueue());
    } catch (e) {
      console.warn("Não conseguiu limpar fila de áudio:", e);
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  reconnect() {
    this.shouldReconnect = true;
    this.connect();
  }

  destroy() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    this.disconnect();
  }
}
