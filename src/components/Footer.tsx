import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

interface FooterProps {
  primaryColor: string;
  waveColor1: string;
  waveColor2: string;
  waveColor3: string;
  waveColor4: string;
}

const Footer: React.FC<FooterProps> = ({ 
  primaryColor = "#06b6d4", 
  waveColor1 = "0e7490", 
  waveColor2 = "06b6d4", 
  waveColor3 = "22d3ee", 
  waveColor4 = "67e8f9" 
}) => {
  const quickLinks = [
    { href: "/", label: "Inicio" },
    { href: "/terapias", label: "Terapias" },
    { href: "/terapeutas", label: "Terapeutas" },
    { href: "/blog", label: "Blog" },
    { href: "/contacto", label: "Contacto" },
    { href: "/about", label: "Acerca de" },
    { href: "/terminos-y-condiciones", label: "Términos y Condiciones" },
    { href: "/politica-de-privacidad", label: "Política de Privacidad" },
  ];

  const socialLinks = [
    { href: "#", icon: FaFacebook, label: "Facebook" },
    { href: "#", icon: FaInstagram, label: "Instagram" },
    { href: "#", icon: FaTwitter, label: "Twitter" },
  ];

  return (
    <footer className="relative w-full pt-[100px] pb-5 px-4 md:px-12 text-white" style={{ backgroundColor: primaryColor }}>
      <style jsx>{`
        .waves {
          position: absolute;!important;
          top: -100px;!important;
          left: 0;!important;
          width: 100%;!important;
          height: 100px;!important;
          overflow: hidden;!important;
        }
        .wave {
          position: absolute;!important;
          bottom: 0;!important;
          left: 0;!important;
          width: 100%;!important;
          height: 100px;!important;
          background-size: 1000px 100px;!important;
        }
        #wave1 {
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%23${waveColor1}'/%3E%3C/svg%3E");!important;
          z-index: 1000;!important;
          opacity: 1;!important;
          bottom: 0;!important;
          animation: animateWave 4s linear infinite;!important;
        }
        #wave2 {
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%23${waveColor2}'/%3E%3C/svg%3E");!important;
          z-index: 999;!important;
          opacity: 0.5;!important;
          bottom: 10px;!important;
          animation: animateWave_02 4s linear infinite;!important;
        }
        #wave3 {
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%23${waveColor3}'/%3E%3C/svg%3E");!important;
          z-index: 1000;!important;
          opacity: 0.2;!important;
          bottom: 15px;!important;
          animation: animateWave 3s linear infinite;!important;
        }
        #wave4 {
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%23${waveColor4}'/%3E%3C/svg%3E");!important;
          z-index: 999;!important;
          opacity: 0.7;!important;
          bottom: 20px;!important;
          animation: animateWave_02 3s linear infinite;!important;
        }
        @media (max-width: 768px) {
          .waves {
            height: 40px;!important;
          }
          .wave {
            height: 40px;!important;
          }
        }
      `}</style>

      <div className="waves">
        <div className="wave" id="wave1"></div>
        <div className="wave" id="wave2"></div>
        <div className="wave" id="wave3"></div>
        <div className="wave" id="wave4"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="grid grid-cols-2 gap-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-blue-200 transition duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contacto</h3>
            <p className="mb-2">Email: clinicazenqro@gmail.com</p>
            <p className="mb-2">Teléfono: +52 4461399015</p>
            <p>Dirección: Av. Hidalgo 275, Las Campanas Querétaro Qro.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-2xl hover:text-blue-200 transition duration-300"
                  aria-label={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} Clinica ZEN. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
