import { useState } from "react";
import { motion } from "framer-motion";
import {
    Heart,
    DollarSign,
    Calendar,
    CreditCard,
    Lock,
    Shield,
    Check,
    ArrowRight,
    ArrowLeft
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

// Sample donation options
const donationOptions = [
    { id: 1, amount: 100, label: "₹100" },
    { id: 2, amount: 250, label: "₹250" },
    { id: 3, amount: 500, label: "₹500" },
    { id: 4, amount: 1000, label: "₹1000" },
    { id: 5, amount: 2000, label: "₹2000" },
    { id: 6, amount: 0, label: "Custom" },
];

// Sample impact statistics
const impactStats = [
    { id: 1, value: "2,450", label: "Meals Provided" },
    { id: 2, value: "128", label: "Families Helped" },
    { id: 3, value: "1,200", label: "Kg Food Saved" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function SecretDonorPage() {
    const [selectedAmount, setSelectedAmount] = useState(
        donationOptions[2].amount
    );
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

    // Fetch user details if logged in
    useState(() => {
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
                            phone: user.phone || "8248777476" // Default placeholder
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }
            };
            fetchUserDetails();
        }
    }, []);

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        if (amount === 0) {
            setCustomAmount("");
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const finalAmount =
        selectedAmount === 0
            ? Number.parseFloat(customAmount) || 0
            : selectedAmount;

    const handlePayment = async () => {
        try {
            setLoading(true);
            
            // No need to convert since we're already using INR
            const { data } = await axios.post(
                `${API_BASE_URL}/api/pay/checkout`,
                { total: finalAmount }
            );
            
            if (!data.success || !data.order) {
                throw new Error("Failed to create payment order");
            }
            
            const options = {
                key: "rzp_test_Lvyx7TybXsDiFV", // Replace with your actual key in production
                amount: data.order.amount,
                currency: "INR",
                name: "Rescue Bite",
                description: `${donationFrequency} Donation`,
                order_id: data.order.id,
                
                handler: function (response) {
                    console.log("Razorpay response:", response);
                    
                    // Create a donation record
                    const token = localStorage.getItem("token");
                    const donationData = {
                        donor: token ? undefined : null, 
                        isAnonymous: !token,
                        amount: finalAmount,
                        currency: "INR", // Make sure this is INR
                        paymentMethod: "credit_card",
                        paymentId: response.razorpay_payment_id,
                        frequency: donationFrequency,
                        message: "Thank you for your donation!",
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    };
                    
                    // Send the donation to the server
                    axios.post(
                        `${API_BASE_URL}/api/donations`, 
                        donationData,
                        token ? { headers: { "x-auth-token": token } } : {}
                    )
                    .then((res) => {
                        console.log('Donation recorded:', res.data);
                        toast.success('Thank you for your donation!');
                        
                       
                        setStep(1);
                        setSelectedAmount(donationOptions[2].amount);
                        setCustomAmount("");
                        setDonationFrequency("one-time");
                        
                        // Show success page or redirect
                        navigate("/donor?success=true");
                    })
                    .catch((err) => {
                        console.error('Error recording donation:', err);
                        toast.error('Donation was processed but there was an error recording it. Please contact support.');
                    });
                },
                prefill: {
                    name: userDetails.name || "Generous Donor",
                    email: userDetails.email || "donor@example.com",
                    contact: userDetails.phone || "8248777476",
                },
                theme: { color: "#000000" },
            };
            
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                toast.error(`Payment failed: ${response.error.description}`);
            });
            
            rzp.open();
        } catch (error) {
            console.error("Payment failed:", error);
            toast.error("Payment initialization failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-6">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate("/customer")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
                
                <motion.div
                    className="text-center mb-12"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Become a Secret Food Hero
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your donation helps us reduce food waste and feed those
                        in need. 100% of your donation goes directly to
                        supporting our food sharing network.
                    </p>
                </motion.div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="md:flex">
                        {/* Donation Form */}
                        <div className="md:w-2/3 p-6 md:p-8">
                            {step === 1 ? (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeIn}
                                >
                                    <h2 className="text-xl font-semibold mb-6">
                                        Select Donation Amount
                                    </h2>

                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {donationOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                className={`py-3 rounded-md border ${
                                                    selectedAmount ===
                                                    option.amount
                                                        ? "border-black bg-black text-white"
                                                        : "border-gray-300 hover:border-gray-400"
                                                }`}
                                                onClick={() =>
                                                    handleAmountSelect(
                                                        option.amount
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedAmount === 0 && (
                                        <div className="mb-6">
                                            <label
                                                htmlFor="custom-amount"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Enter custom amount
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">₹</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    id="custom-amount"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                                    placeholder="Enter amount"
                                                    value={customAmount}
                                                    onChange={(e) =>
                                                        setCustomAmount(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                                            Donation Frequency
                                        </h3>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                                    checked={
                                                        donationFrequency ===
                                                        "one-time"
                                                    }
                                                    onChange={() =>
                                                        setDonationFrequency(
                                                            "one-time"
                                                        )
                                                    }
                                                />
                                                <span className="ml-2 text-sm">
                                                    One-time
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                                    checked={
                                                        donationFrequency ===
                                                        "monthly"
                                                    }
                                                    onChange={() =>
                                                        setDonationFrequency(
                                                            "monthly"
                                                        )
                                                    }
                                                />
                                                <span className="ml-2 text-sm">
                                                    Monthly
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                        onClick={() => setStep(2)}
                                        disabled={finalAmount <= 0}
                                    >
                                        Continue to Payment
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeIn}
                                >
                                    <h2 className="text-xl font-semibold mb-6">
                                        Payment Information
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Click the button below to proceed with your donation of ₹{finalAmount.toFixed(2)} {donationFrequency === "monthly" ? "monthly" : ""}. You'll be redirected to our secure payment gateway.
                                            </p>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                onClick={handlePayment}
                                                disabled={loading}
                                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                            >
                                                {loading ? (
                                                    "Processing..."
                                                ) : (
                                                    <>
                                                        Donate ₹{finalAmount.toFixed(2)}{" "}
                                                        {donationFrequency === "monthly"
                                                            ? "Monthly"
                                                            : ""}
                                                        <Heart className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-center text-sm text-gray-500 pt-2">
                                            <Shield className="h-4 w-4 mr-2" />
                                            <span>
                                                Secure payment processing
                                            </span>
                                        </div>

                                        <div className="text-center">
                                            <button
                                                type="button"
                                                className="text-sm text-gray-600 hover:text-black"
                                                onClick={() => setStep(1)}
                                            >
                                                Back to donation amount
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Donation Summary */}
                        <div className="md:w-1/3 bg-gray-50 p-6 md:p-8 border-t md:border-t-0 md:border-l">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">
                                        Your Donation
                                    </h3>
                                    <div className="bg-white p-4 rounded-lg border">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                Amount:
                                            </span>
                                            <span className="font-medium">
                                                ₹{finalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-gray-600">
                                                Frequency:
                                            </span>
                                            <span className="font-medium capitalize">
                                                {donationFrequency}
                                            </span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex justify-between items-center font-semibold">
                                                <span>Total:</span>
                                                <span>
                                                    ₹{finalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">
                                        Your Impact
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
                                                className="bg-white p-3 rounded-lg border flex items-center"
                                                variants={fadeIn}
                                            >
                                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                    <Check className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">
                                                        {stat.value}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {stat.label}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>

                                <div className="bg-white p-4 rounded-lg border">
                                    <h3 className="font-medium mb-2">
                                        Why Donate?
                                    </h3>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                                            <span>
                                                Help reduce food waste in your
                                                community
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                                            <span>
                                                Support families in need with
                                                nutritious meals
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                                            <span>
                                                100% of donations go directly to
                                                our programs
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
