import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  text: string;
  image: string;
  imageSource: 'facebook' | 'google' | 'local';
  name: string;
  role: string;
  rating: number;
  userId?: string;
  profileUrl?: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        text: "Encontré en esta plataforma la terapia que necesitaba. Mis dolores crónicos desaparecieron gracias a un terapeuta excepcional. La plataforma es rápida y muy confiable.",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        imageSource: 'facebook',
        name: "Carlos Pérez",
        role: "Ingeniero Civil",
        rating: 5,
        userId: "234567890",
        profileUrl: "https://facebook.com/carlosperez"
    },
    {
        id: 2,
        text: "Después de meses buscando soluciones, aquí encontré terapias holísticas que realmente me ayudaron. Los terapeutas son profesionales y la plataforma es fácil de usar.",
        image: "https://randomuser.me/api/portraits/women/32.jpg",
        imageSource: 'google',
        name: "María García",
        role: "Diseñadora Gráfica",
        rating: 5,
        userId: "345678901",
        profileUrl: "https://plus.google.com/+mariagarcia"
    },
    {
        id: 3,
        text: "La variedad de terapias disponibles es increíble. Pude sanar mi ansiedad gracias a los excelentes terapeutas. Recomiendo esta plataforma a todos.",
        image: "https://randomuser.me/api/portraits/men/54.jpg",
        imageSource: 'local',
        name: "Juan Rodríguez",
        role: "Maestro",
        rating: 5
    },
    
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const renderImageSource = (testimonial: Testimonial) => {
    switch (testimonial.imageSource) {
      case 'facebook':
        return (
          <a href={testimonial.profileUrl} target="_blank" rel="noopener noreferrer">
            <img src="/facebook-icon.png" alt="Facebook" className="w-6 h-6 absolute bottom-0 right-0" />
          </a>
        );
      case 'google':
        return (
          <a href={testimonial.profileUrl} target="_blank" rel="noopener noreferrer">
            <img src="/google-icon.png" alt="Google" className="w-6 h-6 absolute bottom-0 right-0" />
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-700 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Testimonios</h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${currentIndex * 50}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className={`w-full md:w-1/2 flex-shrink-0 px-4 ${
                    index === currentIndex || index === (currentIndex + 1) % testimonials.length ? 'block' : 'hidden md:block'
                  }`}
                >
                  <div className="bg-white rounded-lg shadow-lg p-6 relative mb-16 border-2 border-black">
                    <p className="text-black text-center text-lg mb-4">{testimonial.text}</p>
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-r-2 border-b-2 border-black"></div>
                  </div>
                  <div className="flex flex-col items-center mt-8">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                      <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                      {renderImageSource(testimonial)}
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-white font-bold">{testimonial.name}</p>
                      <p className="text-gray-300">{testimonial.role}</p>
                    </div>
                    <div className="flex mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating ? 'text-yellow-400' : 'text-gray-400'
                          }`}
                          fill={i < testimonial.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={prevTestimonial} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextTestimonial} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
