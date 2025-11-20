import React from 'react';

interface TestimonialCardProps {
    name: string;
    text: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, text }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border-purple-500 border-2 h-full">
            <p className="text-lg mb-4 text-center">{text}</p>
            <p className="font-bold text-center">{name}</p>
        </div>
    );
};

export default TestimonialCard;
