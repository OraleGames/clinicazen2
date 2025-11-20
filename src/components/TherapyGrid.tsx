'use client'

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Therapy } from '../types/therapy';
import ReactMarkdown from 'react-markdown';
import styles from '../app/terapias/therapies.module.css';

interface TherapyGridProps {
  therapies: Therapy[];
}

export default function TherapyGrid({ therapies }: TherapyGridProps) {
  const [selectedTherapy, setSelectedTherapy] = useState<Therapy | null>(null);

  const closeModal = useCallback(() => {
    setSelectedTherapy(null);
  }, []);

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {therapies.map((therapy) => (
          <div
            key={therapy.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedTherapy(therapy)}
          >
            <Image
              src={therapy.image}
              alt={therapy.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{therapy.name}</h3>
              <p className="text-gray-600 line-clamp-3">{therapy.extendedDescription}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedTherapy && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">{selectedTherapy.name}</h2>
              <Image
                src={selectedTherapy.image}
                alt={selectedTherapy.name}
                width={800}
                height={400}
                className="w-full h-64 object-cover mb-4 rounded"
              />
              <div className={`prose prose-lg max-w-none text-gray-800 ${styles.therapyContent}`}>
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4 text-gray-800" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3 text-gray-800" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-800 mb-4" {...props} />,
                  }}
                >
                  {selectedTherapy.fullDescription}
                </ReactMarkdown>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={closeModal}
                >
                  Close
                </button>
                <Link href={`/terapias/${selectedTherapy.slug}`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded">
                  View Full Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
