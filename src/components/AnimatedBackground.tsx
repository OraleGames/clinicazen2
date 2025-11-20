import React from 'react';

const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const generateRandomHeight = () => {
    return Math.floor(Math.random() * 300) + 200; // Random height between 100px and 400px
  };

  const generateRandomDelay = () => {
    return Math.random() * 20; // Random delay between 0s and 20s
  };

  return (
<section className="relative flex justify-center items-center min-h-screen overflow-hidden bg-gray-900">
  <ul className="circles absolute top-0 left-0 w-full h-full overflow-hidden">
    {Array.from({ length: 10 }).map((_, index) => (
      <li
        key={index}
        className="absolute block list-none"
        style={{
          width: `${[80, 20, 20, 60, 20, 110, 150, 25, 15, 150][index]}px`,
          height: `${[80, 20, 20, 60, 20, 110, 150, 25, 15, 150][index]}px`,
          left: `${[25, 10, 70, 40, 65, 75, 35, 50, 20, 85][index]}%`,
          animationDelay: `${generateRandomDelay()}s`, // Random delay
          animationDuration: `${[25, 12, 25, 18, 25, 25, 25, 45, 35, 11][index]}s`,
          backgroundColor: '#ff3cac',
          backgroundImage: 'linear-gradient(225deg, #ff3cac 0%, #784ba0 50%, #2b86c5 100%)',
          animationName: 'animate',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          bottom: `-${generateRandomHeight()}px`, // Random height
        }}
      />
    ))}
  </ul>
  <div className="relative z-10">{children}</div>
</section>
  );
};

export default AnimatedBackground;
