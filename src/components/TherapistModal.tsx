import React from 'react';
import { X as CloseIcon } from 'lucide-react';

interface TherapistModalProps {
  therapist: {
    name: string;
    role: string;
    desc: string;
    photo: string;
    info: string;
    especialidadesYServicios: string[];
    beneficiosDeMisTerapias: string[];
    casoDeExito: string;
  };
  onClose: () => void;
}

export default function TherapistModal({ therapist, onClose }: TherapistModalProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white w-[90vw] max-w-4xl h-[80vh] rounded-xl shadow-2xl overflow-hidden relative animate-modalEntry"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <CloseIcon className="w-6 h-6 text-white" />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Left Column - Photo */}
          <div className="relative h-[30vh] md:h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-[#D45B7A] to-[#FDA576]" />
            <img 
              src={therapist.photo} 
              alt={therapist.name}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
            <div className="absolute bottom-8 left-8 text-white">
              <h2 className="text-4xl font-light">{therapist.name}</h2>
              <p className="text-xl mt-2 opacity-90">{therapist.role}</p>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="p-8 overflow-y-auto">
            <div className="prose prose-lg">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Acerca de mi</h3>
              <p className="text-gray-600 mb-6">{therapist.desc}</p>         
             
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Especialidades y Servicios Ofrecidos</h3>
              <ul className="list-disc list-inside text-gray-600">
                {therapist.especialidadesYServicios.map((servicio, index) => (
                  <li key={index}>{servicio}</li>
                ))}
              </ul>
              <br></br>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Beneficios de Mis Terapias</h3>
              <ul className="list-disc list-inside text-gray-600">
                {therapist.beneficiosDeMisTerapias.map((beneficio, index) => (
                  <li key={index}>{beneficio}</li>
                ))}
              </ul>
              <br></br>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Caso de Éxito</h3>
              <p className="text-gray-600 mb-6">{therapist.casoDeExito}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
