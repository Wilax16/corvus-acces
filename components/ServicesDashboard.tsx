import React from 'react';
import { AppView } from '../types';

interface ServicesDashboardProps {
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  onToggleAI: () => void;
  isAIActive: boolean;
}

interface ServiceButtonProps {
  onClick: () => void;
  label: string;
  ariaLabel: string;
  icon: React.ReactNode;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({ onClick, label, ariaLabel, icon }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className="flex flex-col items-center justify-center aspect-square bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-white font-semibold text-center transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 shadow-lg border border-white/10"
  >
    <div className="w-16 h-16 mb-2">{icon}</div>
    <span>{label}</span>
  </button>
);

export const ServicesDashboard: React.FC<ServicesDashboardProps> = ({
  onNavigate,
  onLogout,
  onToggleAI,
  isAIActive,
}) => {
  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Corvus</h1>
          <p className="text-white/80">Tus servicios de asistencia</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAI}
            className={`p-3 rounded-full transition-colors ${isAIActive ? 'bg-red-500' : 'bg-white/20'}`}
            aria-label={isAIActive ? 'Desactivar Asistente de Voz' : 'Activar Asistente de Voz'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
            </svg>
          </button>
          <button
            onClick={onLogout}
            className="p-3 bg-white/20 rounded-full text-white"
            aria-label="Cerrar sesión"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Services Grid */}
      <main className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ServiceButton
          onClick={() => onNavigate(AppView.TRIP_REQUEST)}
          label="Pedir Viaje"
          ariaLabel="Pedir un nuevo viaje"
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20A1 1 0 0 0 4 21H5A1 1 0 0 0 6 20V19H18V20A1 1 0 0 0 19 21H20A1 1 0 0 0 21 20V12L18.92 6.01M6.5 17A1.5 1.5 0 1 1 5 15.5A1.5 1.5 0 0 1 6.5 17M17.5 17A1.5 1.5 0 1 1 16 15.5A1.5 1.5 0 0 1 17.5 17M5 11L6.5 6.5H17.5L19 11H5Z" /></svg>
          }
        />
        <ServiceButton
          onClick={() => onNavigate(AppView.SCANNER)}
          label="Escáner Visual"
          ariaLabel="Activar escáner visual para describir el entorno"
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5z" /></svg>
          }
        />
        {/* Puedes añadir más botones de servicios aquí */}
      </main>
    </div>
  );
};