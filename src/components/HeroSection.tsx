'use client'

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { therapies } from '@/data/therapies';

interface Therapy {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: string[];
}

export default function HeroSection() {
  const stackRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const cards = Array.from(stack.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.classList.contains('card')
    ).reverse();

    cards.forEach(card => stack.appendChild(card));

    function moveCard() {
      if (!stack) return;
      const lastCard = stack.lastElementChild as HTMLElement;
      if (lastCard && lastCard.classList.contains('card')) {
        lastCard.classList.add('swap');

        setTimeout(() => {
          lastCard.classList.remove('swap');
          stack.insertBefore(lastCard, stack.firstElementChild);
        }, 1200);
      }
    }

    let autoplayInterval = setInterval(moveCard, 4000);

    stack.addEventListener('click', function (e) {
      const card = (e.target as HTMLElement).closest('.card');
      if (card && card === stack.lastElementChild) {
        clearInterval(autoplayInterval);
        moveCard();
        autoplayInterval = setInterval(moveCard, 4000);
      }
    });

    return () => clearInterval(autoplayInterval);
  }, []);

  const handleExploreTherapies = () => {
    if (user) {
      router.push('/terapias');
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="relative grid grid-cols-1 md:grid-cols-2 place-items-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/hero1.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
      <div className="content pl-8 md:pl-20 lg:pl-30 text-white select-none order-2 md:order-1 relative z-10">
        <h1 className="font-dancing text-5xl md:text-6xl lg:text-7xl font-bold mb-9 pl-2.5 gradient-text">
          Descubre el Bienestar Holístico
        </h1>
        <p className="text-base md:text-lg lg:text-xl leading-relaxed pr-4 md:pr-10 lg:pr-24">
          Encuentra la terapia perfecta para tu cuerpo, mente y espíritu. En nuestro centro, ofrecemos una variedad de terapias holísticas diseñadas para mejorar tu bienestar general y ayudarte a alcanzar un equilibrio en tu vida.
        </p>
        <button 
          onClick={handleExploreTherapies}
          className="btn mt-6.5 px-5 py-2.5 bg-gradient-to-b from-[#ffc16f] to-[#f76591] text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-98"
        >
          {user ? 'Explorar Terapias' : 'Comenzar Ahora'}
        </button>
      </div>

      <div className="stack relative w-[350px] h-[500px] md:w-[250px] md:h-[380px] lg:w-[350px] lg:h-[500px] order-1 md:order-2 z-10" ref={stackRef}>
        {therapies.slice(0, 6).map((therapy, index) => (
          <div key={index} className="card absolute top-1/2 left-1/2 w-full h-full rounded-3xl shadow-lg overflow-hidden">
            <div className="w-full h-full bg-white rounded-lg border-2 border-purple-500 shadow-md overflow-hidden flex flex-col">
              <div className="h-full relative" style={{ backgroundImage: `url(${therapy.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-70 p-4 rounded-b-lg">
                  <h3 className="text-xl font-semibold mb-2 text-center text-white">{therapy.name}</h3>
                  <p className="text-gray-200 text-sm mb-4 text-center">{therapy.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {therapy.categories.map(category => (
                      <span key={category} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap');

        * {
          font-family: 'Quicksand', sans-serif;
        }

        .font-dancing {
          font-family: 'Dancing Script', cursive;
        }

        .gradient-text {
          background: linear-gradient(0deg, #f76591, #ffc16f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .btn:hover {
          box-shadow: 0 4px 10px rgba(247, 101, 145, 0.5);
          transform: scale(0.98);
        }

        .card {
          transform: translate(-50%, -50%);
          box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.25),
            0 15px 20px 0 rgba(0, 0, 0, 0.125);
          transition: transform 0.6s;
          user-select: none;
        }

        .card:nth-last-child(n + 5) {
          --x: calc(-50% + 90px);
          transform: translate(var(--x), -50%) scale(0.85);
          box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.01);
        }

        .card:nth-last-child(4) {
          --x: calc(-50% + 60px);
          transform: translate(var(--x), -50%) scale(0.9);
        }

        .card:nth-last-child(3) {
          --x: calc(-50% + 30px);
          transform: translate(var(--x), -50%) scale(0.95);
        }

        .card:nth-last-child(2) {
          --x: calc(-50%);
          transform: translate(var(--x), -50%) scale(1);
        }

        .card:nth-last-child(1) {
          --x: calc(-50% - 30px);
          transform: translate(var(--x), -50%) scale(1.05);
        }

        .card:nth-last-child(1) img {
          box-shadow: 0 1px 5px 5px rgba(255, 193, 111, 0.5);
        }

        .swap {
          animation: swap 1.3s ease-out forwards;
        }

        @keyframes swap {
          30% {
            transform: translate(calc(var(--x) - 250px), -50%) scale(0.85) rotate(-5deg)
              rotateY(65deg);
          }
          100% {
            transform: translate(calc(var(--x) - 30px), -50%) scale(0.5);
            z-index: -1;
          }
        }

        @media (max-width: 1200px) {
          @keyframes swap {
            30% {
              transform: translate(calc(var(--x) - 200px), -50%) scale(0.85)
                rotate(-5deg) rotateY(65deg);
            }
            100% {
              transform: translate(calc(var(--x) - 30px), -50%) scale(0.5);
              z-index: -1;
            }
          }
        }

        @media (max-width: 1050px) {
          @keyframes swap {
            30% {
              transform: translate(calc(var(--x) - 150px), -50%) scale(0.85)
                rotate(-5deg) rotateY(65deg);
            }
            100% {
              transform: translate(calc(var(--x) - 30px), -50%) scale(0.5);
              z-index: -1;
            }
          }
        }

        @media (max-width: 950px) {
          main {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
          }

          .content {
            text-align: center;
            padding: 2rem 1rem;
          }

          .btn {
            margin-bottom: 30px;
          }
        }

        @media (max-width: 650px) {
          .content {
            padding: 2rem 1rem;
          }

          .content h1 {
            padding-left: 0;
          }

          .btn {
            padding: 8px 16px;
          }

          .stack {
            width: 180px;
            height: 260px;
          }
        }
      `}</style>
    </main>
  );
}
