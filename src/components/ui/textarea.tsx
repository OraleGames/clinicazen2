import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder?: string;
}

const Textarea: React.FC<TextareaProps> = ({ placeholder, ...rest }) => {
  return (
    <textarea
      className="block w-64 mx-auto p-4 text-center text-lg text-white bg-white bg-opacity-20 border border-white border-opacity-40 rounded-md transition-all duration-250 ease-in-out hover:bg-opacity-40 focus:bg-white focus:w-72 focus:text-green-500"
      placeholder={placeholder}
      {...rest}
    />
  );
};

export default Textarea;
