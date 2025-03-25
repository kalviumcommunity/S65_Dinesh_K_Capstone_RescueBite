"use client";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const GOOGLE_AUTH_URL = `http://localhost:5000/auth/callback/google`;

const GoogleLogo = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 48 48"
    >
        <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
            fill="#4CAF50"
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.801 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
    </svg>
);

export default function AuthForms() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userType, setUserType] = useState("customer");
    const [error, setError] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [address, setAddress] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const defaultTab = location.pathname === "/auth/signup"
        ? "signup"
        : location.pathname === "/auth/login"
            ? "login"
            : "login";

    const handleGoogleSignIn = () => {
        const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(GOOGLE_AUTH_URL)}` +
            `&response_type=code` +
            `&scope=profile email` +
            `&state=${btoa(
                JSON.stringify({
                    origin: window.location.origin,
                    redirectPath: "/customer",
                })
            )}`;

        window.location.href = authUrl;
    };

    const onLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email,
                password,
                accountType: userType === "owner" ? "organization" : "individual"
            });

            localStorage.setItem("token", response.data.token);
            axios.defaults.headers.common["x-auth-token"] = response.data.token;

            
            alert("Welcome back!");

            
            if (response.data.user.accountType === "individual") {
                navigate("/customer");
            } else {
                navigate("/restaurant");
            }
        } catch (error) {
            const message = error.response?.data?.message || "Login failed. Please check your credentials.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onSignupSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const userData = {
                firstName,
                lastName,
                email,
                password,
                phone,
                bio,
                address,
                accountType: userType === "owner" ? "organization" : "individual"
            };

            if (userType === "owner") {
                userData.businessName = `${firstName} ${lastName}'s Business`;
                userData.businessType = "restaurant";
                userData.businessAddress = address;
            }

            const response = await axios.post(`${API_BASE_URL}/register`, userData);

            localStorage.setItem("token", response.data.token);
            axios.defaults.headers.common["x-auth-token"] = response.data.token;

           
            if (response.data.user.accountType === "individual") {
                navigate("/customer");
            } else {
                navigate("/restaurant");
            }
        } catch (error) {
            const message = error.response?.data?.message || "Signup failed. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const GoogleSignInButton = ({ isSignup }) => (
        <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-3"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
        >
            <GoogleLogo />
            {isLoading
                ? "Signing in..."
                : isSignup
                  ? "Sign up with Google"
                  : "Sign in with Google"}
        </Button>
    );

    return (
        <div className="w-full max-w-md mx-auto mt-20">
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log in</TabsTrigger>
                    <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Log in</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={onLoginSubmit}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <Tabs
                                        defaultValue={userType}
                                        className="w-full"
                                    ></Tabs>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Logging in..." : "Login"}
                                    </Button>

                                    <GoogleSignInButton isSignup={false} />
                                </div>
                            </form>
                            {error && (
                                <div className="text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account? Sign up
                            </p>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="signup">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create an account</CardTitle>
                            <CardDescription>
                                Enter your details to create a new account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={onSignupSubmit}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">
                                                First name
                                            </Label>
                                            <Input
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) =>
                                                    setFirstName(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">
                                                Last name
                                            </Label>
                                            <Input
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) =>
                                                    setLastName(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">
                                            Password
                                        </Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Your phone number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Tell us about yourself"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Your address"
                                        />
                                    </div>
                                    <Tabs
                                        defaultValue={userType}
                                        className="w-full"
                                    >
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger
                                                value="customer"
                                                onClick={() =>
                                                    setUserType("customer")
                                                }
                                            >
                                                Individual
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="owner"
                                                onClick={() =>
                                                    setUserType("owner")
                                                }
                                            >
                                                Organization
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Creating account..."
                                            : "Create account"}
                                    </Button>

                                    <GoogleSignInButton isSignup={true} />
                                </div>
                            </form>
                            {error && (
                                <div className="text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account? Log in
                            </p>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
