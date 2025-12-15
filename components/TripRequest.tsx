import React, { useState, useEffect, useRef } from 'react';
import { speak } from '../services/voiceService';

interface TripRequestProps {
  onBack: () => void;
}

// Interface for browser speech recognition support
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const TripRequest: React.FC<TripRequestProps> = ({ onBack }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  
  // New state for Transport Type (Car vs Moto)
  const [transportType, setTransportType] = useState<'car' | 'moto'>('car');
  const [vehicleType, setVehicleType] = useState<'standard' | 'accessible'>('standard');
  
  const [isListening, setIsListening] = useState(false);
  const [listeningField, setListeningField] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Ref to hold the current recognition instance to allow aborting
  const recognitionRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!pickup || !destination) {
        speak("Faltan datos. Por favor, indica origen y destino.");
        return;
    }
    
    // Mandatory Code Validation
    if (!code || code.length < 4) {
      speak("El código de seguridad es obligatorio y debe tener 4 caracteres.");
      return;
    }

    // Trigger Confirmation Modal
    setShowConfirmation(true);

    // Prepare summary text for voice
    const transportText = transportType === 'car' ? 'Automóvil' : 'Motocicleta';
    const serviceText = vehicleType === 'accessible' ? 'Asistido' : 'Estándar';
    
    const summaryText = `Resumen de solicitud. Transporte: ${transportText} ${serviceText}. Origen: ${pickup}. Destino: ${destination}. Nombre: ${name || 'No especificado'}. Código: ${code.split('').join(' ')}. ¿Confirmar?`;
    
    speak(summaryText);
  };

  const handleFinalConfirm = () => {
      speak("Solicitud enviada con éxito. Buscando conductor.");
      setTimeout(() => {
          onBack(); 
      }, 3000);
  };

  const handleEdit = () => {
      speak("Editando solicitud.");
      setShowConfirmation(false);
  };

  const handleTransportChange = (type: 'car' | 'moto') => {
      setTransportType(type);
      speak(type === 'car' ? "Automóvil seleccionado" : "Motocicleta seleccionada");
  };

  const startListening = (setter: (val: string) => void, fieldName: string) => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      speak("Navegador no compatible con voz.");
      return;
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    setListeningField(fieldName);

    try {
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        
        recognition.lang = 'es-ES'; 
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            setIsListening(false);
            setListeningField('');
            recognitionRef.current = null;
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            const cleanTranscript = transcript.replace(/\.$/, "");
            
            // Special handling for code to remove spaces if spoken
            if (fieldName === 'Código') {
                 setter(cleanTranscript.replace(/\s/g, '').toUpperCase().slice(0, 4));
            } else {
                 setter(cleanTranscript);
            }
            speak(`Escuché: ${cleanTranscript}`);
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            setListeningField('');
             if (event.error === 'network') {
                speak("Error de conexión.");
            } else if (event.error !== 'aborted') {
                speak("No entendí.");
            }
        };

        recognition.start();

    } catch (e) {
        speak("Error al iniciar micrófono.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in px-4 py-2 relative">
      
      {/* Header with Back Button */}
      <div className="flex items-center mb-2 w-full max-w-md mx-auto relative z-10">
        <button 
          onClick={() => { speak("Volviendo"); onBack(); }}
          className="p-2 -ml-2 text-black hover:bg-white/20 rounded-full transition-colors"
          aria-label="Volver atrás"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
          </svg>
        </button>
        <h1 className="text-4xl font-black text-black tracking-tight ml-2">
          Pedir Viaje
        </h1>
      </div>

      {/* Main Form Card */}
      <div className="flex-1 w-full max-w-md mx-auto bg-[#0d1b2a] rounded-[2rem] px-5 py-6 shadow-2xl relative flex flex-col overflow-y-auto z-10 custom-scrollbar">
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-bl-[100%] opacity-20 pointer-events-none"></div>

        {/* Listening Indicator */}
        {isListening && (
           <div className="absolute inset-0 z-50 bg-black/60 rounded-[2rem] flex items-center justify-center backdrop-blur-sm">
              <div className="bg-red-600 text-white px-8 py-6 rounded-2xl animate-pulse font-bold text-xl shadow-2xl text-center border-4 border-white/20">
                 Escuchando: {listeningField}<br/>
                 <span className="text-base font-normal text-white/80 block mt-2">Habla ahora...</span>
              </div>
           </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-1 relative z-10">
          
          {/* Pickup Address */}
          <div className="relative group">
            <label htmlFor="pickup" className="block text-gray-400 text-sm font-bold mb-1 ml-1">
              Punto de Partida
            </label>
            <div className="relative flex items-center">
                <input
                    type="text"
                    id="pickup"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-500 text-white text-lg pb-2 focus:outline-none focus:border-[#4b7cd6] transition-colors pr-16"
                    placeholder="Ubicación actual..."
                />
                {/* GPS Icon */}
                <button 
                    type="button"
                    onClick={() => { setPickup("Ubicación Actual"); speak("Ubicación actual fijada"); }}
                    className="absolute right-9 text-blue-400 p-2 rounded-full hover:bg-white/10"
                    aria-label="Usar GPS"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,18C15.31,18 18,15.31 18,12C18,8.69 15.31,6 12,6C8.69,6 6,8.69 6,12C6,15.31 8.69,18 12,18M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2Z" /></svg>
                </button>
                {/* Mic Icon */}
                <button 
                    type="button"
                    onClick={() => startListening(setPickup, "Punto de Partida")}
                    className="absolute right-0 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"
                    aria-label="Dictar origen"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/></svg>
                </button>
            </div>
          </div>

          {/* Destination Address */}
          <div className="relative group">
            <label htmlFor="destination" className="block text-gray-400 text-sm font-bold mb-1 ml-1">
              Destino
            </label>
            <div className="relative flex items-center">
                <input
                    type="text"
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-500 text-white text-lg pb-2 focus:outline-none focus:border-[#4b7cd6] transition-colors pr-10"
                    placeholder="¿A dónde vamos?"
                />
                 <button 
                    type="button"
                    onClick={() => startListening(setDestination, "Destino")}
                    className="absolute right-0 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"
                    aria-label="Dictar destino"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/></svg>
                </button>
            </div>
          </div>

           {/* Vehicle Selection Section */}
           <div>
               <label className="block text-gray-400 text-xs font-bold mb-2 ml-1 uppercase tracking-wider">
                  Tipo de Transporte
               </label>
               
               {/* Car vs Moto */}
               <div className="flex gap-3 mb-3">
                   <button
                        type="button"
                        onClick={() => handleTransportChange('car')}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-1 ${transportType === 'car' ? 'bg-white text-[#0d1b2a] border-white shadow-lg scale-105' : 'border-gray-600 text-gray-400 hover:bg-white/5'}`}
                   >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z" /></svg>
                        <span className="text-sm">Automóvil</span>
                   </button>
                   <button
                        type="button"
                        onClick={() => handleTransportChange('moto')}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-1 ${transportType === 'moto' ? 'bg-white text-[#0d1b2a] border-white shadow-lg scale-105' : 'border-gray-600 text-gray-400 hover:bg-white/5'}`}
                   >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M5,20H19V22H5V20M12,13L16.29,15.15C16.64,15.32 17,15.32 17.35,15.15L21,13.32V17A2,2 0 0,1 19,19H5A2,2 0 0,1 3,17V12.5C3,10.15 4.81,8.19 7.11,8C9.53,7.77 11.58,9.58 11.83,12H12M18,9.5A2.5,2.5 0 0,0 15.5,12A2.5,2.5 0 0,0 18,14.5A2.5,2.5 0 0,0 20.5,12A2.5,2.5 0 0,0 18,9.5M14,6V3H10V6H14Z" /></svg>
                        <span className="text-sm">Moto</span>
                   </button>
               </div>

               {/* Standard vs Accessible (Only show if Car is selected, or keep for both?) Assuming Accessible moto is rare, but let's keep it visible but maybe distinct styling */}
               <div className="flex bg-[#1a2c42] rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setVehicleType('standard')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${vehicleType === 'standard' ? 'bg-[#5a97eb] text-white shadow' : 'text-gray-400'}`}
                    >
                        Estándar
                    </button>
                    <button
                        type="button"
                        onClick={() => setVehicleType('accessible')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-1 ${vehicleType === 'accessible' ? 'bg-[#5a97eb] text-white shadow' : 'text-gray-400'}`}
                    >
                        <span className="sr-only">Asistido</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/></svg>
                        Asistido
                    </button>
               </div>
           </div>

          {/* Name & Code Row */}
          <div className="flex gap-4">
              {/* Name */}
              <div className="relative group flex-[1.5]">
                <label htmlFor="name" className="block text-gray-400 text-xs font-bold mb-1 ml-1">
                  Nombre
                </label>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent border-b-2 border-gray-500 text-white pb-1 focus:outline-none focus:border-[#4b7cd6] transition-colors pr-8 text-sm"
                        placeholder="Opcional"
                    />
                    <button 
                        type="button"
                        onClick={() => startListening(setName, "Nombre")}
                        className="absolute right-0 text-gray-400 hover:text-white p-1"
                        aria-label="Dictar nombre"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/></svg>
                    </button>
                </div>
              </div>

              {/* Code */}
              <div className="relative group flex-1">
                <label htmlFor="code" className="block text-gray-400 text-xs font-bold mb-1 ml-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        id="code"
                        maxLength={4}
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="w-full bg-transparent border-b-2 border-gray-500 text-white pb-1 focus:outline-none focus:border-[#4b7cd6] transition-colors tracking-[0.2em] pr-8 font-mono text-center font-bold"
                        placeholder="____"
                    />
                     <button 
                        type="button"
                        onClick={() => startListening((val) => setCode(val.replace(/\s/g,'').toUpperCase().slice(0,4)), "Código")}
                        className="absolute right-0 text-gray-400 hover:text-white p-1"
                        aria-label="Dictar código"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/></svg>
                    </button>
                </div>
              </div>
          </div>
          <p className="text-gray-500 text-[10px] text-right -mt-2">
             * 4 caracteres (letras/números)
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#5a97eb] text-white font-black py-4 rounded-2xl mt-2 text-xl shadow-lg transform active:scale-95 transition-transform hover:bg-[#4b7cd6] focus:ring-4 focus:ring-blue-300/50 uppercase tracking-wide"
          >
            Comprobar
          </button>

        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
              <div 
                className="bg-white text-black w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative flex flex-col items-center"
                role="dialog"
                aria-label="Resumen de solicitud"
              >
                  <h2 className="text-2xl font-black mb-6 uppercase tracking-wider text-[#0d1b2a] w-full text-center flex items-center justify-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" /></svg>
                      Confirmar
                  </h2>
                  
                  <div className="w-full space-y-4 mb-8 text-lg">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Transporte</span>
                          <div className="flex items-center gap-2 font-bold text-[#0d1b2a]">
                             {transportType === 'car' ? 
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z" /></svg> 
                                : 
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5,20H19V22H5V20M12,13L16.29,15.15C16.64,15.32 17,15.32 17.35,15.15L21,13.32V17A2,2 0 0,1 19,19H5A2,2 0 0,1 3,17V12.5C3,10.15 4.81,8.19 7.11,8C9.53,7.77 11.58,9.58 11.83,12H12M18,9.5A2.5,2.5 0 0,0 15.5,12A2.5,2.5 0 0,0 18,14.5A2.5,2.5 0 0,0 20.5,12A2.5,2.5 0 0,0 18,9.5M14,6V3H10V6H14Z" /></svg>
                             }
                             <span>{transportType === 'car' ? 'Automóvil' : 'Moto'}</span>
                             <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700">
                                {vehicleType === 'accessible' ? 'Asistido' : 'Std'}
                             </span>
                          </div>
                      </div>

                      <div className="flex flex-col border-b border-gray-200 pb-2">
                           <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Ruta</span>
                           <div className="flex flex-col gap-1 pl-2 border-l-2 border-[#5a97eb]">
                               <span className="text-sm font-semibold truncate text-gray-800">{pickup}</span>
                               <span className="text-xs text-gray-400">hacia</span>
                               <span className="text-sm font-semibold truncate text-gray-800">{destination}</span>
                           </div>
                      </div>

                       <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Código</span>
                          <span className="text-xl font-mono font-black tracking-widest bg-gray-100 px-2 rounded">{code}</span>
                      </div>
                  </div>

                  <div className="flex gap-4 w-full">
                      <button
                          onClick={handleEdit}
                          className="flex-1 py-4 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 active:scale-95 transition-all text-sm uppercase tracking-wide"
                      >
                          Corregir
                      </button>
                      <button
                          onClick={handleFinalConfirm}
                          className="flex-[2] py-4 rounded-xl bg-[#0d1b2a] text-white font-bold shadow-xl hover:bg-[#1a2c42] active:scale-95 transition-all text-sm uppercase tracking-wide"
                      >
                          Confirmar Viaje
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};