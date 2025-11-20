import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import TherapistModal from './TherapistModal';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const therapists = [
  {
    name: "Psic. Odelia Gonzalez Quevedo",
    role: "Especialista en Psicología Clínica, Hipnosis y Biomagnetismo",
    desc: "Soy Odelia Gonzalez Quevedo, psicóloga clínica con más de 11 años de experiencia dedicada a ayudar a las personas a transformar sus vidas. Mi pasión es acompañar a mis clientes en su camino hacia una mejor salud física, emocional y espiritual. Me encanta ver cómo cambian sus perspectivas sobre la vida, mejoran sus relaciones y hasta su bienestar financiero.",
    photo: "/images/terapeutas/ode.jpg",
    info: "Psicologa Clinica e Hipnoterapeuta",
    especialidadesYServicios: [
      "Psicología Clínica",
      "Tanatología",
      "Hipnosis",
      "Biomagnetismo",
      "Terapias de Pareja",
      "Atención de Adicciones",
      "Duelos",
      "Depresión y Ansiedad",
      "Desintoxicación Iónica"
    ],
    beneficiosDeMisTerapias: [
      "Transformación de la Perspectiva de Vida",
      "Mejora en la Salud Física, Emocional y Espiritual",
      "Fortalecimiento de Relaciones Personales",
      "Reducción de Ansiedad y Depresión",
      "Superación de Adicciones",
      "Alivio de Dolores Crónicos",
      "Mejora en el Bienestar General"
    ],
    casoDeExito: "Atendí a un hombre de 48 años que sufría de ansiedad severa durante casi 3 años. Después de solo 5 sesiones de hipnosis, logró recuperarse por completo. Fue inspirador ver cómo retomó el control de su vida y mejoró su bienestar."
  },
  {
    name: "Pisc. Obdalis Andreina Linares Castellanos",
    role: "Especialista en Terapia de Aceptación y Compromiso, Terapia Cognitivo-Conductual y Mindfulness",
    desc: "Soy Obdalis Andreina Linares Castellanos, psicóloga con más de 1 año y 6 meses de experiencia. Me apasiona ver cómo mis clientes comienzan a conectar con su verdadero yo. Me dedico a guiarlos en un viaje de autoconocimiento profundo, unificando mente, cuerpo y alma, para que puedan descubrir quiénes son realmente y qué les hace felices.",
    photo: "/images/terapeutas/andry.jpg",
    info: "Psicóloga Especialista en ACT, TCC y Mindfulness",
    especialidadesYServicios: ["Terapia de Aceptación y Compromiso", "Terapia Cognitivo-Conductual", "Mindfulness"],
    beneficiosDeMisTerapias: ["Flexibilidad mental", "Reducción del estrés y la ansiedad", "Mejora en la regulación emocional", "Cambio de pensamientos negativos", "Autoconocimiento profundo", "Mejora de la autoestima", "Fortalecimiento de relaciones personales", "Resiliencia emocional", "Bienestar general"],
    casoDeExito: "Laura llegó a terapia sintiendo un vacío enorme tras la pérdida de alguien muy querido. Juntas exploramos sus dudas y miedos, y descubrió que su espiritualidad no tenía por qué encajar en un molde. Al final, encontró una forma de vivir que le brindaba paz y felicidad."
  },
  {
    name: "Psic. Ameyalli Bochent Sanchez",
    role: "Child Psychologist",
    desc: "Dr. Emily Brown specializes in child psychology, helping young minds navigate through developmental challenges. Her playful approach creates a safe and nurturing environment for children to express themselves.",
    photo: "/images/terapeutas/ame.jpg",
    info: "Psy.D. in Child Psychology, Play Therapy Certified",
    especialidadesYServicios: [
      "Psicología Clínica",
      "Tanatología",
      "Hipnosis",
      "Biomagnetismo",
      "Terapias de Pareja",
      "Atención de Adicciones",
      "Duelos",
      "Depresión y Ansiedad",
      "Desintoxicación Iónica"
    ],
    beneficiosDeMisTerapias: [
      "Transformación de la Perspectiva de Vida",
      "Mejora en la Salud Física, Emocional y Espiritual",
      "Fortalecimiento de Relaciones Personales",
      "Reducción de Ansiedad y Depresión",
      "Superación de Adicciones",
      "Alivio de Dolores Crónicos",
      "Mejora en el Bienestar General"
    ],
    casoDeExito: "Atendí a un hombre de 48 años que sufría de ansiedad severa durante casi 3 años. Después de solo 5 sesiones de hipnosis, logró recuperarse por completo. Fue inspirador ver cómo retomó el control de su vida y mejoró su bienestar."
  },
  {
    name: "Dr. Emilio Café",
    role: "Child Psycho",
    desc: "Dr. Emilio café specializes in child psychology, helping young minds navigate through developmental challenges. Her playful approach creates a safe and nurturing environment for children to express themselves.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=compress&cs=tinysrgb&dpr=2&h=300&w=300",
    info: "Psy.D. in Child Psychology, Play Therapy Certified",
    especialidadesYServicios: [
      "Psicología Clínica",
      "Tanatología",
      "Hipnosis",
      "Biomagnetismo",
      "Terapias de Pareja",
      "Atención de Adicciones",
      "Duelos",
      "Depresión y Ansiedad",
      "Desintoxicación Iónica"
    ],
    beneficiosDeMisTerapias: [
      "Transformación de la Perspectiva de Vida",
      "Mejora en la Salud Física, Emocional y Espiritual",
      "Fortalecimiento de Relaciones Personales",
      "Reducción de Ansiedad y Depresión",
      "Superación de Adicciones",
      "Alivio de Dolores Crónicos",
      "Mejora en el Bienestar General"
    ],
    casoDeExito: "Atendí a un hombre de 48 años que sufría de ansiedad severa durante casi 3 años. Después de solo 5 sesiones de hipnosis, logró recuperarse por completo. Fue inspirador ver cómo retomó el control de su vida y mejoró su bienestar."
  },
];

export default function TherapistShowcase() {
  const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);

  return (
    <div className="therapist-wrapper bg-white">
      <section className="relative py-12 md:py-24 lg:py-32">
        <div className="absolute inset-0 h-[350px] bg-gray-50 sm:h-[250px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-20 text-4xl font-bold tracking-tight text-gray-600 uppercase relative flex justify-center items-start h-24 sm:h-16 sm:text-3xl">
            Conoce a nuestros Terapeutas
            <span className="absolute bottom-0 w-20 h-2.5 bg-gray-600 opacity-20 rounded-full sm:w-16 sm:h-1" />
          </h2>

          <div className="relative flex justify-center items-center overflow-visible">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={100}
              slidesPerView={3}
              navigation={true}
              pagination={{ clickable: true }}
              centeredSlides={therapists.length < 4} // Center slides only if there are fewer than 4 slides
              breakpoints={{
                1440: { slidesPerView: 4, spaceBetween: 40 },
                1024: { slidesPerView: 3, spaceBetween: 40 },
                768: { slidesPerView: 2, spaceBetween: 40 },
                480: { slidesPerView: 1, spaceBetween: 20, centeredSlides: true, loop: true }
              }}
              className="therapist-swiper max-w-[1400px] h-[400px] px-5 cursor-default"
            >
              <style>
                {`
                  .therapist-wrapper .therapist-swiper {
                    padding: 0 50px !important;
                    position: relative !important;
                    
                  }
                  
                  .therapist-wrapper .swiper-button-next,
                  .therapist-wrapper .swiper-button-prev {
                    width: 40px !important;
                    height: 40px !important;
                    background-color: white !important;
                    border-radius: 50% !important;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                    transition: all 0.3s ease !important;
                    position: absolute !important;
                    z-index: 10 !important;
                    
                  }
                  
                  .therapist-wrapper .swiper-button-next:hover,
                  .therapist-wrapper .swiper-button-prev:hover {
                    background-color: #f8f8f8 !important;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
                  }
                  
                  .therapist-wrapper .swiper-button-next::after,
                  .therapist-wrapper .swiper-button-prev::after {
                    font-size: 18px !important;
                    color: #666 !important;
                  }
                  
                  .therapist-wrapper .swiper-button-next {
                    right: 0 !important;
                  }
                  
                  .therapist-wrapper .swiper-button-prev {
                    left: 0 !important;
                  }
                  
                  .therapist-wrapper .swiper-pagination {
                    bottom: -30px !important;
                  }
                  
                  .therapist-wrapper .swiper-pagination-bullet {
                    width: 8px !important;
                    height: 8px !important;
                    background-color: #D45B7A !important;
                    opacity: 0.3 !important;
                  }
                  
                  .therapist-wrapper .swiper-pagination-bullet-active {
                    opacity: 1 !important;
                    background-color: #D45B7A !important;
                  }
                  
                  .therapist-wrapper .card-container {
                    transform-origin: center center !important;
                    transition: transform 0.3s ease-out !important;
                    margin: 0 auto !important;
                  }
                  
                  .therapist-wrapper .card-container:hover {
                    transform: translateY(-24px) !important;
                  }
                  
                  .therapist-wrapper .therapist-card {
                    background: white !important;
                    border-radius: 0.5rem !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                    overflow: hidden !important;
                    position: relative !important;
                    height: 100% !important;
                    width: 100% !important;
                  }
                  
                  .therapist-wrapper .card-header {
                    height: 6rem !important;
                    background: linear-gradient(to right, #D45B7A, #FDA576) !important;
                  }
                  
                  .therapist-wrapper .profile-image {
                    position: absolute !important;
                    top: 2.5rem !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: 7rem !important;
                    height: 7rem !important;
                    border-radius: 9999px !important;
                    border: 3px solid white !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                    overflow: hidden !important;
                  }
                  
                  @media (max-width: 768px) {
                    .therapist-wrapper .therapist-swiper {
                      padding: 0 30px !important;
                    }
                    
                    .therapist-wrapper .swiper-button-next,
                    .therapist-wrapper .swiper-button-prev {
                      width: 30px !important;
                      height: 30px !important;
                    }
                    
                    .therapist-wrapper .swiper-button-next::after,
                    .therapist-wrapper .swiper-button-prev::after {
                      font-size: 14px !important;
                    }
                  }
                `}
              </style>

              {therapists.map((therapist, index) => (
                <SwiperSlide key={index}>
                  <div
                    onClick={() => setSelectedTherapist(index)}
                    className="card-container relative w-[320px] h-[400px] cursor-pointer"
                  >
                    <div className="therapist-card">
                      <div className="card-header" />
                      <div className="profile-image">
                        <img
                          src={therapist.photo}
                          alt={therapist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-52 left-0 right-0 text-center">
                        <h3 className="text-2xl font-light text-gray-600">{therapist.name}</h3>
                        <p className="text-base font-semibold tracking-wide mt-1 text-gray-400">{therapist.role}</p>
                      </div>
                      <div className="absolute bottom-0 w-full h-16 bg-gray-100 flex items-center px-4">
                        <p className="text-base text-gray-600">{therapist.info}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {selectedTherapist !== null && (
        <TherapistModal
          therapist={therapists[selectedTherapist]}
          onClose={() => setSelectedTherapist(null)}
        />
      )}
    </div>
  );
}
