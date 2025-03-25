import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Utensils,
    Users,
    Building2,
    Leaf,
    Heart,
    MapPin,
} from "lucide-react";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <header
                className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                    scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
                }`}
            >
                <div className="container mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                <Utensils className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl">Rescue Bite</span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8 text-sm">
                        <a
                            href="#how-it-works"
                            className="text-gray-600 hover:text-black"
                        >
                            How It Works
                        </a>
                        <a
                            href="#features"
                            className="text-gray-600 hover:text-black"
                        >
                            Features
                        </a>
                        <a
                            href="#testimonials"
                            className="text-gray-600 hover:text-black"
                        >
                            Testimonials
                        </a>
                        <a
                            href="#faq"
                            className="text-gray-600 hover:text-black"
                        >
                            FAQ
                        </a>
                    </nav>

                    <div className="flex items-center space-x-2">
                        <Link
                            to="/auth/login"
                            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
                        >
                            Login
                        </Link>
                        <Link
                            to="/auth/signup"
                            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                <Leaf className="mr-1 h-4 w-4" />
                                <span>
                                    Reduce Food Waste, Help Your Community
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                                Share Food,{" "}
                                <span className="text-green-600">
                                    Not Waste
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600">
                                Connect with your community to share surplus
                                food, reduce waste, and help those in need.
                                Whether you're a restaurant with leftovers or a
                                home cook with extra portions.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/auth?signup=true"
                                    className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-3 text-base font-medium text-white hover:bg-green-700"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Learn More
                                </a>
                            </div>

                            <div className="flex items-center space-x-4 pt-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs"
                                        >
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Joined by{" "}
                                    <span className="font-bold">2,000+</span>{" "}
                                    people and restaurants
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://media.istockphoto.com/id/1127769214/photo/zero-waste-shopping-concept.jpg?s=612x612&w=0&k=20&c=AE8mI6Jc16Wgico0nculuyKMMvKk62JakviABHJ2ECs="
                                    alt="Food sharing app"
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                    <div className="p-6 text-white">
                                        <p className="font-medium">
                                            Homemade Chocolate Cookies
                                        </p>
                                        <p className="text-sm opacity-80">
                                            0.8 miles away • Posted 2 hours ago
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="container mx-auto px-4 mt-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-white p-6 rounded-xl shadow-md text-center"
                        >
                            <p className="text-3xl font-bold text-green-600">
                                5,000+
                            </p>
                            <p className="text-gray-600 mt-1">
                                Food Items Shared
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            className="bg-white p-6 rounded-xl shadow-md text-center"
                        >
                            <p className="text-3xl font-bold text-green-600">
                                2,000+
                            </p>
                            <p className="text-gray-600 mt-1">Active Users</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            className="bg-white p-6 rounded-xl shadow-md text-center"
                        >
                            <p className="text-3xl font-bold text-green-600">
                                1,200kg
                            </p>
                            <p className="text-gray-600 mt-1">
                                Food Waste Saved
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.6 }}
                            className="bg-white p-6 rounded-xl shadow-md text-center"
                        >
                            <p className="text-3xl font-bold text-green-600">
                                150+
                            </p>
                            <p className="text-gray-600 mt-1">
                                Partner Restaurants
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            How FoodShare Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our platform connects those with surplus food to
                            those who can use it, reducing waste and building
                            community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="bg-gray-50 rounded-xl p-8 text-center"
                        >
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">
                                For Individuals
                            </h3>
                            <p className="text-gray-600">
                                Share your extra homemade meals, garden produce,
                                or unopened food items with neighbors and build
                                community connections.
                            </p>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            1
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Post your surplus food
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            2
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Connect with neighbors
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            3
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Arrange pickup or delivery
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-gray-50 rounded-xl p-8 text-center"
                        >
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Building2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">
                                For Restaurants
                            </h3>
                            <p className="text-gray-600">
                                Reduce waste and recover costs by selling
                                surplus food at a discount or donating it to
                                those in need.
                            </p>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            1
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        List your surplus inventory
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            2
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Set discounted prices
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            3
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Manage pickups efficiently
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-gray-50 rounded-xl p-8 text-center"
                        >
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">
                                For Donors
                            </h3>
                            <p className="text-gray-600">
                                Support our mission by becoming a secret donor.
                                Help us expand our platform and feed more people
                                in need.
                            </p>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            1
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Choose your donation amount
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            2
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Support local food initiatives
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                        <span className="text-green-600 text-xs font-bold">
                                            3
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Track your impact
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Key Features
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our platform is designed to make food sharing
                            simple, safe, and rewarding for everyone involved.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Interactive Map */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                                <MapPin className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                Interactive Food Map
                            </h3>
                            <p className="text-gray-600">
                                Discover available food near you with our
                                interactive map. Filter by distance, food type,
                                and more.
                            </p>
                        </motion.div>

                        {/* Trust System */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                Trust & Rating System
                            </h3>
                            <p className="text-gray-600">
                                Build your reputation with our trust score. Rate
                                and review your experiences to help the
                                community.
                            </p>
                        </motion.div>

                        {/* Real-time Notifications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-5">
                                <Utensils className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                Food Swapping
                            </h3>
                            <p className="text-gray-600">
                                Exchange your surplus food with others. Create a
                                circular economy of sharing in your community.
                            </p>
                        </motion.div>

                        {/* Restaurant Dashboard */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                                <Building2 className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                Restaurant Dashboard
                            </h3>
                            <p className="text-gray-600">
                                Specialized tools for restaurants to manage
                                surplus inventory, track donations, and reduce
                                waste.
                            </p>
                        </motion.div>

                        {/* Donation Tracking */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-5">
                                <Heart className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                Donation Platform
                            </h3>
                            <p className="text-gray-600">
                                Support our mission as a secret donor. Track
                                your impact and help us expand our reach.
                            </p>
                        </motion.div>

                        {/* Community Building */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                                <Leaf className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                Environmental Impact
                            </h3>
                            <p className="text-gray-600">
                                Track your contribution to reducing food waste
                                and see your environmental impact metrics.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-green-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Reduce Food Waste?
                        </h2>
                        <p className="text-xl mb-8">
                            Join our community today and start sharing food, not
                            wasting it. Together, we can make a difference.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/auth/signup"
                                className="inline-flex items-center justify-center rounded-md bg-white text-green-600 px-6 py-3 text-base font-medium hover:bg-gray-100"
                            >
                                Sign Up Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                to="/donor"
                                className="inline-flex items-center justify-center rounded-md border border-white px-6 py-3 text-base font-medium text-white hover:bg-green-700"
                            >
                                Become a Donor
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                    <Utensils className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-xl">
                                    FoodShare
                                </span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Reducing food waste and building community
                                through sharing.
                            </p>
                            <div className="flex space-x-4">
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">
                                Company
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Our Mission
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Press
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">
                                Resources
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Community Guidelines
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Food Safety Tips
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Partner Program
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Cookie Policy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Accessibility
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
                        <p>
                            &copy; {new Date().getFullYear()} FoodShare. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
