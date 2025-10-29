const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface TranscriptPayload {
  transcript: string;
  source_lang: string;
  targets: string[];
}

export const postTranscript = async (payload: TranscriptPayload): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_URL}/transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error posting transcript:', error);
    throw error;
  }
};

export const getBackendUrl = () => BACKEND_URL;
