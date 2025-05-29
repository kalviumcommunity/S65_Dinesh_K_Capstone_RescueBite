import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, UtensilsCrossed, Users, Gift, Info, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TabDashboardContent from './TabDashboardContent';

const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1735149681960-9120da76de22?auto=format&fit=crop&w=1600&q=100";
const BACKGROUND_COLOR = 'bg-gray-50';
const PRIMARY_BUTTON_COLOR = 'bg-green-600 hover:bg-green-700 text-white';
const SECONDARY_BUTTON_COLOR = 'bg-orange-500 hover:bg-orange-600 text-white';
const TEXT_COLOR_DARK = 'text-gray-800';
const TEXT_COLOR_MEDIUM = 'text-gray-600';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 }
    },
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
};

const sectionFadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const MotionButton = ({ children, className, ...props }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-300 ${className}`}
        {...props}
    >
        {children}
    </motion.button>
);


const HeroSection = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/auth/login');
    };

    const handleSignupClick = () => {
        navigate('/auth/signup');
    };

    return (
        <motion.section
            id="home"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="relative h-screen w-full font-serif overflow-hidden"
        >
            {/* Background image with better image handling */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={HERO_IMAGE_URL}
                    alt="Food rescue community background"
                    className="w-full h-full object-cover"
                    style={{filter: 'brightness(0.97)'}}
                    loading="eager"
                    fetchpriority="high"
                />
            </div>
            
            {/* Logo/Brand */}
            <div className="absolute top-8 left-10 z-20 text-white">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide">
                    Rescue<br />Bite
                </h1>
            </div>
            
            {/* Navigation */}
            <div className="absolute top-12 right-10 z-20">
                <ul className="flex space-x-6">
                    <li>
                        <button onClick={handleLoginClick} className="text-white hover:text-amber-200 transition-colors duration-300 border-b border-white pb-1">
                            Login
                        </button>
                    </li>
                    <li>
                        <button onClick={handleSignupClick} className="text-white hover:text-amber-200 transition-colors duration-300 border-b border-white pb-1">
                            Signup
                        </button>
                    </li>
                </ul>
            </div>
            
            {/* Bottom Left - App Message */}
            <div className="absolute bottom-10 left-10 z-20 text-left text-white font-serif">
                <div className="flex items-center">
                    <span className="mr-2">🍽️</span>
                    <div>
                        <p className="text-lg md:text-xl font-light">Join the movement.</p>
                        <p className="text-lg md:text-xl font-light">Rescue food. Feed people.</p>
                    </div>
                </div>
            </div>
            
            {/* Bottom Right - Description */}
            <div className="absolute bottom-10 right-10 z-20 text-right text-white">
                <p className="text-xl font-light">Share surplus food. Build a caring community. Reduce waste.</p>
                <div className="flex justify-end items-center mt-1">
                    <a href="#how-it-works" className="text-white hover:text-green-200 transition-colors mr-2 underline">
                        How it works
                    </a>
                    <span>or</span>
                    <a href="#secret-donor" className="text-white hover:text-green-200 transition-colors ml-2 underline">
                        Become a donor
                    </a>
                </div>
            </div>
        </motion.section>
    );
};

    
const TabletShowcaseSection = () => {
    return (
        <motion.section
            id="app-showcase"
            initial={{ opacity: 0, y: 200 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 14, bounce: 0.35 }}
            viewport={{ once: true, amount: 0.3 }}
            className="py-16 md:py-24 px-6 md:px-12 lg:px-20"
        >
            <div className="max-w-6xl mx-auto">
                <div className="relative mx-auto" style={{ maxWidth: '1200px' }}>
                    {/* iPad Bezel - Larger */}
                    <div className="bg-black rounded-[42px] p-6 shadow-xl" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
                        {/* Front camera - properly centered */}
                        <div className="flex justify-center mb-3">
                            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                        </div>
                        {/* Screen with dashboard UI - Larger aspect ratio */}
                        <div className="bg-white rounded-[24px] p-4 aspect-[16/10] overflow-hidden shadow-inner">
                            <div className="w-full h-full">
                                <TabDashboardContent />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};


const ImpactSection = () => (
  <section className="w-full bg-white py-20 pb-48 px-4 md:px-0 flex flex-col items-start">
    <div className="max-w-5xl w-full mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-400 mb-2 font-sans text-left">Beyond Just Sharing Food,</h2>
      <div className="flex items-center mb-8">
        <span className="inline-block w-1 h-16 bg-green-500 mr-4 rounded"></span>
        <span className="text-3xl md:text-5xl font-bold text-black tracking-tight text-left font-sans">RescueBite Empowers You To...</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-green-600 font-bold mb-1">Real-Time Food Rescue</span>
          <span className="text-gray-700 font-medium">Find and share surplus food instantly in your area.</span>
        </div>
        <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-green-600 font-bold mb-1">Verified Recipients</span>
          <span className="text-gray-700 font-medium">Connect with trusted individuals in need.</span>
        </div>
        <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-green-600 font-bold mb-1">Easy Donations</span>
          <span className="text-gray-700 font-medium">Support food rescue efforts with a single click.</span>
        </div>
        <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-green-600 font-bold mb-1">Community Impact</span>
          <span className="text-gray-700 font-medium">Track your positive impact and see real stories.</span>
        </div>
        <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-green-600 font-bold mb-1">Food Safety</span>
          <span className="text-gray-700 font-medium">Guidelines and tips to ensure safe sharing for all.</span>
        </div>
        <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-green-600 font-bold mb-1">Eco-Friendly</span>
          <span className="text-gray-700 font-medium">Reduce waste and help the planet with every rescue.</span>
        </div>
      </div>
    </div>
  </section>
);


const SecretDonorSection = () => (
  <section className="w-full bg-[#181A1B] py-24 px-4 flex flex-col items-center justify-center font-sans">
    <div className="max-w-4xl w-full flex flex-col items-center">
      <h2 className="text-lg md:text-xl text-gray-200 mb-4 text-center font-normal">Ready to Make a Difference?</h2>
      <div className="flex items-center mb-6">
        <span className="inline-block w-1 h-16 bg-green-500 mr-4 rounded"></span>
        <span className="text-4xl md:text-6xl font-bold text-white tracking-tight text-left">Rescue. Share. Impact.</span>
      </div>
      <button className="mt-6 bg-white text-black font-semibold px-8 py-3 rounded-full shadow hover:bg-gray-100 transition-all text-lg">
        Join as a Secret Donor
      </button>
    </div>
    <footer className="w-full max-w-4xl mx-auto mt-16 flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm border-t border-gray-700 pt-6">
      <span className="mb-2 md:mb-0">© {new Date().getFullYear()} RescueBite. All Rights Reserved.</span>
      <div className="flex space-x-4">
        <a href="#" className="hover:text-white">Privacy Policy</a>
        <a href="#" className="hover:text-white">Terms of Service</a>
        <a href="#" className="hover:text-white">Contact</a>
      </div>
    </footer>
  </section>
);

export default function LandingPage() {
    return (
        <div className={`flex flex-col min-h-screen antialiased ${BACKGROUND_COLOR}`}>
            <main className="flex-grow">
                <HeroSection />
                <TabletShowcaseSection />
                <ImpactSection />
                <SecretDonorSection />
            </main>
        </div>
    );
}
