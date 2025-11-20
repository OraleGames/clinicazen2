'use client'

import React from 'react';

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
  return (
    <div className="p-8 h-full flex flex-col justify-center items-center">
      <h2 className="text-green-500 text-3xl font-semibold mb-6 text-center">{message}</h2>
    </div>
  );
};

export default SuccessMessage;
