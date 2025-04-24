"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService"; 


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  useEffect(() => {

    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    
    // Check if there's a current session from a query parameter (for development)
    const params = new URLSearchParams(window.location.search);
    if (params.get('clear') === 'true') {
      localStorage.clear();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Login - Attempting login for:", email); 
      console.log("Login - Not a test account, trying real API login");
      const response = await login({ email, password });
      
      console.log("Login - API response:", response.success ? "Success" : "Failed");
      
      if (response.success) {
        router.push('/dashboard');
      } else {
        throw new Error(response.success ? "" : 'Login failed');
      }
    } catch (error: any) {
      console.error("Login - Error:", error);
      setError(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F1215] flex items-center justify-center font-poppins py-16">
      <div className="w-full max-w-[1400px] h-auto lg:h-[750px] mx-4 lg:mx-auto flex flex-col lg:flex-row shadow-2xl overflow-hidden rounded-xl">
        {/* Left Section - Purple background with message - 40% width */}
        <div className="w-full lg:w-2/5 bg-[#683BAB] text-white p-10 lg:p-[60px] flex flex-col justify-between relative overflow-hidden">
          <div className="max-w-md">
            <h1 className="text-4xl lg:text-5xl font-normal -tracking-[0.05em] mb-6">
              Welcome back to <br /> Your Music Dashboard
            </h1>
            <p className="text-lg opacity-80 mb-10">
              Manage your music, track performance, and grow your audience with our all-in-one music distribution platform.
            </p>
          </div>

          <div className="max-w-md">
            {/* Rating stars */}
            <div className="flex mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-7 h-7 text-yellow-400 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-base mb-10">
              "This platform has completely transformed how I distribute and manage my music. The analytics are comprehensive and the interface is intuitive."
            </p>

            {/* Testimonial */}
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-purple-800 mr-4 overflow-hidden">
                <img
                  src="/james.png"
                  alt="James Hetfield"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">James Hetfield</p>
                <p className="text-sm opacity-80">Lead Vocal, Metallica</p>
              </div>
            </div>
          </div>

          {/* Top left curved decoration - 50% opacity */}
          <div className="absolute top-0 left-0 opacity-50 w-48 h-48 -translate-x-28 -translate-y-28">
            <div className="w-full h-full border-4 border-white rounded-full"></div>
          </div>

          {/* Bottom right curved decoration - white stroke */}
          <div className="absolute bottom-0 right-0 w-96 h-96 translate-x-48 translate-y-58">
            <div className="w-full h-full border-4 border-white rounded-full"></div>
          </div>
        </div>

        {/* Right Section - Login Form - 60% width */}
        <div className="w-full lg:w-3/5 bg-[#161A1F] flex items-center justify-center p-10 lg:p-[60px]">
          <div className="w-full max-w-md">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4 text-white">
              Welcome back
            </h2>
            <p className="text-gray-400 text-sm mb-12">
              Log in to access your dashboard and continue managing your music catalog
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-8">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-3"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                  <input
                    type="email"
                    id="email"
                    className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      className="h-5 w-5 text-gray-500 hover:text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      {showPassword ? (
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      ) : (
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      )}
                      {showPassword ? (
                        <path d="M5.664 4.506A10.013 10.013 0 0110 3c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-1.423 0-2.797-.289-4.059-.812l1.564-1.562A4 4 0 0010 14c2.21 0 4-1.79 4-4a4.008 4.008 0 00-5.946-3.491L5.664 4.506z" />
                      ) : (
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      )}
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-700 bg-gray-800 rounded"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-3 block text-sm text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/auth/forget-password"
                    className="text-sm font-medium text-purple-500 hover:text-purple-400"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer flex justify-center h-[60px] items-center rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 mt-8 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-purple-500 hover:text-purple-400"
              >
                Create free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
