import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Raven Icon Placeholder - Using an SVG for sharp scaling */}
      <svg
        width="100"
        height="100"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-black mb-2"
        role="img"
        aria-label="Logotipo de un cuervo"
      >
        <path d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6C13.66,6 15,7.34 15,9C15,10.66 13.66,12 12,12C10.34,12 9,10.66 9,9C9,7.34 10.34,6 12,6M12,14C14.67,14 20,15.34 20,18V19H4V18C4,15.34 9.33,14 12,14Z" />
        {/* Note: This is a generic user/bird shape for the demo. In a real app, I'd trace the exact raven. */}
      </svg>
      
      <h1 className="text-3xl font-extrabold tracking-widest text-black text-center font-sans">
        CORVUS
      </h1>
      <h2 className="text-sm font-semibold tracking-[0.3em] text-black text-center mb-1">
        CORPORATION
      </h2>
      
      {/* Braille Simulation - "Corvus" in Braille */}
      <div className="flex gap-1 justify-center mt-1" aria-hidden="true">
         {/* C */}
         <div className="grid grid-cols-2 gap-0.5 w-4">
            <div className="w-1.5 h-1.5 bg-black rounded-full"></div><div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="w-1.5 h-1.5 opacity-20 bg-black rounded-full"></div><div className="w-1.5 h-1.5 opacity-20 bg-black rounded-full"></div>
            <div className="w-1.5 h-1.5 opacity-20 bg-black rounded-full"></div><div className="w-1.5 h-1.5 opacity-20 bg-black rounded-full"></div>
         </div>
         {/* O */}
         <div className="grid grid-cols-2 gap-0.5 w-4">
            <div className="w-1.5 h-1.5 bg-black rounded-full"></div><div className="w-1.5 h-1.5 opacity-20 bg-black rounded-full"></div>
            <div className="w-1.5 h-1.5 opacity-20 bg-black rounded-full"></div><div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-black rounded-full"></div><div className="w-1.5 h-1.5 opacity-20 bg-black rounded-full"></div>
         </div>
         {/* ... abbreviated for visuals */}
          <div className="flex gap-1 ml-1">
            <span className="sr-only">Texto en Braille debajo del logo</span>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
         </div>
      </div>
    </div>
  );
};