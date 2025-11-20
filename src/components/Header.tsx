"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

interface HeaderProps {
    toggleLoginPopup: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleLoginPopup }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleAuthButtonClick = () => {
        if (user) {
            // User is logged in, go to dashboard
            const dashboardUrl = user.role ? `/dashboard/${user.role.toLowerCase()}` : '/dashboard';
            router.push(dashboardUrl);
        } else {
            // User not logged in, open login modal
            toggleLoginPopup();
        }
    };

    return (
<header className="animated-bg text-white py-4 filter drop-shadow-2xl">
    <div className="container mx-auto px-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center flex-shrink-0 mr-6">
            <Link href="/" className="flex items-center">
                <img src="/images/logo.png" alt="Logo" className="h-11 w-11 mr-2" />
                <span className="text-2xl font-bold">
                    <span className="text-purple-400 filter drop-shadow-2xl">CLINICA</span>ZEN
                </span>
            </Link>
        </div>
        <div className="block lg:hidden z-20">
            <button
                onClick={toggleMenu}
                className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white"
            >
                <Menu />
            </button>
        </div>
        <nav className={`w-full lg:flex lg:items-center lg:w-auto ${isMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <ul className="lg:flex lg:flex-grow">
                <li><Link href="/terapias" className="block mt-4 lg:inline-block lg:mt-0 mr-4 hover:text-green-300 transition-colors">Terapias</Link></li>
                <li><Link href="/nosotros" className="block mt-4 lg:inline-block lg:mt-0 mr-4 hover:text-green-300 transition-colors">Nosotros</Link></li>
                <li><Link href="/contacto" className="block mt-4 lg:inline-block lg:mt-0 mr-4 hover:text-green-300 transition-colors">Contacto</Link></li>
                <li><Link href="/blog" className="block mt-4 lg:inline-block lg:mt-0 mr-4 hover:text-green-300 transition-colors">Blog</Link></li>
            </ul>
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
                {user && <NotificationBell />}
                <button
                    onClick={handleAuthButtonClick}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    {user ? 'Entrar' : 'Iniciar Sesión'}
                </button>
            </div>
        </nav>
    </div>
</header>
    );
};

export default Header;
