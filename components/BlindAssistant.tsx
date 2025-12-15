import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface BlindAssistantProps {
  active: boolean;
}

const BlindAssistant: React.FC<BlindAssistantProps> = ({ active }) => {
  // Logic based on Google GenAI Live API guidelines
  const [connected, setConnected] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  
  // Initialize AI client
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.error("API Key for Google GenAI is not configured. Please check your .env file.");
  }
  // Initialize lazily to avoid crashing if key is missing on initial load
  const getAiClient = () => new GoogleGenAI({ apiKey: apiKey as string });

  useEffect(() => {
    if (!active) return;

    let cleanup = () => {};

    const startSession = async () => {
      try {
        if (!apiKey) {
            console.error("Cannot start Corvus Assistant: API Key is missing.");
            return;
        }

        // 1. Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        // 2. Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // 3. Connect to Gemini Live
        const sessionPromise = getAiClient().live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: `Eres Corvus, un asistente de IA empático y preciso diseñado para ayudar a personas con discapacidad visual. 
            Tu objetivo principal es ayudar al usuario a navegar por la aplicación de transporte y entender su entorno.
            Sé breve, claro y descriptivo. No uses explicaciones visuales complejas.`,
          },
          callbacks: {
            onopen: () => {
              setConnected(true);
              console.log("Corvus AI Connected");
              
              // Setup Audio Processing (Microphone -> AI)
              const source = inputCtx.createMediaStreamSource(stream);
              const processor = inputCtx.createScriptProcessor(4096, 1, 1);
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                   session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              
              source.connect(processor);
              processor.connect(inputCtx.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
              // Handle Audio Output (AI -> Speaker)
              const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData) {
                await playAudioChunk(audioData, outputCtx);
              }
            },
            onclose: () => {
              setConnected(false);
              console.log("Corvus AI Disconnected");
            },
            onerror: (err) => {
              console.error("Corvus AI Error", err);
            }
          }
        });

      } catch (err) {
        console.error("Failed to initialize Corvus Assistant:", err);
      }
    };

    startSession();

    return () => {
        // Cleanup logic would go here (stopping tracks, closing contexts)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Helper: Play Audio Chunk
  const playAudioChunk = async (base64: string, ctx: AudioContext) => {
     try {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Decode PCM
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for(let i=0; i<channelData.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        const currentTime = ctx.currentTime;
        // Schedule next chunk to ensure smooth playback
        const startTime = Math.max(currentTime, nextStartTimeRef.current);
        source.start(startTime);
        nextStartTimeRef.current = startTime + buffer.duration;

     } catch (e) {
        console.error("Audio decode error", e);
     }
  };

  // Helper: Create Blob for Input
  const createBlob = (data: Float32Array) => {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      let binary = '';
      const len = int16.buffer.byteLength;
      const bytes = new Uint8Array(int16.buffer);
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      return {
          data: b64,
          mimeType: 'audio/pcm;rate=16000'
      };
  };

  return null; // Invisible component
};

export default BlindAssistant;