"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TherapyCard from './TherapyCard';

interface Therapy {
    id: string;
    name: string;
    description: string;
    image: string;
    backImage: string;
    categories: string[];
    symptoms: string[];
    enfermedades: string[];
    extendedDescription?: string;
}

interface TherapyShowcaseProps {
    therapies: Therapy[];
}

const TherapyShowcase: React.FC<TherapyShowcaseProps> = ({ therapies }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredTherapies = useMemo(() => {
        return activeFilter === 'all'
            ? therapies
            : therapies.filter(therapy => therapy.categories.includes(activeFilter));
    }, [therapies, activeFilter]);

    const visibleTherapies = useMemo(() => {
        const visibleCount = isMobile ? 1 : 3;
        return filteredTherapies.slice(currentIndex, currentIndex + visibleCount);
    }, [filteredTherapies, currentIndex, isMobile]);

    const handlePrev = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => Math.min(filteredTherapies.length - (isMobile ? 1 : 3), prev + 1));
    };

    const uniqueCategories = useMemo(() => {
        const categories = new Set(therapies.flatMap(therapy => therapy.categories));
        return ['all', ...categories];
    }, [therapies]);

    return (
        <div className="relative">
            <div className="flex justify-center mb-4 space-x-2 overflow-x-auto">
                {uniqueCategories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        className={`px-4 py-2 rounded-full ${activeFilter === category
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>
            <div className="flex justify-between items-center">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-full bg-purple-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex justify-center space-x-4 overflow-x-auto">
                    {visibleTherapies.map(therapy => (
                        <TherapyCard key={therapy.id} therapy={therapy} />
                    ))}
                </div>
                <button
                    onClick={handleNext}
                    disabled={currentIndex >= filteredTherapies.length - (isMobile ? 1 : 3)}
                    className="p-2 rounded-full bg-purple-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default TherapyShowcase;
