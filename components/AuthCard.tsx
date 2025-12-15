import React, { useState } from 'react';
import { AuthMode } from '../types';
import { speak } from '../services/voiceService';

interface AuthCardProps {
  onLoginSuccess: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    // Clear fields on switch for better UX
    setName('');
    setLastName('');
    setEmail('');
    setPassword('');
    // Accessibility feedback
    const text = newMode === AuthMode.LOGIN ? "Modo Iniciar Sesión activado" : "Modo Registro activado";
    speak(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    speak("Procesando credenciales...");
    
    // Simulate API delay
    setTimeout(() => {
        const successMessage = mode === AuthMode.LOGIN ? "Acceso concedido. Bienvenido a la pantalla de servicios." : "Registro completado. Bienvenido a la pantalla de servicios.";
        speak(successMessage);
        onLoginSuccess();
    }, 1000);
  };

  return (
    <div 
      className="bg-white w-full max-w-md rounded-[2.5rem] px-6 sm:px-8 pt-10 pb-12 shadow-2xl relative z-10"
      role="main"
      aria-label="Formulario de acceso"
    >
      {/* Toggle Tabs */}
      <div 
        className="flex bg-gray-200 rounded-full p-0.5 mb-10 relative" 
        role="tablist" 
        aria-label="Opciones de acceso"
      >
        <button
          onClick={() => handleModeSwitch(AuthMode.LOGIN)}
          className={`flex-1 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${
            mode === AuthMode.LOGIN 
              ? 'bg-[#0d1b2a] text-white shadow-md' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          role="tab"
          aria-selected={mode === AuthMode.LOGIN}
          aria-controls="auth-panel"
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => handleModeSwitch(AuthMode.REGISTER)}
          className={`flex-1 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${
            mode === AuthMode.REGISTER 
              ? 'bg-[#0d1b2a] text-white shadow-md' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          role="tab"
          aria-selected={mode === AuthMode.REGISTER}
          aria-controls="auth-panel"
        >
          Registrarse
        </button>
      </div>

      {/* Form Fields */}
      <form 
        id="auth-panel" 
        className="flex flex-col gap-6 sm:gap-8" 
        onSubmit={handleSubmit}
        aria-live="polite"
      >
        {/* Conditional Name/LastName fields for Registration */}
        {mode === AuthMode.REGISTER && (
          <>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer w-full border-b border-gray-300 py-2 text-gray-900 focus:outline-none focus:border-[#0d1b2a] focus:border-b-2 transition-colors bg-transparent placeholder-transparent text-base"
                placeholder="Nombre"
                required
              />
              <label htmlFor="name" className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
                Nombre
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="peer w-full border-b border-gray-300 py-2 text-gray-900 focus:outline-none focus:border-[#0d1b2a] focus:border-b-2 transition-colors bg-transparent placeholder-transparent text-base"
                placeholder="Apellidos"
                required
              />
              <label htmlFor="lastName" className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
                Apellidos
              </label>
            </div>
          </>
        )}

        {/* Email Input */}
        <div className="relative">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full border-b border-gray-300 py-2 text-gray-900 focus:outline-none focus:border-[#0d1b2a] focus:border-b-2 transition-colors bg-transparent placeholder-transparent text-base"
            placeholder="E-Mail"
            required
          />
          <label 
            htmlFor="email"
            className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm cursor-text"
          >
            E-Mail
          </label>
        </div>

        {/* Password Input */}
        <div className="relative">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full border-b border-gray-300 py-2 text-gray-900 focus:outline-none focus:border-[#0d1b2a] focus:border-b-2 transition-colors bg-transparent placeholder-transparent text-base"
            placeholder="Contraseña"
            required
          />
          <label 
            htmlFor="password"
            className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm cursor-text"
          >
            Contraseña
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#0d1b2a] text-white font-bold py-4 rounded-full mt-4 text-lg sm:text-xl shadow-lg transform active:scale-95 transition-transform hover:bg-[#1a2c42] focus:ring-4 focus:ring-blue-300/50"
          aria-label={mode === AuthMode.LOGIN ? "Botón Iniciar Sesión" : "Botón Registrarse"}
        >
          {mode === AuthMode.LOGIN ? 'Iniciar Sesión' : 'Registrarse'}
        </button>

        {/* Footer Links */}
        <div className="text-center space-y-1">
          <p className="text-gray-900 font-medium text-sm sm:text-base">
            ¿Olvidaste la contraseña?
          </p>
          <button 
            type="button" 
            className="text-[#7b2cbf] font-bold italic text-base sm:text-lg hover:underline focus:outline-none"
            onClick={() => speak("Navegando a recuperación de contraseña")}
          >
            Recuperar
          </button>
        </div>
      </form>
    </div>
  );
};