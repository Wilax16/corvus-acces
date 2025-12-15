import React, { useRef, useEffect, useState } from 'react';
import { speak } from '../services/voiceService';
import { GoogleGenAI } from "@google/genai";

interface ScannerProps {
  onBack: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null); // Store stream reference directly for robust cleanup

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [description, setDescription] = useState("Apunta la cámara y toca para describir.");

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) return; // Already active

      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(false);
      // Only speak if it's the initial load or explicit toggle, avoiding double speech on mount handled by effect dependency if needed
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(true);
      speak("Error al acceder a la cámara. Por favor verifica los permisos.");
    }
  };

  // Initial mount message
  useEffect(() => {
    speak("Escáner activado. Apunta tu cámara y toca el botón grande para describir el entorno.");
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  // Manage camera state
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive]);

  const handleBack = () => {
    stopCamera(); // Ensure stop before navigation
    speak("Saliendo del escáner"); 
    onBack();
  };

  const toggleCamera = () => {
    const newState = !isCameraActive;
    setIsCameraActive(newState);
    speak(newState ? "Cámara activada" : "Cámara pausada");
  };

  const analyzeScene = async () => {
    if (isAnalyzing || !videoRef.current || !canvasRef.current) return;
    
    if (!isCameraActive) {
        speak("La cámara está pausada. Actívala primero.");
        return;
    }

    setIsAnalyzing(true);
    speak("Analizando...");

    try {
        // 1. Capture Frame
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("No canvas context");
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 2. Convert to Base64
        const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        // 3. Call Gemini
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
            throw new Error("API Key for Google GenAI is not configured. Please check your .env file.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Fast and multimodal
            // The 'contents' field must be an array of Content objects.
            contents: [
              {
                  parts: [
                      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                      { text: "Describe brevemente lo que ves para una persona con discapacidad visual. Identifica vehículos, puertas, obstáculos o texto legible. Sé conciso." }
                  ]
              }
            ]
        });

        // Correct way to access the response text from the Gemini API
        
      const text = response.text;

      if (!text || text.trim() === "") {
            throw new Error("Received an empty description from the AI.");
        }
        setDescription(text);
        speak(text);
    } catch (error) {
        console.error("Analysis failed", error);
        speak("Hubo un error al analizar la imagen. Intenta de nuevo.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black relative animate-fade-in">
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <div className="flex items-center pointer-events-auto">
            <button 
            onClick={handleBack}
            className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white active:bg-white/40 shadow-lg border border-white/10"
            aria-label="Volver atrás"
            >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
            </svg>
            </button>
            <h1 className="text-white font-bold text-xl ml-4 drop-shadow-md hidden sm:block">Escáner Visual</h1>
        </div>

        {/* Camera Toggle Button */}
        <button
            onClick={toggleCamera}
            className={`pointer-events-auto p-3 rounded-full text-white shadow-lg border border-white/10 transition-colors ${isCameraActive ? 'bg-red-500/80 hover:bg-red-600' : 'bg-green-600/80 hover:bg-green-700'}`}
            aria-label={isCameraActive ? "Desactivar cámara" : "Activar cámara"}
        >
            {isCameraActive ? (
                // Camera Off Icon
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.27,2L2,3.27L4.73,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16C16.2,18 16.39,17.92 16.54,17.82L19.73,21L21,19.73L3.27,2M12,17V13.27L15.73,17H12M21,7V15.73L19,13.73V7H9.27L7.27,5H20A1,1 0 0,1 21,6V7M19,3H10V5H19V3Z" />
                </svg>
            ) : (
                // Camera On Icon
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
                </svg>
            )}
        </button>
      </div>

      {/* Camera Feed */}
      <div className="flex-1 relative overflow-hidden bg-[#121212]">
        {isCameraActive && !cameraError ? (
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center gap-4">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="opacity-50">
                    <path d="M3.27,2L2,3.27L4.73,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16C16.2,18 16.39,17.92 16.54,17.82L19.73,21L21,19.73L3.27,2M12,17V13.27L15.73,17H12M21,7V15.73L19,13.73V7H9.27L7.27,5H20A1,1 0 0,1 21,6V7M19,3H10V5H19V3Z" />
                </svg>
                <p className="text-xl font-bold">Cámara desactivada</p>
                {!cameraError && <p className="text-sm opacity-70">Toca el botón de arriba para activar</p>}
                {cameraError && <p className="text-sm text-red-400">Error de acceso a cámara</p>}
            </div>
      )}
         {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

         {/* Target Overlay (Visual Aid) - Only show if active */}
        {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
                <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white"></div>
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                </div>
            </div>
        )}
      </div>

      {/* Controls & Output */}
      <div className="absolute bottom-0 left-0 w-full bg-[#0d1b2a] rounded-t-[2rem] p-6 pb-8 z-20 flex flex-col items-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
         {/* Text Output Box */}
        <div className="w-full bg-black/30 p-4 rounded-xl mb-4 min-h-[80px] flex items-center justify-center">
            <p className="text-white text-center font-medium leading-snug">
            {isAnalyzing ? "Procesando imagen..." : description}
            </p>
        </div>

         {/* Big Trigger Button */}
        <button
            onClick={analyzeScene}
            disabled={isAnalyzing || cameraError || !isCameraActive}
            className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-lg transition-all active:scale-95 
                ${!isCameraActive ? 'bg-gray-700 border-gray-500 opacity-50' : 
                  isAnalyzing ? 'bg-gray-600 border-[#5a97eb] animate-pulse' : 'bg-white border-[#5a97eb]'}`}
            aria-label="Capturar y describir entorno"
        >
            {isAnalyzing ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-white animate-spin">
                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
            ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className={!isCameraActive ? "text-gray-400" : "text-[#0d1b2a]"}>
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                </svg>
            )}
        </button>
        <span className="text-gray-400 text-sm mt-2 font-semibold">
            {isCameraActive ? "Toca para analizar" : "Cámara pausada"}
        </span>
      </div>

    </div>
  );
};