import React from 'react';

interface TherapistCardProps {
    name: string;
    specialty: string;
    image: string;
    bio: string;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ name, specialty, image, bio }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg border-purple-500 border-2 overflow-hidden">
            <div className="p-4 text-center">
                <img src={image} alt={name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                <h3 className="text-xl font-semibold mb-2">{name}</h3>
                <p className="text-gray-600 mb-2">{specialty}</p>
                <p className="text-sm">{bio}</p>
            </div>
        </div>
    );
};

export default TherapistCard;
