'use client'

import React, { useState, useEffect } from 'react';
import TherapyShowcase from '@/components/TherapyShowcase';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import AnimatedSection from '@/components/AnimatedSection';
import Parallax from '@/components/Parallax';
import LoginRegisterModal from '@/components/LoginRegisterModal';
import { therapies } from '@/data/therapies';
import HeroSection from '@/components/HeroSection';
import AnimatedBackground from '@/components/AnimatedBackground';
import TherapistShowcase from '@/components/TherapistShowcase';
import BlogList from '@/components/BlogList';
import { getBlogPosts } from '@/lib/api';
import { BlogPost } from '@/types/BlogPost';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState<BlogPost[]>([]);

    const toggleLoginPopup = () => setIsLoginOpen(!isLoginOpen);

    useEffect(() => {
        setMounted(true);

        // Fetch blog posts
        const fetchPosts = async () => {
            const fetchedPosts = await getBlogPosts();
            setPosts(fetchedPosts);
        };

        fetchPosts();
    }, []);

    if (!mounted) {
        return null; // or a loading spinner
    }

    const testimonials = [
        { id: '1', name: 'María L.', text: 'Las terapias holísticas cambiaron mi vida. Me siento más equilibrada y feliz.' },
        { id: '2', name: 'Carlos R.', text: 'Increíble experiencia. Los terapeutas son verdaderos profesionales.' },
        { id: '3', name: 'Ana S.', text: 'Recomiendo totalmente estos tratamientos. Han mejorado mi calidad de vida.' },
        { id: '4', name: 'Juan P.', text: 'Nunca pensé que las terapias alternativas pudieran ser tan efectivas. Estoy gratamente sorprendido.' },
    ];

    const therapists = [
        { id: '1', name: 'Dr. Juan Pérez', specialty: 'Acupuntura', image: '/images/juan-perez.jpg', bio: 'Especialista en acupuntura con 10 años de experiencia.' },
        { id: '2', name: 'Lic. Laura Gómez', specialty: 'Terapia Floral', image: '/images/laura-gomez.jpg', bio: 'Experta en terapia floral y aromaterapia.' },
        { id: '3', name: 'Mtro. Roberto Sánchez', specialty: 'Yoga', image: '/images/roberto-sanchez.jpg', bio: 'Maestro de yoga con enfoque en mindfulness.' },
    ];

    const featuredTherapy = therapies[0];

    return (
        <div className="min-h-screen flex flex-col">
            <Header toggleLoginPopup={toggleLoginPopup} />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/hero1.jpg')" }}>
                    <HeroSection />
                </section>

                {/* Therapy Showcase */}
                <AnimatedBackground>
                    <section className="py-16">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl font-bold mb-8 text-center text-white">Nuestras Terapias</h2>

                            <AnimatedSection>
                                <TherapyShowcase therapies={therapies} />
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedBackground>

                {/* Parallax Section */}
                <Parallax image="/images/parallax-background.jpg">
                    <h2 className="text-4xl font-bold text-center">Descubre la Armonía Interior</h2>
                </Parallax>

                {/* Testimonials */}
                <section >             
                    <TestimonialCarousel />
                </section>

                {/* Therapists Showcase */}
                <section>
                    <div>
                        <TherapistShowcase />
                    </div>
                </section>

                {/* Blog Showcase */}
                <section className="py-16 bg-gradient-to-b from-pink-500 to-orange-400">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Latest Blog Posts</h2>
                        <BlogList posts={posts} />
                    </div>
                </section>
            </main>

            <Footer 
                primaryColor="#06b6d4"
                waveColor1="0e7490"
                waveColor2="06b6d4"
                waveColor3="22d3ee"
                waveColor4="67e8f9"
            />

            <LoginRegisterModal isOpen={isLoginOpen} togglePopup={toggleLoginPopup} />

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sofia&display=swap');
            `}</style>
        </div>
    );
}