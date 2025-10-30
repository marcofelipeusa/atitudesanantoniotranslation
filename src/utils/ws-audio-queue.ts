// ws-audio-queue.ts — versão refinada (voz natural + mute correto): 
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

interface WebSocketMessage {
  text?: string;
  audio_b64?: string;
  lang?: string;
  type?: string;
}

interface WebSocketInstance {
  close: () => void;
  setMute: (mute: boolean) => void;
  changeLang: (newLang: string) => WebSocketInstance;
}

let audioCtx: AudioContext | null = null;
let ws: WebSocket | null = null;
let audioQueue: string[] = [];
let playing = false;
let currentSource: AudioBufferSourceNode | null = null;
let isMuted = false;
let reconnecting = false;
let lastText = "";

// Set para controle de áudios já processados
const processedHashes = new Set<string>();

function getAudioHash(b64: string): string {
  let hash = 0;
  for (let i = 0; i < b64.length; i++) {
    hash = ((hash << 5) - hash) + b64.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(36);
}

function ensureAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function stopAudioLocal() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {}
    currentSource.disconnect();
    currentSource = null;
  }
  audioQueue.length = 0;
  playing = false;
}

function playNext() {
  if (isMuted || playing || !audioQueue.length || !audioCtx) {
    console.log("⏭️ Pulando áudio: muted=", isMuted, "playing=", playing, "queueEmpty=", !audioQueue.length);
    return;
  }
  playing = true;

  const b64 = audioQueue.shift();
  if (!b64) {
    playing = false;
    return;
  }

  try {
    console.log("🎵 Decodificando áudio...");
    const audioData = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    
    audioCtx.decodeAudioData(audioData.buffer)
      .then((buffer) => {
        console.log("🎵 Áudio decodificado com sucesso");
        currentSource = audioCtx!.createBufferSource();
        currentSource.buffer = buffer;
        const gain = audioCtx!.createGain();
        gain.gain.setValueAtTime(0, audioCtx!.currentTime);
        gain.gain.linearRampToValueAtTime(1.0, audioCtx!.currentTime + 0.1);
        currentSource.connect(gain).connect(audioCtx!.destination);

        const baseRate = 1.0;
        const speed = Math.max(0.9, Math.min(1.15, baseRate));
        currentSource.playbackRate.value = speed;

        currentSource.onended = () => {
          console.log("🎵 Áudio finalizado");
          playing = false;
          currentSource = null;
          if (!isMuted && audioQueue.length > 0) {
            console.log("🎵 Próximo áudio em 60ms");
            setTimeout(playNext, 60);
          }
        };

        console.log("🎵 Iniciando playback");
        currentSource.start(0);
      })
      .catch((err) => {
        console.error("❌ Erro ao decodificar áudio:", err);
        playing = false;
      });
  } catch (err) {
    console.error("❌ Erro ao processar áudio:", err);
    playing = false;
  }
}

export function clearAudioQueue() {
  stopAudioLocal();
  audioQueue = [];
  processedHashes.clear();
  console.log("🧹 Fila de áudio limpa");
}

export function enqueueAudioMessage(message: WebSocketMessage) {
  if (!message.audio_b64) return;
  
  const hash = getAudioHash((message.text || "") + message.audio_b64);
  if (processedHashes.has(hash)) {
    console.log("🎵 Áudio duplicado ignorado:", message.text);
    return;
  }
  
  processedHashes.add(hash);
  enqueueAudio(message.audio_b64);
}

function enqueueAudio(b64: string) {
  if (isMuted) {
    console.log("🔇 Áudio ignorado (mudo)");
    return;
  }
  console.log("🎵 Áudio enfileirado");
  audioQueue.push(b64);
  if (!playing) {
    console.log("▶️ Iniciando reprodução");
    playNext();
  }
}

export function openTranslateSocket(
  backendBase: string,
  token: string | null,
  lang: string,
  onMessage: (msg: any) => void,
  onConnectionChange?: (connected: boolean) => void
): WebSocketInstance {
  ensureAudioCtx();
  
  if (ws && ws.readyState <= 1) {
    console.log("⚠️ WS já ativo, ignorando nova conexão");
    return {
      close: () => {
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
        stopAudioLocal();
      },
      setMute: (mute: boolean) => {
        isMuted = mute;
        if (mute) stopAudioLocal();
      },
      changeLang: (newLang: string) => openTranslateSocket(backendBase, token, newLang, onMessage, onConnectionChange)
    };
  }

  const url = `${backendBase.replace(/\/$/, "")}/ws/translate?lang=${lang}`;
  ws = new WebSocket(url);

  ws.onopen = () => {
    reconnecting = false;
    console.log("🌐 WS conectado:", lang);
    onConnectionChange?.(true);
    ws?.send(JSON.stringify({ type: "hello", muted: isMuted }));
  };

  ws.onclose = () => {
    onConnectionChange?.(false);
    ws = null;
    if (!reconnecting) {
      reconnecting = true;
      console.warn("⚠️ WS desconectado. Tentando reconectar...");
      setTimeout(() => openTranslateSocket(backendBase, token, lang, onMessage, onConnectionChange), 2000);
    }
  };

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data) as WebSocketMessage;
      const { text, audio_b64, lang: langMsg } = data;

      // Ignora textos curtos ou repetidos (parciais)
      if (text) {
        const cleaned = text.trim();
        if (cleaned.length < 3) return;
        if (lastText === cleaned) return;
        lastText = cleaned;

        onMessage?.({
          text: cleaned,
          lang: langMsg,
          time: new Date().toLocaleTimeString(),
        });
      }

      // Processa áudio se presente no payload
      if (audio_b64 && !isMuted) {
        console.log("🎵 Processando áudio recebido");
        enqueueAudio(audio_b64);
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  };

  return {
    close: () => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      stopAudioLocal();
      console.log("🛑 WebSocket fechado manualmente");
    },
    setMute: (mute: boolean) => {
      isMuted = mute;
      if (mute) {
        stopAudioLocal();
        console.log("🔇 Mudo localmente (WS ativo)");
      } else {
        ensureAudioCtx();
        if (audioCtx!.state === "suspended") audioCtx!.resume();
        console.log("🔊 Som reativado");
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "mute", muted: isMuted }));
      }
    },
    changeLang: (newLang: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      stopAudioLocal();
      processedHashes.clear();
      return openTranslateSocket(backendBase, token, newLang, onMessage, onConnectionChange);
    }
  };
}