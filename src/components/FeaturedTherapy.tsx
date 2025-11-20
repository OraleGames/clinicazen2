import React from 'react';
import { motion } from 'framer-motion';

interface Therapy {
    id: string;
    name: string;
    description: string;
    image: string;
    extendedDescription: string;
    categories: string[];
    symptoms: string[];
    enfermedades: string[];
}

interface FeaturedTherapyProps {
    therapy: Therapy;
}

const FeaturedTherapy: React.FC<FeaturedTherapyProps> = ({ therapy }) => {
    if (!therapy) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-4 md:p-6 w-[95%] md:w-[60%] max-w-4xl border-2 border-purple-500"
        >
            <div className="px-3 py-1 text-sm text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                Terapia del mes
            </div>
            <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-white">{therapy.name}</h2>
                <div className="flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-6">
                        <img src={therapy.image} alt={therapy.name} className="w-full h-auto object-cover rounded-lg shadow-lg" />
                    </div>
                    <div className="w-full md:w-1/2">
                        <p className="text-sm md:text-base text-white mb-4">{therapy.extendedDescription}</p>
                        <h3 className="text-lg md:text-xl font-bold mb-2 text-white">Sintomas que trata:</h3>
                        <ul className="text-sm md:text-base text-white mb-4 list-disc list-inside">
                            {therapy.symptoms.map((symptom, index) => (
                                <li key={index}>{symptom}</li>
                            ))}
                        </ul>
                        <h3 className="text-lg md:text-xl font-bold mb-2 text-white">Enfermedades tratadas:</h3>

                        <div className="grid grid-cols-2 gap-4 mb-3 mt-4">
                            {therapy.enfermedades.slice(0, 6).map((enfermedad, index) => (
                                <div key={index} className="text-sm md:text-base text-white">
                                    <span className="inline-block w-4 h-4 bg-purple-600 rounded-full mr-2"></span>
                                    {enfermedad}
                                </div>
                            ))}
                        </div>
                        <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base mb-4">
                            Saber más
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {therapy.categories.map(category => (
                        <span key={category} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {category}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default FeaturedTherapy;
