"use client"
import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from 'react-spring';

interface AnimatedSectionProps {
    children: React.ReactNode;
    initialItems?: number;
    increment?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, initialItems = 3, increment = 3 }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        rootMargin: '-100px 0px',
    });

    const [visibleItems, setVisibleItems] = useState(initialItems);

    const animation = useSpring({
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0px)' : 'translateY(50px)',
        config: { mass: 1, tension: 80, friction: 26 },
    });

    const childrenArray = React.Children.toArray(children);

    const loadMore = () => {
        setVisibleItems(prev => Math.min(prev + increment, childrenArray.length));
    };

    return (
        <animated.div ref={ref} style={animation}>
            {childrenArray.slice(0, visibleItems)}
            {visibleItems < childrenArray.length && (
                <div className="text-center mt-4">
                    <button
                        onClick={loadMore}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded hover:from-pink-600 hover:to-purple-600 transition-colors"
                    >
                        Cargar Más
                    </button>
                </div>
            )}
        </animated.div>
    );
};

export default AnimatedSection;
