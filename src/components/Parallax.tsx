import React from 'react';

interface ParallaxProps {
  image: string;
  children: React.ReactNode;
}

const Parallax: React.FC<ParallaxProps> = ({ image, children }) => {
  return (
    <div
      className="parallax-container"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // This creates the parallax effect
        height: '50vh', // Adjust as needed
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white', // Adjust text color as needed
      }}
    >
      {children}
    </div>
  );
};

export default Parallax;
