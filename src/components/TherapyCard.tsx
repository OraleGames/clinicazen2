"use client"

import React, { useState } from 'react';

interface Therapy {
    id: string;
    name: string;
    description: string;
    image: string;
    backImage: string;
    categories: string[];
    symptoms: string[];
    enfermedades?: string[];
    extendedDescription?: string;
}

interface TherapyCardProps {
    therapy: Therapy;
}

const TherapyCard: React.FC<TherapyCardProps> = ({ therapy }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div
            className="w-64 h-96"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onTouchStart={handleFlip}
        >
            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front of the card */}
                <div className="absolute inset-0 bg-white rounded-lg border-2 border-purple-500 shadow-md overflow-hidden flex flex-col [backface-visibility:hidden]"
    style={{ backgroundImage: `url(${therapy.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
>
    {/* New text element at the bottom */}
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-70 p-4 rounded-b-lg">
        <h3 className="text-xl font-semibold mb-2 text-center text-white text-shadow">{therapy.name}</h3>
        <p className="text-white-200 font-semibold text-sm mb-4 text-center text-shadow-xl">{therapy.description}</p>
        <div className="flex flex-wrap gap-2 justify-center">
            {therapy.categories.map(category => (
                <span key={category} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {category}
                </span>
            ))}
        </div>
    </div>
</div>

                {/* Back of the card */}
                <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-md overflow-hidden flex flex-col [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <img src={therapy.backImage} alt={`${therapy.name} - additional`} className="w-full h-40 object-cover" />
                    <div className="p-4 overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-2 text-white-800">Síntomas</h3>
                        <ul className="list-disc pl-5 mb-4">
                            {therapy.symptoms.map((symptom, index) => (
                                <li key={index} className="text-sm text-white-600">{symptom}</li>
                            ))}
                        </ul>
                        {therapy.enfermedades && therapy.enfermedades.length > 0 && (
                            <>
                                <h3 className="text-lg font-semibold mb-2 text-white-800">Ayuda para:</h3>
                                <ul className="grid grid-cols-2 gap-2 pl-5">
                                    {therapy.enfermedades.slice(0, 6).map((enfermedad, index) => (
                                        <li key={index} className="text-sm text-white-600">{enfermedad}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapyCard;
