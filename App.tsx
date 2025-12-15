import React, { useState } from 'react';
import { AuthCard } from './components/AuthCard';
import { Logo } from './components/Logo';
import { ServicesDashboard } from './components/ServicesDashboard'; // Asegúrate de que la importación esté presente
import { TripRequest } from './components/TripRequest';
import { Scanner } from './components/Scanner';
import BlindAssistant from './components/BlindAssistant';
import { speak } from './services/voiceService';
import { AppView } from './types';
import backgroundImage from './assets/inicio.png'; // Importar la imagen de fondo
import corvusLogo from './assets/Corvus.png'; // Importar el logo de Corvus

// Línea de depuración: Imprime la clave de API en la consola del navegador al cargar la app.
console.log("Clave de API cargada por Vite:", import.meta.env.VITE_API_KEY);

const App: React.FC = () => {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);

  const toggleAi = () => {
    const newState = !aiEnabled;
    setAiEnabled(newState);
    speak(newState ? "Asistente Corvus activado. Te escucho." : "Asistente desactivado.");
  };

  const handleLoginSuccess = () => {
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentView(AppView.AUTH);
  };

  const handleNavigation = (view: AppView) => {
    setCurrentView(view);
  };

  // Helper to render content based on view
  const renderContent = () => {
    switch (currentView) {
      case AppView.AUTH:
        return (
          <>
            <div className="w-full flex justify-between items-center p-4 z-20 text-white bg-[#0d1b2a] bg-opacity-90">
             <span className="font-semibold" aria-label="Pantalla actual">Iniciar Sesion</span>
             <button 
               onClick={toggleAi}
               className="p-2 bg-yellow-500 rounded-full text-black font-bold text-xs"
               aria-label={aiEnabled ? "Desactivar Asistente de Voz" : "Activar Asistente de Voz"}
             >
               {aiEnabled ? "IA ON" : "IA OFF"}
             </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 z-10 pt-4 pb-10">
              <div className="mb-6 mt-4 animate-fade-in-down">
                <img 
                  src={corvusLogo} 
                  alt="Logo de Corvus" 
                  className="w-48 h-auto drop-shadow-lg" 
                />
              </div>
              <div className="w-full max-w-md animate-fade-in-up">
                <AuthCard onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
          </>
        );
      case AppView.DASHBOARD:
        return (
          <div className="w-full h-full z-10 flex-1">
            <ServicesDashboard 
               onNavigate={handleNavigation}
               onLogout={handleLogout} 
               onToggleAI={toggleAi} 
               isAIActive={aiEnabled} 
            />
          </div>
        );
      case AppView.TRIP_REQUEST:
        return (
           <div className="w-full h-full z-10 flex-1 flex flex-col items-center">
             <TripRequest onBack={() => handleNavigation(AppView.DASHBOARD)} />
             <div className="absolute bottom-4 right-4 z-20">
                <button 
                  onClick={toggleAi}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${aiEnabled ? 'bg-red-500 animate-pulse ring-4 ring-red-300' : 'bg-transparent border-4 border-black active:scale-95'}`}
                  aria-label={aiEnabled ? "Desactivar Asistente" : "Activar Asistente"}
               >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className={aiEnabled ? "text-white" : "text-black"}>
                      <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                  </svg>
               </button>
             </div>
           </div>
        );
      case AppView.SCANNER:
        return (
          <div className="w-full h-full z-30 flex-1">
            <Scanner onBack={() => handleNavigation(AppView.DASHBOARD)} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-start overflow-y-auto bg-[#0d1b2a]">
      
      {/* --- Dynamic Background Logic --- */}

      {/* Background for Auth View */}
      {currentView === AppView.AUTH && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-0 pointer-events-none"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* A lighter overlay without blur for better image clarity */}
          <div className="w-full h-full bg-black/20"></div>
        </div>
      )}

      {/* Background for other views (except Scanner) */}
      {currentView !== AppView.SCANNER && currentView !== AppView.AUTH && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute -top-20 -left-20 w-[150%] h-[50%] bg-[#4b7cd6] rounded-[50%] opacity-50 blur-2xl transform -rotate-12"></div>
           <div className="absolute bottom-0 right-0 w-[150%] h-[40%] bg-[#254b85] rounded-t-[100%] opacity-30 blur-2xl"></div>
        </div>
      )}

      {renderContent()}

      {/* Invisible AI Component (Global Assistant) - Keep active even in other views if needed, 
          but usually we might want to pause it if Scanner is using the mic/audio exclusively. 
          For now, we leave it, but user can toggle it off manually. 
      */}
      <BlindAssistant active={aiEnabled} />
    </div>
  );
};

export default App;