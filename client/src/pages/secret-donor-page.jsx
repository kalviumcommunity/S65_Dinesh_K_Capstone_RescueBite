import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    DollarSign,
    Calendar,
    CreditCard,
    Lock,
    Shield,
    Check,
    ArrowRight,
    ArrowLeft,
    ChevronLeft,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const donationOptions = [
    { id: 1, amount: 100, label: "₹100" },
    { id: 2, amount: 250, label: "₹250" },
    { id: 3, amount: 500, label: "₹500" },
    { id: 4, amount: 1000, label: "₹1000" },
    { id: 5, amount: 2000, label: "₹2000" },
    { id: 6, amount: 0, label: "Custom" },
];

const impactStats = [
    { id: 1, value: "2,450", label: "Meals Provided" },
    { id: 2, value: "128", label: "Families Helped" },
    { id: 3, value: "1,200", label: "Kg Food Saved" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } },
};

const popUp = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const buttonHoverTap = {
    hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 15 } },
    tap: { scale: 0.95 },
};

export default function SecretDonorPage() {
    const [selectedAmount, setSelectedAmount] = useState(donationOptions[2].amount);
    const [customAmount, setCustomAmount] = useState("");
    const [donationFrequency, setDonationFrequency] = useState("one-time");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                        headers: { "x-auth-token": token }
                    });

                    if (response.data.success && response.data.user) {
                        const user = response.data.user;
                        setUserDetails({
                            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                            email: user.email || "",
                            phone: user.phone || ""
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }
            };
            fetchUserDetails();
        }
        else {
            setUserDetails({
                 name: "Generous Donor",
                 email: "donor@example.com",
                 phone: "",
            })
        }
    }, []);

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        if (amount === 0) {
            setCustomAmount("");
        }
    };

    const finalAmount = selectedAmount === 0
        ? Number.parseFloat(customAmount) || 0
        : selectedAmount;

    const handlePayment = async () => {
        if (finalAmount <= 0) {
            toast.error("Please enter a valid donation amount.");
            return;
        }

        try {
            setLoading(true);

            const { data } = await axios.post(
                `${API_BASE_URL}/api/pay/checkout`,
                { total: finalAmount }
            );

            if (!data.success || !data.order) {
                 console.error("Backend order creation failed:", data);
                throw new Error(data.message || "Failed to create payment order");
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Lvyx7TybXsDiFV",
                amount: data.order.amount,
                currency: "INR",
                name: "Rescue Bite",
                description: `${donationFrequency === 'monthly' ? 'Monthly' : 'One-time'} Donation`,
                order_id: data.order.id,

                handler: function (response) {
                    console.log("Razorpay successful response:", response);
                    const token = localStorage.getItem("token");

                    const donationData = {
                        ...(token && { donor: response.data?.user?.id }),
                        isAnonymous: !token,
                        amount: finalAmount,
                        currency: "INR",
                        paymentMethod: "razorpay",
                        paymentId: response.razorpay_payment_id,
                        frequency: donationFrequency,
                        message: "Thank you for your generous donation!",
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    };

                    axios.post(
                        `${API_BASE_URL}/api/donations/verify-payment`,
                        donationData,
                        token ? { headers: { "x-auth-token": token } } : {}
                    )
                    .then((res) => {
                        console.log('Donation verification and recording successful:', res.data);
                        toast.success('Thank you! Your donation is confirmed.');

                        setStep(1);
                        setSelectedAmount(donationOptions[2].amount);
                        setCustomAmount("");
                        setDonationFrequency("one-time");
                        navigate("/donor?success=true");
                    })
                    .catch((err) => {
                        console.error('Error verifying/recording donation:', err.response?.data || err.message);
                        toast.error('Payment successful, but failed to record donation. Please contact support with your payment ID.');
                    });
                },

                prefill: {
                    name: userDetails.name || "Generous Donor",
                    email: userDetails.email || undefined,
                    contact: userDetails.phone || undefined,
                },
                theme: { color: "#1f2937" },

                modal: {
                    ondismiss: function() {
                        console.log('Razorpay modal closed');
                    }
                },
                 notes: {
                    frequency: donationFrequency,
                    source: 'SecretDonorPage'
                }
            };

            const rzp = new window.Razorpay(options);

             rzp.on('payment.failed', function (response) {
                 console.error('Razorpay payment.failed response:', response.error);
                 toast.error(`Payment Failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
                 setLoading(false);
             });

            rzp.open();

        } catch (error) {
            console.error("Payment initialization or backend error:", error);
            toast.error(error.message || "Payment setup failed. Please try again.");
            setLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-4xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={pageVariants}
            >
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/customer")}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="text-center mb-12">
                     <motion.h1
                         className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900"
                         variants={popUp}
                    >
                        Become a Secret Food Hero
                    </motion.h1>
                    <motion.p
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                         variants={popUp}
                         custom={1}
                    >
                        Your generosity fuels our mission to fight food waste and hunger. Every contribution makes a difference in our community.
                    </motion.p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="md:flex">
                        {/* Left Side: Donation Form Steps */}
                        <div className="md:w-2/3 p-6 md:p-10">
                            <AnimatePresence mode="wait"> {/* Handles step transitions */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={stepVariants}
                                    >
                                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                                            Choose Your Donation
                                        </h2>

                                        {/* Donation Amount Selection */}
                                        <motion.div
                                             className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
                                             variants={staggerContainer} initial="hidden" animate="visible"
                                         >
                                            {donationOptions.map((option) => (
                                                <motion.button
                                                    key={option.id}
                                                    className={`py-4 px-2 rounded-lg border-2 text-center font-medium transition-colors duration-200 ${
                                                        selectedAmount === option.amount
                                                            ? "border-gray-900 bg-gray-900 text-white shadow-md"
                                                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                                                    }`}
                                                    onClick={() => handleAmountSelect(option.amount)}
                                                    variants={popUp} 
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                >
                                                    {option.label}
                                                </motion.button>
                                            ))}
                                        </motion.div>

                                        {/* Custom Amount Input */}
                                        {selectedAmount === 0 && (
                                            <motion.div
                                                 className="mb-8"
                                                 initial={{ opacity: 0, y: -10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ duration: 0.3 }}
                                             >
                                                <label
                                                    htmlFor="custom-amount"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Enter custom amount (₹)
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500">₹</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        id="custom-amount"
                                                        className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800 focus:border-gray-800 text-lg"
                                                        placeholder="e.g., 150"
                                                        value={customAmount}
                                                        onChange={(e) => setCustomAmount(e.target.value)}
                                                        min="1" // Basic validation
                                                        step="10"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Donation Frequency */}
                                        <div className="mb-10">
                                            <h3 className="text-base font-medium text-gray-800 mb-3">
                                                Donation Frequency
                                            </h3>
                                            <div className="flex space-x-4">
                                                {['one-time', 'monthly'].map((freq) => (
                                                     <motion.label
                                                        key={freq}
                                                        className={`flex items-center px-5 py-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                                                            donationFrequency === freq
                                                                ? 'border-gray-900 bg-gray-100'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                         whileHover={{ scale: 1.03 }}
                                                    >
                                                        <input
                                                            type="radio"
                                                            className="h-4 w-4 text-gray-900 focus:ring-gray-800 border-gray-400"
                                                            checked={donationFrequency === freq}
                                                            onChange={() => setDonationFrequency(freq)}
                                                        />
                                                        <span className="ml-3 text-sm font-medium text-gray-800 capitalize">
                                                            {freq.replace('-', ' ')}
                                                        </span>
                                                    </motion.label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Continue Button */}
                                        <motion.button
                                            className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => setStep(2)}
                                            disabled={finalAmount <= 0}
                                            variants={buttonHoverTap}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            Continue to Payment
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </motion.button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={stepVariants}
                                    >
                                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                                            Confirm Your Donation
                                        </h2>

                                        <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                                            <p className="text-base text-gray-700 leading-relaxed">
                                                You're about to make a{' '}
                                                <span className="font-semibold text-gray-900">{donationFrequency === "monthly" ? "recurring monthly" : "one-time"}</span> donation of{' '}
                                                <span className="font-semibold text-gray-900">₹{finalAmount.toFixed(2)}</span>.
                                                 Click below to proceed to our secure payment gateway.
                                            </p>


                                        </div>

                                        {/* Payment Button */}
                                        <motion.button
                                            onClick={handlePayment}
                                            disabled={loading}
                                            className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-wait"
                                             variants={buttonHoverTap}
                                             whileHover="hover"
                                             whileTap="tap"
                                        >
                                            {loading ? (
                                                <>
                                                  <motion.div
                                                      animate={{ rotate: 360 }}
                                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                      style={{ width: 20, height: 20, borderWidth: 2, marginRight: 8 }}
                                                      className="rounded-full border-t-transparent border-white animate-spin"
                                                  />
                                                  Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Donate ₹{finalAmount.toFixed(2)}{" "}
                                                    {donationFrequency === "monthly" && "Monthly"}
                                                    <Heart className="ml-2 h-5 w-5" />
                                                </>
                                            )}
                                        </motion.button>

                                        {/* Security Message */}
                                        <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
                                            <Lock className="h-4 w-4 mr-1.5 text-gray-400" />
                                            <span>Secure payment via Razorpay</span>
                                        </div>

                                        {/* Back Button */}
                                        <div className="text-center mt-6">
                                            <button
                                                type="button"
                                                className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
                                                onClick={() => setStep(1)}
                                                disabled={loading}
                                            >
                                                <ArrowLeft className="inline h-4 w-4 mr-1" /> Go back
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Side: Donation Summary & Impact */}
                        <div className="md:w-1/3 bg-slate-100 p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-200">
                            <div className="space-y-8 sticky top-8"> {/* Make summary sticky */}
                                {/* Donation Summary Box */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                        Donation Summary
                                    </h3>
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                                            <span className="text-sm text-gray-600">Amount:</span>
                                            <span className="font-semibold text-lg text-gray-900">
                                                ₹{finalAmount > 0 ? finalAmount.toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Frequency:</span>
                                            <span className="font-medium capitalize text-sm text-gray-800">
                                                {donationFrequency.replace('-', ' ')}
                                            </span>
                                        </div>
                                            

                                    </div>
                                </div>

                                {/* Impact Section */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                        Your Potential Impact
                                    </h3>
                                    <motion.div
                                        className="space-y-3"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible" 
                                    >
                                        {impactStats.map((stat) => (
                                            <motion.div
                                                key={stat.id}
                                                className="bg-white p-4 rounded-lg border border-gray-200 flex items-center shadow-sm"
                                                variants={popUp}
                                            >
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                                    <Check className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {stat.value}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {stat.label}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>

                                {/* Why Donate Section */}
                                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-3">
                                        Why Donate?
                                    </h3>
                                    <ul className="text-sm text-gray-700 space-y-2.5">
                                        {[
                                            "Help reduce food waste in your community",
                                            "Support families in need with nutritious meals",
                                            "100% of donations fund our food sharing programs",
                                        ].map((reason, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div> 
                    </div> 
                </div> 
            </motion.div> 
        </div> 
    );
}